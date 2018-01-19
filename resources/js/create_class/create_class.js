//------------------------------------------------------
//  GLOBAL VARIABLES
//------------------------------------------------------

var students = [];
var teachers = [];


var initialize = function() {

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

var renderTeachers = function() {
  let html = "";
  for (let i = 0; i < teachers.length; i++) {
    html += '<option value="' + teachers[i]['Teacher'] + '">' + teachers[i]['Name'] + "</option>";
  }
  $('#teacher').html(html);
  $('#teacher').multiselect('rebuild');
}

var renderStudents = function() {
  let html = "";
  for (let i = 0; i < students.length; i++) {
    html += '<option value="' + students[i]['Student'] + '">' + students[i]['Name'] + "</option>";
  }
  $('#student').html(html);
  $('#student').multiselect('rebuild');
}

var buildData = function(subject, description, teacher, lis_students) {
  console.log("Subject= ", subject);
  console.log("Description= ", description);
  console.log("Teacher=", teacher);
  console.log("Students=",lis_students);
  if (subject != "" && subject != null) {
    if (description != "" && description != null) {
      if (teacher != "" && teacher != null) {
        if (lis_students.lenght != 0 && lis_students !== null) {
          $.ajax({
              type: "POST",
              url: 'https://api.arca.acacia.red/insert/Class',
              beforeSend: function(xhr) {
                xhr.setRequestHeader("Content-Type", "application/json");
              },
              data: JSON.stringify({
                "Subject": subject,
                "Description": description,
                "Student": lis_students,
                "Teacher": teacher,
              })
            })
            .done(function(data) {
              openModal();
            })
            .fail(function(error) {
              console.error('Error', error);
            });
        } else {
          alert("You Should select an Student or Students");
        }
      } else {
        alert("Choose a Teacher");
      }
    } else {
      alert("Insert a Description");
    }
  } else {
    alert("Insert a Subject");
  }

}

var openModal = function() {
  $('#modalsuccess').modal('show');
}

var cleanform = function() {
  $('#modalsuccess').on('hidden.bs.modal', function() {
    $("#subject").val("");
    $("#description").val("");
    $("#teacher").val("");
    $('#student').html('');
    renderStudents();
    $('#student').multiselect('rebuild');
    $('#teacher').html('');
    renderTeachers();
    $('#teacher').multiselect('rebuild');
  })
}

var createClass = function(){
  let name_class = $("#subject").val();
  let description = $("#description").val();
  let selected_teacher = $("#teacher").val();
  let selected_students = $("#student").val();
  buildData(name_class, description, selected_teacher, selected_students);
}
//------------------------------------------------------
//  DOCUMENT READY
//------------------------------------------------------

$(document).ready(function() {
  //------------------------------------------------------
  //  EVENTS
  //------------------------------------------------------

  $('#student').multiselect({
    maxHeight: 300,
    buttonWidth: '100%',
    includeSelectAllOption: true,
    enableFiltering: true
  });

  $('#teacher').multiselect({
    maxHeight: 300,
    buttonWidth: '100%',
    includeSelectAllOption: true,
    enableFiltering: true
  });






  //-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
  //  INITIALIZATION
  //------------------------------------------------------
  initialize();
});
