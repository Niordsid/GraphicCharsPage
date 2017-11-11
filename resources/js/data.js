//------------------------------------------------------
//  GLOBAL VARIABLES
//------------------------------------------------------

var students = [];
var sessions = [];

var selected_student = null;
var selected_session = null;

var chart = null;

//------------------------------------------------------
//  CONSTANTS
//------------------------------------------------------
const NOT_FOUND = -1;

//------------------------------------------------------
//  GLOBAL FUNCTIONS
//------------------------------------------------------

var initialize = function() {
  $('#session').prop('disabled', true);
  $('#plotGraphicBtn').prop('disabled', true);

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

var findEmotionIndexInSeries = function(series, emotion) {
  let emotion_index = NOT_FOUND;
  let count = 0;

  while (emotion_index === NOT_FOUND && count < series.length) {
    if (series[count].name === emotion) {
      emotion_index = count;
    }
    count++;
  }

  return emotion_index;

}

var putObservationDataInEmotion = function(current_observation_count, data, emotion_index, series) {

  let current_data = series[emotion_index].data;

  if (current_data == current_observation_count - 1) {
    series[emotion_index].data.push(data);
  } else {
    for (let i = series[emotion_index].data.length; i < current_observation_count - 1; i++) {
      series[emotion_index].data[i] = 0;
    }
    series[emotion_index].data.push(data);
  }

  return series;

};

var fillMissingSeriesData = function(series, observations_count) {
  for (let i = 0; i < series.length; i++) {
    for (let j = series[i].data.length - 1; j < observations_count; j++) {
      if (series[i].data.length < observations_count) {
        series[i].data.push(0);
      }
    }
  }

  return series;
}

var buildSeriesData = function(observations_data) {
  let series = [];
  let observation_keys = Object.keys(observations_data);

  for (let i = 0; i < observation_keys.length; i++) {
    let emotion_keys = Object.keys(observations_data[observation_keys[i]]);

    for (let j = 0; j < emotion_keys.length; j++) {
      let emotion_index = findEmotionIndexInSeries(series, emotion_keys[j]);

      if (emotion_index !== NOT_FOUND) {

        series = putObservationDataInEmotion(
          i,
          parseFloat(observations_data[observation_keys[i][emotion_keys[j]]]),
          emotion_index,
          series
        );

      } else {
        series.push({
          name: emotion_keys[j],
          data: []
        });

        let current_emotion_index = series.length - 1;

        for (let k = 0; k <= i; k++) {
          if (k === i) {
            series[current_emotion_index].data[k] = parseFloat(observations_data[observation_keys[i]][emotion_keys[j]]);
          } else {
            series[current_emotion_index].data[k] = 0;
          }
        }

      }

    }
  }

  series = fillMissingSeriesData(series, observation_keys.length);

  return series;
}

var getGraphicData = function(student, session, callback) {
  $.ajax({
      url: "https://api.arca.acacia.red/plot/student_session/Emotion",
      method: 'POST',
      beforeSend: function(xhr) {
        xhr.setRequestHeader("Content-Type", "application/json");
      },
      data: JSON.stringify({
        "Student": student,
        "Session": session
      }),
      dataType: "json"
    })
    .done(function(observations) {
      callback(buildSeriesData(observations));
    })
    .fail(function(error) {
      console.error('Error', error);
    });

};

var plotGraphic = function() {

  if (selected_student) {
    if (selected_session) {

      getGraphicData(selected_student, selected_session, function(_series) {
        if (chart) {
          chart.destroy();
        }

        chart = new Highcharts.chart('container', {

          title: {
            text: 'Student "X"/Session "Y"'
          },

          subtitle: {
            text: 'Student Emotions During The Session'
          },

          yAxis: {
            title: {
              text: 'EMOTION VALUE'
            }
          },

          xAxis: {
            title: {
              text: 'OBSERVATIONS (OVER THE DURATION OF THE CLASS)'
            }
          },

          legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle'
          },

          plotOptions: {
            series: {
              label: {
                connectorAllowed: false
              },
              pointStart: 1
            }
          },

          series: _series,

          responsive: {
            rules: [{
              condition: {
                maxWidth: 500
              },
              chartOptions: {
                legend: {
                  layout: 'horizontal',
                  align: 'center',
                  verticalAlign: 'bottom'
                }
              }
            }]
          }

        });
      });

    } else {
      alert('Please select a Session');
    }
  } else {
    alert('Please select a Student');
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
    $('#session').prop('disabled', true);
    $('#plotGraphicBtn').prop('disabled', true);

    $('#session').html('<option value="">Choose Session</option>');
    if (chart) {
      chart.destroy();
    }

    if (selected_student) {
      getListSessions(selected_student, function(_sessions) {

        if (_sessions.length) {
          sessions = _sessions;
          $('#session').prop('disabled', false);
          $('#plotGraphicBtn').prop('disabled', false);
          renderSession();
        }


      });
    }

  });

  $('#session').change(function() {
    selected_session = $(this).val() !== "" ? $(this).val() : null;

    if (chart) {
      chart.destroy();
      chart = null;
    }



    if (selected_session) {
      $('#plotGraphicBtn').prop('disabled', false);
    } else {
      $('#plotGraphicBtn').prop('disabled', true);
    }

  });

  //------------------------------------------------------
  //  INITIALIZATION
  //------------------------------------------------------
  initialize();
});
