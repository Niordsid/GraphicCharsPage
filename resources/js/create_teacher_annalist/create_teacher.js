var createTeacher = function() {
  let full_name = $("#username").val();
  let age = $("#age").val();
  let gender = $("#gender").val();
  let ethnicity = $("#ethnicity").val();

  insertTeacher(full_name, age, gender, ethnicity);

}

var createAnnalist = function() {
  let full_name = $("#username").val();
  let age = $("#age").val();
  let gender = $("#gender").val();
  let ethnicity = $("#ethnicity").val();

  insertAnnalist(full_name, age, gender, ethnicity);

}

var insertTeacher = function(name, age, gender, ethnicity) {
  $.ajax({
      type: "POST",
      url: 'https://api.arca.acacia.red/insert/Teacher',
      beforeSend: function(xhr) {
        xhr.setRequestHeader("Content-Type", "application/json");
      },
      data: JSON.stringify({
        "Gender": gender,
        "Name": name,
        "Age": age,
        "Race_Ethnicity": ethnicity
      })
    })
    .done(function(data) {
      openModal();
    })
    .fail(function(error) {
      console.error('Error', error);
    });

}

var insertAnnalist = function(name, age, gender, ethnicity) {
  $.ajax({
      type: "POST",
      url: 'https://api.arca.acacia.red/insert/Annalist',
      beforeSend: function(xhr) {
        xhr.setRequestHeader("Content-Type", "application/json");
      },
      data: JSON.stringify({
        "Gender": gender,
        "Name": name,
        "Age": age,
        "Race_Ethnicity": ethnicity
      })
    })
    .done(function(data) {
      openModal();
    })
    .fail(function(error) {
      console.error('Error', error);
    });
}

var openModal = function() {
  $('#modalsuccess').modal('show');
}

var cleanform = function() {
  $('#modalsuccess').on('hidden.bs.modal', function() {
    $("#username").val("");
    $("#age").val("");
    $("#gender").val("");
    $("#ethnicity").val("");
  })
}



//------------------------------------------------------
//  DOCUMENT READY
//------------------------------------------------------
$(document).ready(function() {
//------------------------------------------------------
//  EVENTS
//------------------------------------------------------







//-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
//  INITIALIZATION
//------------------------------------------------------

});
