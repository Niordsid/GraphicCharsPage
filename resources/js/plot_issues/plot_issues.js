//------------------------------------------------------
//  GLOBAL VARIABLES
//------------------------------------------------------

var students = [];
var sessions = [];
var unique_array = [];
var issues = [];
var data = [];
var graphic_data = [];
var graphic_series = [];

var selected_student = null;
var selected_session = null;
var selected_issue = null;

var charta = null;


var initialize = function() {
  renderEmptyFilters();

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

var renderEmptyFilters = function() {
  $('#session').prop('disabled', true);
  $('#session').html('');
  $('#session').multiselect('rebuild');
  $('#issues-list').prop('disabled', true);
  $('#issues-list').html('');
  $('#issues-list').multiselect('rebuild');
}

var renderStudents = function() {
  let html = "";
  for (let i = 0; i < students.length; i++) {
    html += '<option value="' + students[i]['Student'] + '">' + students[i]['Name'] + "</option>";
  }
  $('#student').append(html);
};

var listOfSessions = function(listsessions) {
  let data_student = Object.keys(listsessions);
  for (let i = 0; i < data_student.length; i++) {
    let data_filter = listsessions[data_student[i]];
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
  return unique_array;
}

var renderSession = function(data) {
  $('#session').html('');
  let html = "";
  sessions = [];
  unique_array = [];
  let totalSessions = listOfSessions(data);
  for (i = 0; i < totalSessions.length; i++) {
    html += '<option value="' + totalSessions[i] + '">' + totalSessions[i] + "</option>";
  }
  $('#session').append(html);
  $('#session').multiselect('rebuild');
};

var renderIssues = function(data) {
  $('#issues-list').html('');
  let html = "";
  let issue_list = Object.keys(data);
  issue_list.forEach(key => {
    if (Object.keys(data[key]).length > 0) {
      //tiene cosas por dentro
    } else {
      let key_to_delete = key;
      let index = issue_list.indexOf(key_to_delete);
      if (index > -1) {
        issue_list.splice(index, 1);
      }
    }
  })
  for (let i = 0; i < issue_list.length; i++) {
    html += '<option value="' + issue_list[i] + '">' + issue_list[i] + "</option>";
  }
  $('#issues-list').append(html);
  $('#issues-list').multiselect('rebuild');
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

var findbyKey = function(issu, delt) {
  let initial_data = JSON.parse(JSON.stringify(issu));
  let name_issue = Object.keys(initial_data);
  for (let i = 0; i < name_issue.length; i++) {
    delete initial_data[name_issue[i]][delt];
  }
  let observation_keys = Object.keys(initial_data);
  let raw_seri = {};
  let seri = [];
  //--------------- Check the total Sessions and check each issue session, if any session is not present on the issue session, the value of the session will be added with a initial value 0
  for (let i = 0; i < observation_keys.length; i++) {
    let list_issue = initial_data[observation_keys[i]];
    Object.keys(list_issue).forEach(function(key) {
      let sessi = list_issue[key];

      let sessionlist = listOfSessions(issu);
      let object_sessions = {};
      for (let i = 0; i < sessionlist.length; i++) {
        object_sessions[i] = sessionlist[i];
      }

      for (let i = 0; i < sessionlist.length; i++) {
        if (sessi.hasOwnProperty(sessionlist[i])) {

        } else {
          sessi[sessionlist[i]] = "0";
        }
      }
      let sess_val = Object.entries(sessi);
      for (let hi = 0; hi < sess_val.length; hi++) {
        let arry = sess_val[hi];
        if (raw_seri[arry[0]]) {
          raw_seri[arry[0]].push(parseFloat(arry[1]));
        } else {
          raw_seri[arry[0]] = [parseFloat(arry[1])];
        }
      }
    });
  }
  //----------------
  let keys_raw_seri = Object.keys(raw_seri);
  for (let session = 0; session < keys_raw_seri.length; session++) {
    seri.push({
      name: keys_raw_seri[session],
      data: raw_seri[keys_raw_seri[session]]
    });
  }
  renderIssues(initial_data);
  renderSession(initial_data);
  name_issue.forEach(key => {
    if (Object.keys(initial_data[key]).length > 0) {
      //tiene cosas por dentro
    } else {
      let key_to_delete = key;
      let index = name_issue.indexOf(key_to_delete);
      if (index > -1) {
        name_issue.splice(index, 1);
      }
    }
  })

  graphic_data = seri;
  graphic_series = name_issue;

}

var renderByFilterSelected = function(raw_data) {
  if ($("#manually").is(':checked') && !$("#automatically").is(':checked')) {
    findbyKey(raw_data, "Digital_Observation");
  } else if ($("#automatically").is(':checked') && !$("#manually").is(':checked')) {
    findbyKey(raw_data, "Human_Observation");
  } else {
    alert("Please Select a Filter (Auto/Manual)");
  }
}

var plotGraphic = function() {
  if (charta) {
    charta.destroy();
  }
  generateChar(graphic_series, graphic_data);
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
        if (Object.keys(data)[0] == "Error") {
          alert("No Data has been found for the Student Selected");
          renderEmptyFilters();
        } else {
          renderByFilterSelected(data); // This function render the data on the fields
          let clone = data;
          $('.check-input').change(function() {
            renderByFilterSelected(clone); // This function should be render the data but the data doesnt exist
          });

        }
      });
    }
  });



  $('#session').multiselect({
    maxHeight: 400,
    buttonWidth: '100%',
    includeSelectAllOption: true,
    enableFiltering: true
  });

  $('#issues-list').multiselect({
    maxHeight: 400,
    buttonWidth: '100%',
    includeSelectAllOption: true,
    enableFiltering: true
  });

  $('.check-input').on('change', function() {
    $('.check-input').not(this).prop('checked', false);
  });

  //------------------------------------------------------
  //  INITIALIZATION
  //------------------------------------------------------
  initialize();
});
