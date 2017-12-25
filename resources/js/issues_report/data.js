//------------------------------------------------------
//  GLOBAL VARIABLES
//------------------------------------------------------

var students = [];
var sessions = [];
var duration = [];
var teachers = [];

var selected_student = null;
var selected_session = null;



var initialize = function() {
  $('#session').prop('disabled', true);

  getListStudents(function(_students) {
    students = _students;
    renderStudents();
  });

  getListTeachers(function(_teachers) {
    teachers = _teachers;
    renderTeachers();
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

var getListTeachers = function(callback){
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

var renderStudents = function() {
  let html = "";
  for (let i = 0; i < students.length; i++) {
    html += '<option value="' + students[i]['Student'] + '">' + students[i]['Name'] + "</option>";
  }

  $('#student').append(html);

}

var renderSession = function() {
  let html = '<option value="">Choose Session</option>';
  for (let i = 0; i < sessions.length; i++) {
    html += '<option value="' + sessions[i]['Session'] + '">' + sessions[i]['Session'] + "</option>";
  }

  $('#session').html(html);
}

var renderTeachers = function(){
  let html = "";
  for (let i = 0; i < teacher.length; i++) {
    html += '<option value="' + teachers[i]['Teacher'] + '">' + teachers[i]['Name'] + "</option>";
  }

  $('#teacher').append(html);

}

//------------------------------------------------------
//  DOCUMENT READY
//------------------------------------------------------
$(document).ready(function() {

  //------------------------------------------------------
  //  EVENTS
  //------------------------------------------------------

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
  //------------------------------------------------------
  //  INITIALIZATION
  //------------------------------------------------------
  initialize();
});
