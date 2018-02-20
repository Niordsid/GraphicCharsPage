//------------------------------------------------------
//  GLOBAL VARIABLES
//------------------------------------------------------

var students = [];
var sessions = [];
var unique_array = [];
var issues = [];

var raw_issues_by_student = {};
var studentIssues = {};
var filters = {};

var graphic_data = [];
var graphic_categories = [];

var selected_student = null;
var selected_session = null;
var selected_issue = null;

var charta = null;


function initialize() {
  renderEmptyFilters();

  getListStudents(function(_students) {
    students = _students;
    renderStudents();
  });

};

function getListStudents(callback) {
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

function getStudentsIssues(student_id, callback) {
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

function renderEmptyFilters() {
  $('#session').prop('disabled', true);
  $('#session').html('');
  $('#session').multiselect('rebuild');
  $('#issues-list').prop('disabled', true);
  $('#issues-list').html('');
  $('#issues-list').multiselect('rebuild');
}

function renderStudents() {
  let html = "";
  for (let i = 0; i < students.length; i++) {
    html += '<option value="' + students[i]['Student'] + '">' + students[i]['Name'] + "</option>";
  }
  $('#student').append(html);
};

function listOfSessions(listsessions) {
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

function renderSession(data) {
  var copy_sessions_data = data;
  $('#session').html('');
  let html = "";
  sessions = [];
  unique_array = [];
  let totalSessions = listOfSessions(copy_sessions_data);
  for (i = 0; i < totalSessions.length; i++) {
    html += '<option value="' + totalSessions[i] + '">' + totalSessions[i] + "</option>";
  }
  $('#session').append(html);
  $('#session').multiselect('rebuild');
}; // Render the sessions list before apply the filters

function renderIssues(data) {
  let keys_raw_data = Object.keys(data);
  $('#issues-list').html('');
  let html = "";
  for (var i in keys_raw_data) {
    var issue = keys_raw_data[i] // "e.g. lack of performance"
    html += '<option value="' + issue + '">' + issue + "</option>";
  }
  $('#issues-list').append(html);
  $('#issues-list').multiselect('rebuild');
};

function generateChar(name_series, data_series) {

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

function plotGraphic() {
  if (charta) {
    charta.destroy();
  }
  let raw_data = studentIssues;
  let raw_filters = filters;
  if ($("#Manually").is(':checked')) {
    kindfilter = ["Human_Observation"];
    raw_filters.KindObservation = kindfilter;
  } else if ($("#Automatically").is(':checked')) {
    kindfilter = ["Digital_Observation"];
    raw_filters.KindObservation = kindfilter;
  }
  let data_filtered = applyFilters(raw_data, raw_filters);
  formatToPlot(data_filtered);
};

function buildFilters(rawData) {

  let copy_raw_data = rawData;
  // ... build filters list with events
  buildIssueFilters(copy_raw_data); // modify the issue filters list
}

function eventsFilters(dataIssues) {
  $("#issues-list").change(function() {
    if ($('#issues-list').val().length > 0) {
      let issues_values = $('#issues-list').val();
      var data_issue_filter = getIssuesFromData(dataIssues, issues_values);
      filters.Issues = issues_values;
      let kindfilter = [];
      buildSessionFilters(data_issue_filter);
      $(".radio-input").change(function() {
        buildSessionFilters(data_issue_filter);
      });
    } else {
      console.log("No seleccione nada le mando los datos sin filtros");
    }
  });
}

function buildIssueFilters(issues) {
  var listofIssues = issues

  renderIssues(listofIssues); // Render the list of Issues that the student has presented
  eventsFilters(listofIssues);
}

function buildSessionFilters(data) {
  let raw_data_issues = data;
  if ($("#Manually").is(':checked')) {
    kindfilter = ["Human_Observation"];
    filters.KindObservation = kindfilter;
    var data_kindobservation_filter = getIssueTypeData(raw_data_issues, kindfilter);
    renderSession(data_kindobservation_filter);
  } else if ($("#Automatically").is(':checked')) {
    kindfilter = ["Digital_Observation"];
    filters.KindObservation = kindfilter;
    var data_kindobservation_filter = getIssueTypeData(raw_data_issues, kindfilter);
    renderSession(data_kindobservation_filter);
  }

  $('#session').change(function() {
    let selected_sessions = $('#session').val();
    filters.Sessions = selected_sessions;
  });

}

function sessionsFiltered(raw_data) {
  let presented_sessions = [];
  let ordered_sessions = [];
  var categories = Object.keys(raw_data);

  for (var i in categories) {
    let observartion = raw_data[categories[i]];
    let kind_observation = Object.keys(observartion);
    for (var key_observation in kind_observation) {
      var total_sessions = observartion[kind_observation[key_observation]];
      var key_sessions = Object.keys(total_sessions);
      for (var index_sessions in key_sessions) {
        presented_sessions.push(key_sessions[index_sessions]);
        for (let i = 0; i < presented_sessions.length; i++) {
          if (ordered_sessions.indexOf(presented_sessions[i]) == -1) {
            ordered_sessions.push(presented_sessions[i])
          }
        }
      }
    }
  }
  return ordered_sessions;
}

function formatToPlot(data) {
  let keys_sessions = sessionsFiltered(data);
  let presented_sessions = [];
  var categories = Object.keys(data);
  let raw_seri = {};
  let seri = [];

  for (var i in categories) {
    let observartion = data[categories[i]];
    let kind_observation = Object.keys(observartion);
    for (var key_observation in kind_observation) {
      var total_sessions = observartion[kind_observation[key_observation]];
      var key_sessions = Object.keys(total_sessions);
      for (let i = 0; i < keys_sessions.length; i++) {
        if (total_sessions.hasOwnProperty(keys_sessions[i])) {

        } else {
          total_sessions[keys_sessions[i]] = "0";
        }
      }
      let sess_val = Object.entries(total_sessions);
      for (let hi = 0; hi < sess_val.length; hi++) {
        let arry = sess_val[hi];
        if (raw_seri[arry[0]]) {
          raw_seri[arry[0]].push(parseFloat(arry[1]));
        } else {
          raw_seri[arry[0]] = [parseFloat(arry[1])];
        }
      }


    }
  }
  let keys_raw_seri = Object.keys(raw_seri);
  for (let session = 0; session < keys_raw_seri.length; session++) {
    seri.push({
      name: keys_raw_seri[session],
      data: raw_seri[keys_raw_seri[session]]
    });
  }
  generateChar(categories, seri);

}

function applyFilters(data, filters) {
  if (typeof filters.Issues === "undefined") {
    var issuesData = data;
  } else {
    var issuesData = getIssuesFromData(data, filters.Issues); // get a copy the data just with the selected issues
  }
  var issueTypeData = getIssueTypeData(issuesData, filters.KindObservation); // another copy
  // get or create (value is zero) the session value for each issue type on each issue
  if (typeof filters.Sessions === "undefined") {
    var sessionsData = issueTypeData;
  } else {
    var sessionsData = getSessionsData(issueTypeData, filters.Sessions);
  }
  return sessionsData;

}

// Processes to apply the selected filters obtain the required data

function getIssuesFromData(data, issuesFilters) { // Filter de data by Issues
  var copyIssues = {};
  let issueKeys = Object.keys(data);
  if (issuesFilters.length == 0) {
    console.log("No hay filtro ");
  } else {
    for (var i in issuesFilters) {
      let issuFilt = issuesFilters[i];
      if (data.hasOwnProperty(issuFilt)) {
        copyIssues[issuFilt] = data[issuFilt];
      } else {
        alert("Invalid filter for the data");
      }
    }
  }

  return copyIssues;
}

function getIssueTypeData(data, kindfilters) {
  var copyIssueType = {};
  let issueKeys = Object.keys(data);
  for (var i in issueKeys) {
    let issue = data[issueKeys[i]];
    let issueCopy = copyIssueType[issueKeys[i]] = {};
    for (var i in kindfilters) {
      let kindfilt = kindfilters[i];
      if (issue.hasOwnProperty(kindfilt)) {
        issueCopy[kindfilt] = issue[kindfilt];
      } else {
        alert("No data found for the Selected filter configuration");
      }
    }
  }
  return copyIssueType;
}

function getSessionsData(data, sessionFilters) { // Filter de data by Sessions
  var copySessions = {};

  let issueKeys = Object.keys(data);
  for (var i in issueKeys) { // iterate issues
    let issue = data[issueKeys[i]];
    let issueCopy = copySessions[issueKeys[i]] = {};
    typeKeys = Object.keys(data[issueKeys[i]]);
    for (var i in typeKeys) {
      let type = issue[typeKeys[i]];
      console.log(type);
      var typeCopy = issueCopy[typeKeys[i]] = {};
      for (var i in sessionFilters) {
        let session = sessionFilters[i];
        if (type.hasOwnProperty(session)) {
          typeCopy[session] = type[session];
        } else {
          typeCopy[session] = 0;
        }
      }
    }
  }
  return copySessions;
}

//------------------------------------------------------
//  DOCUMENT READY
//------------------------------------------------------
$(document).ready(function() {

  //------------------------------------------------------
  //  EVENTS
  //------------------------------------------------------
  $('#student').change(function() {
    filters = {};
    selected_student = $(this).val() !== "" ? $(this).val() : null;
    $('#session').prop('disabled', true); // Disabled sessions list when the user change the Student Selected
    $('#issues-list').prop('disabled', true); // Disabled isues list when the user change the Student Selected
    if (selected_student) {
      getStudentsIssues(selected_student, function(_data) {
        raw_issues_by_student = _data;
        studentIssues = _data;
        if (Object.keys(raw_issues_by_student)[0] == "Error") {
          alert("No Data has been found for the Student Selected");
          renderEmptyFilters();
        } else {
          buildFilters(raw_issues_by_student);          
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

  //------------------------------------------------------
  //  INITIALIZATION
  //------------------------------------------------------
  initialize();
});
