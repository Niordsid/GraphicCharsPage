//------------------------------------------------------
//  GLOBAL VARIABLES
//------------------------------------------------------

var students = [];
var sessions = [];
var issues = [];
var data = [];

var selected_student = null;
var selected_session = null;
var selected_issue = null;

var charta = null;


var initialize = function() {
  $('#session').prop('disabled', true);


  getListStudents(function(_students) {
    students = _students;
    renderStudents();
  });

  getListIssues(function(_issues) {
    issues = _issues;
    renderIssues();
  });

};

var getListStudents = function(callback) {
  $.ajax({
      url: "https://api.arca.acacia.red/list/Student",
      method: 'GET',
      dataType: "json"
    })
    .done(callback)
    .fail(function(error) {
      console.error('Error', error);
    });
};

var getListSessions = function(student_id, callback) {
  $.ajax({
      url: "https://api.arca.acacia.red/list/sessions_of_student",
      method: 'POST',
      beforeSend: function(xhr) {
        xhr.setRequestHeader("Content-Type", "application/json");
      },
      data: JSON.stringify([student_id]),
      dataType: "json"
    })
    .done(callback)
    .fail(function(error) {
      console.error('Error', error);
    });
};

var getListIssues = function(callback) {
  $.ajax({
      url: "https://api.arca.acacia.red/list/Issue",
      method: 'GET',
      dataType: "json"
    })
    .done(callback)
    .fail(function(error) {
      console.error('Error', error);
    });
};

var getStudentsIssues = function(student_id, callback) {
  $.ajax({
      url: "https://api.arca.acacia.red/plot/issue_student",
      method: 'POST',
      beforeSend: function(xhr) {
        xhr.setRequestHeader("Content-Type", "application/json");
      },
      data: JSON.stringify([student_id]),
      dataType: "json"
    })
    .done(callback)
    .fail(function(error) {
      console.error('Error', error);
    });
};

var renderStudents = function() {
  let html = "";
  for (let i = 0; i < students.length; i++) {
    html += '<option value="' + students[i]['Student'] + '">' + students[i]['Name'] + "</option>";
  }
  $('#student').append(html);
};

var renderSession = function() {
  let html = '<option value="">Choose Session</option>';
  for (let i = 0; i < sessions.length; i++) {
    html += '<option value="' + sessions[i]['Session'] + '">' + sessions[i]['Session'] + "</option>";
  }
  $('#session').html(html);
};

var renderIssues = function() {
  let html = "";
  for (let i = 0; i < issues.length; i++) {
    html += '<option value="' + issues[i]['Issue'] + '">' + issues[i]['Issue'] + "</option>";
  }
  $('#issues-list').append(html);
};



var generateChar = function(name_series, data_series) {
  // console.log("series", name_series);
  // console.log("datos=", data_series);
  charta = new Highcharts.chart('container', {
    chart: {
      type: 'column',
      inverted: true
    },
    title: {
      text: 'Issues presented by Student'
    },
    subtitle: {
      style: {
        position: 'absolute',
        right: '0px',
        bottom: '10px'
      }
    },
    legend: {
      layout: 'vertical',
      align: 'right',
      verticalAlign: 'top',
      x: -40,
      y: 80,
      floating: true,
      borderWidth: 1,
      backgroundColor: ((Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'),
      shadow: true
    },
    xAxis: {
      categories: name_series
    },
    yAxis: {
      title: {
        text: 'Value of the Issue'
      },
      labels: {
        formatter: function() {
          return this.value;
        }
      },
      min: 0,
      max: 1
    },
    plotOptions: {
      area: {
        fillOpacity: 0.5
      }
    },
    series: data_series
  });
}

var findbyKey = function(issu, filt, delt) {
  let name_issue = Object.keys(issu);
  for (let i = 0; i < name_issue.length; i++) {
    delete issu[name_issue[i]][delt];
  }
  let observation_keys = Object.keys(issu);
  let seri = [];
  for (let i = 0; i < observation_keys.length; i++) {
    let list_issue = issu[observation_keys[i]];
    Object.keys(list_issue).forEach(function(key) {
      let sessi = list_issue[key];
      let sess_val = Object.entries(sessi);
      for (let hi = 0; hi < sess_val.length; hi++) {
        let arry = sess_val[hi];
        seri.push({
          name: arry[0],
          data: parseFloat(arry[1])
        });

      }


    });
  }

  generateChar(name_issue, seri);

}
var plotGraphic = function() {
  getStudentsIssues(selected_student, function(_data) {
    data = _data;
    if ($('#manually').is(':checked')) {
      let filter = "Human_Observation";
      let remove = "Digital_Observation";
      findbyKey(data, filter, remove);
    } else if ($('#automatically').is(':checked')) {
      let filter = "Digital_Observation";
      let remove = "Human_Observation";
      findbyKey(data, filter, remove);
    } else {
      console.log("You should select a kind of filter");
    }

  });


  if (charta) {
    charta.destroy();
  }


};
//------------------------------------------------------
//  DOCUMENT READY
//------------------------------------------------------
$(document).ready(function() {

  //------------------------------------------------------
  //  EVENTS
  //------------------------------------------------------

  $('.check-input').on('change', function() {
    $('.check-input').not(this).prop('checked', false);
  });

  $('#student').change(function() {
    selected_student = $(this).val() !== "" ? $(this).val() : null;


    $('#session').prop('disabled', true);
    $('#session').html('<option value="">Choose Session</option>');
    if (selected_student) {
      getListSessions(selected_student, function(_sessions) {

        if (_sessions.length) {
          sessions = _sessions;
          $('#session').prop('disabled', false);
          renderSession();
        }


      });

    }


  });

  $('#session').change(function() {
    selected_session = $(this).val() !== "" ? $(this).val() : null;

  });




  //------------------------------------------------------
  //  INITIALIZATION
  //------------------------------------------------------
  initialize();
});
