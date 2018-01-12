//------------------------------------------------------
//  GLOBAL VARIABLES
//------------------------------------------------------

var students = [];
var sessions = [];
var teachers = [];
var issues = [];

var selected_student = null;


var initialize = function() {


  getListStudents(function(_students) {
    students = _students;
    renderStudents();
  });

  getListTeachers(function(_teachers) {
    teachers = _teachers;
    renderTeachers();
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

var getListTeachers = function(callback) {
  $.ajax({
      url: "https://api.arca.acacia.red/list/Teacher",
      method: 'GET',
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

var renderStudents = function() {
  let html = "";
  for (let i = 0; i < students.length; i++) {
    html += '<option value="' + students[i]['Student'] + '">' + students[i]['Name'] + "</option>";
  }
  $('#student').append(html);
}

var renderTeachers = function() {
  let html = "";
  for (let i = 0; i < teacher.length; i++) {
    html += '<option value="' + teachers[i]['Teacher'] + '">' + teachers[i]['Name'] + "</option>";
  }
  $('#teacher').append(html);
}

var renderIssues = function() {
  var Content = document.getElementById('issues-list');
  //console.log(issues);
  for (let i = 0; i < issues.length; i++) {
    DynamicContent(Content, i);
  }
}

var DynamicContent = function(content, index) {
  var dynDiv = document.createElement("div");
  dynDiv.id = "_" + issues[index]['Issue'];
  content.appendChild(dynDiv);
  var label = document.createElement("label");
  label.className = "issueslist";
  label.innerHTML = issues[index]['Issue'];
  dynDiv.appendChild(label);
  var dynSlider = document.createElement("div");
  dynDiv.appendChild(dynSlider);
  var slider = document.createElement("input");
  slider.type = "range";
  slider.min = "0";
  slider.max = "1";
  slider.value = "0";
  slider.class = "slider";
  slider.className = "slider"
  slider.step = 0.1;
  slider.onchange = updateSliders;
  slider.id = issues[index]['Issue'];
  var span = document.createElement("span");
  span.className = "range-slider__value"
  span.innerHTML = 0;
  span.id = "value" + index;
  dynSlider.appendChild(slider);
  dynSlider.appendChild(span);
}

var submitData = function() {
  let duration = $("#duration").val();
  let sesion = $("#session").val();
  let data = $(".slider");
  let selected_teacher = $("#teacher").val();
  let value_issues = {};
  for (let i = 0; i < data.length; i++) {
    let value = $("#" + data[i].id).val();
    if (value != "0") {
      value_issues[data[i].id] = value
    } else {}

  }
  buildData(duration, sesion, selected_student, selected_teacher, value_issues);
}

var updateSliders = function() {
  let dat = $(".slider");
  for (let i = 0; i < dat.length; i++) {
    $("#value" + i).html($("#" + dat[i].id).val());
  }
}

var buildData = function(duration, sess, student, teacher, isues, callback) {

  if (teacher != null) {
    if (student != null) {
      if (duration != null) {
        if (sess != null) {
          if (isues != null) {
            let date = new Date();
            let time = date.toISOString();
            time = time.substring(0, time.length - 5);
            $.ajax({
                type: "POST",
                url: 'https://api.arca.acacia.red/insert/student_issue',
                beforeSend: function(xhr) {
                  xhr.setRequestHeader("Content-Type", "application/json");
                },
                data: {
                  "Date_Time": time,
                  "Duration": duration,
                  "Session": sess,
                  "Scenario": "Affective_States_Automatic_Detection_",
                  "Student": student,
                  "Teacher": teacher,
                  "Issue": isues
                },
                dataType: "json"
              })
              .done(callback)
              .fail(function(error) {
                console.error('Error', error);
              });
          } else {}
        } else {

        }
      } else {

      }
    } else {

    }
  } else {

  }

}


//------------------------------------------------------
//  DOCUMENT READY
//------------------------------------------------------
$(document).ready(function() {
  $('input.timepicker').timepicker({
    timeFormat: 'HH:mm:ss'
  });
  //------------------------------------------------------
  //  EVENTS
  //------------------------------------------------------

  $('#student').change(function() {
    selected_student = $(this).val() !== "" ? $(this).val() : null;
    $('#session').prop('disabled', true);

    if (selected_student) {
      getListSessions(selected_student, function(_sessions) {
        if (_sessions.length != 0) {
          let html = ''
          $.each(_sessions, function(i, item) {
            let session = item.Session
            html += '<option value="' + session + '">' + session + '</option>';
          });
          $('#session').html(html);
          $('#session').val(_sessions[0].Session);
          $('#session').multiselect('rebuild');
        } else {
          $('#session').html('');
          $('#session').multiselect('rebuild');
        }
      });
      $('#session').trigger('change');
    } else {
      $('#session').html('');
      $('#session').multiselect('rebuild');
    }
  });

  $('#session').multiselect({
    maxHeight: 400,
    buttonWidth: '100%',
    includeSelectAllOption: true,
    enableFiltering: true
  });




  //-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
  //  INITIALIZATION
  //------------------------------------------------------
  initialize();
});
