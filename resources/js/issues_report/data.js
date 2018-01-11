//------------------------------------------------------
//  GLOBAL VARIABLES
//------------------------------------------------------

var students = [];
var sessions = [];
var duration = [];
var teachers = [];

var selected_student = null;
var selected_session = null;

var duration = null;


var initialize = function() {
  $('.btn-group').prop('disable', true);

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
        let html = ''
        $.each(_sessions, function(i, item) {
          let session = item.Session
          html += '<option value="' + session + '">' + session + '</option>';
        });
        $('#session').html(html);
        $('#session').val(_sessions[0].Session);
        $('#session').multiselect('rebuild');
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
