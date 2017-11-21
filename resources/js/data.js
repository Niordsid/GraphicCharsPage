//------------------------------------------------------
//  GLOBAL VARIABLES
//------------------------------------------------------

var students = [];
var sessions = [];

var selected_student = null;
var selected_studentb = null;
var student_name = null;
var selected_session = null;
var selected_sessionb = null;

var charta = null;
var chartb = null;
var chartc = null;

var name_key = [];

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
  $('#plotGraphicBtn2').prop('disabled', true);
  $('#plotGraphicBtn3').prop('disabled', true);

  getListStudents(function(_students) {
    students = _students;
    renderStudents();
  });

  getSessions(function(_sessions) {
    sessions = _sessions;
    renderSessions();
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

var getSessions = function(callback) {
  $.ajax({
      url: "http://api.arca.acacia.red/list/Session",
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
  $('#student2').append(html);

}

var renderSessions = function() {
  let html = "";
  for (let i = 0; i < sessions.length; i++) {
    html += '<option value="' + sessions[i]['Session'] + '">' + sessions[i]['Session'] + "</option>";
  }
  $('#session2').append(html);
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
  if (current_data.length == current_observation_count - 1) {
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


  for (let observation_count = 0; observation_count < observation_keys.length; observation_count++) {
    let emotion_keys = Object.keys(observations_data[observation_keys[observation_count]]);

    for (let emotion_count = 0; emotion_count < emotion_keys.length; emotion_count++) {
      let emotion_index = findEmotionIndexInSeries(series, emotion_keys[emotion_count]);

      if (emotion_index !== NOT_FOUND) {
        series = putObservationDataInEmotion(
          observation_count,
          parseFloat(observations_data[observation_keys[observation_count]][emotion_keys[emotion_count]]),
          emotion_index,
          series
        );

      } else {
        series.push({
          name: emotion_keys[emotion_count],
          data: []
        });

        let current_emotion_index = series.length - 1;

        for (let emotion_data_filler_count = 0; emotion_data_filler_count <= observation_count; emotion_data_filler_count++) {
          let is_the_first_observation = emotion_data_filler_count === observation_count;

          if (is_the_first_observation) {
            series[current_emotion_index].data[emotion_data_filler_count] = parseFloat(observations_data[observation_keys[observation_count]][emotion_keys[emotion_count]]);
          } else {
            series[current_emotion_index].data[emotion_data_filler_count] = 0;
          }

        }

      }

    }
  }

  series = fillMissingSeriesData(series, observation_keys.length);
  name_key = listkeysName(observations_data);

  return series;
}

var listkeysName = function(observations_data) {
  let data1 = observations_data;
  let ori = Object.keys(data1);
  let names = [];

  for (let i = 0; i < ori.length; i++) {
    let name = ori[i].substring(0, 7);
    names.push(name + "_" + (i + 1));

  }
  return ori;
}

var sessionname = function(name) {
  let sess = name;
  let names = [];

  for (let i = 0; i < sess.length; i++) {
    let name = sess[i].substring(8, sess[i].length);
    names.push(name);
  }
  return names;
  console.log(names);
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

var getStudentsEmotions = function(student, callback) {
  $.ajax({
      url: "https://api.arca.acacia.red/plot/student/Emotion",
      method: 'POST',
      beforeSend: function(xhr) {
        xhr.setRequestHeader("Content-Type", "application/json");
      },
      data: JSON.stringify([student]),
      dataType: "json"
    })
    .done(function(observations) {
      callback(buildSeriesData(observations));
    })
    .fail(function(error) {
      console.error('Error', error);
    });
};

var getSessionsEmotions = function(session, callback) {
  $.ajax({
      url: "https://api.arca.acacia.red/plot/session/Emotion",
      method: 'POST',
      beforeSend: function(xhr) {
        xhr.setRequestHeader("Content-Type", "application/json");
      },
      data: JSON.stringify([session]),
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
  let stud = getName(students, 'Student', selected_student);
  if (selected_student) {
    if (selected_session) {

      getGraphicData(selected_student, selected_session, function(_series) {

        if (charta) {
          charta.destroy();
        }

        charta = new Highcharts.chart('container', {

          title: {
            text: '' + stud + ' / ' + selected_session + ''
          },

          subtitle: {
            text: 'Student Emotions During The Session'
          },

          yAxis: {
            max: 1,
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

var plotGraphic2 = function() {

  if (selected_studentb) {
    let stud = getName(students, 'Student', selected_studentb);
    getStudentsEmotions(selected_studentb, function(_series) {
      let data2 = sessionname(name_key);
      if (chartb) {
        chartb.destroy();
      }

      chartb = new Highcharts.chart('container2', {

        title: {
          text: '' + stud + ''
        },

        subtitle: {
          text: 'Emotions over the Sessions'
        },

        yAxis: {
          max: 1,
          title: {
            text: 'EMOTIONS VALUES'
          }
        },

        xAxis: {
          categories: data2,
          title: {
            text: 'SESSIONS'
          },
          labels: {
            style: {
              fontSize: '9px'
            }
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
            pointStart: 0
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
    alert('Please select a Student');
  }
};

var plotGraphic3 = function() {

  if (selected_sessionb) {
    getSessionsEmotions(selected_sessionb, function(_series) {
      if (chartc) {
        chartc.destroy();
      }
      chartc = new Highcharts.chart('container3', {

        chart: {
          type: 'column'
        },
        title: {
          text: '' + selected_sessionb + ''
        },
        subtitle: {
          text: "Student's Emotions Average Values"
        },
        xAxis: {
          categories: name_key,
          crosshair: true,
          title: {
            text: 'Students / Emotions'
          }
        },
        yAxis: {
          max: 1,
          min: 0,
          title: {
            text: 'Emotion Values'
          }
        },
        tooltip: {
          headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
          pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
            '<td style="padding:0"><b>{point.y:.3f}</b></td></tr>',
          footerFormat: '</table>',
          shared: true,
          useHTML: true
        },
        plotOptions: {
          column: {
            pointPadding: 0.2,
            borderWidth: 0
          }
        },
        series: _series

      });
    });


  } else {
    alert('Please select a Student');
  }
};

var getName = function(array, key, value) {
  let name = null;
  for (var i = 0; i < array.length; i++) {
    if (array[i][key] === value) {
      return array[i]['Name'];
    }
  }
  return null;
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
    $('#plotGraphicBtn').prop('disabled', true);

    $('#session').html('<option value="">Choose Session</option>');
    if (charta) {
      charta = null;
      //charta.destroy();
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

    if (charta) {
      charta.destroy();
      charta = null;
    }



    if (selected_session) {
      $('#plotGraphicBtn').prop('disabled', false);
    } else {
      $('#plotGraphicBtn').prop('disabled', true);
    }

  });
  // Active button for plot second Graphic
  $('#student2').change(function() {
    selected_studentb = $(this).val() !== "" ? $(this).val() : null;

    if (chartb) {
      chartb.destroy();
      chartb = null;
    }

    if (selected_studentb) {
      $('#plotGraphicBtn2').prop('disabled', false);
    } else {
      $('#plotGraphicBtn2').prop('disabled', true);
    }

  });
  // Active button for plot third Graphic
  $('#session2').change(function() {
    selected_sessionb = $(this).val() !== "" ? $(this).val() : null;

    if (chartc) {
      chartc.destroy();
      chartc = null;
    }

    if (selected_sessionb) {
      $('#plotGraphicBtn3').prop('disabled', false);
    } else {
      $('#plotGraphicBtn3').prop('disabled', true);
    }

  });

  //------------------------------------------------------
  //  INITIALIZATION
  //------------------------------------------------------
  initialize();
});
