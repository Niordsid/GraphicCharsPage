//------------------------------------------------------
//  GLOBAL VARIABLES
//------------------------------------------------------

var students = [];
var sessions = [];
var unique_array = [];
var issues = [];
var data = [];

var selected_student = null;
var selected_session = null;
var selected_issue = null;

var charta = null;


var initialize = function() {
  $('#session').prop('disabled', true);
  $('#issues-list').prop('disabled', true);


  getListStudents(function(_students) {
    students = _students;
    renderStudents();
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

var renderSession = function(data) {
  let html = "";
  sessions = [];
  unique_array = [];
  let data_student = Object.keys(data);
  for (let i = 0; i < data_student.length; i++) {
    let data_filter = data[data_student[i]];
    Object.keys(data_filter).forEach(function(key) {
      let sessions_object = data_filter[key];
      let sess_array = Object.keys(sessions_object);
      for (let i = 0; i < sess_array.length; i++) {
        sessions.push(sess_array[i]);
        for (let i = 0; i < sessions.length; i++) {
          if (unique_array.indexOf(sessions[i]) == -1) {
            unique_array.push(sessions[i])
          }
        }
      }
    });
  }

  for (i = 0; i < unique_array.length; i++) {
    html += '<option value="' + unique_array[i] + '">' + unique_array[i] + "</option>";
  }
  $('#session').append(html);
};

var renderIssues = function(data) {
  let html = "";
  let issue_list = Object.keys(data);
  for (let i = 0; i < issue_list.length; i++) {
    html += '<option value="' + issue_list[i] + '">' + issue_list[i] + "</option>";
  }
  $('#issues-list').append(html);
};

var generateChar = function(name_series, data_series) {
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



  $('#student').change(function() {
    selected_student = $(this).val() !== "" ? $(this).val() : null;
    $('#session').prop('disabled', true); // Disabled sessions list when the user change the Student Selected
    $('#issues-list').prop('disabled', true); // Disabled isues list when the user change the Student Selected
    if (selected_student) {
      getStudentsIssues(selected_student, function(_data) {
        data = _data;
        $('#session').prop('disabled', false);
        $('#session').html('<option value="">Choose Session</option>');
        $('#issues-list').prop('disabled', false);
        $('#issues-list').html('<option value="">Choose Issue</option>');
        if ($("#manually").is(':checked')) {
          renderIssues(data);
          renderSession(data);
        } else if ($("#automatically").is(':checked')) {
          renderIssues(data);
          renderSession(data);
        } else {

        }



        // if ($('#manually').is(':checked')) {
        //   let filter = "Human_Observation";
        //   let remove = "Digital_Observation";
        //   findbyKey(data, filter, remove);
        // } else if ($('#automatically').is(':checked')) {
        //   let filter = "Digital_Observation";
        //   let remove = "Human_Observation";
        //   findbyKey(data, filter, remove);
        // } else {
        //   console.log("You should select a kind of filter");
        // }
        // if (_sessions.length) {
        //   sessions = _sessions;
        //   $('#session').prop('disabled', false);
        //   renderSession();
        // }
      });
    }
  });





  //------------------------------------------------------
  //  INITIALIZATION
  //------------------------------------------------------
  initialize();
});
