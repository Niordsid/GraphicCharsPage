//var baseURL = 'http://localhost:5904/';
var baseURL = 'https://api.arca.acacia.red/';

var session;

jQuery.extend({
	getValues: function(url, getcallback) {
		var result = null;
		$.ajax({
			'url' : baseURL + url,
			'type' : 'GET',
			statusCode : {
				200: getcallback
			 },
			'error' : function(xhr, status, error) { console.log(status + error); }
		});
	}
});

jQuery.extend({
	postValues: function(url1, jsonstring, postcallback) {
		var result = null;
		$.ajax({
			url : baseURL + url1,
			type : "POST",
			data : jsonstring,
			dataType: 'json',
			contentType : 'application/json',
			statusCode : {
				201: postcallback,
				200: postcallback
			 },
			error : function(xhr, status, error) { console.log(status + error); }
		});
	}
});

function getSessions(url) {
	$.getValues(url, getcallback);
	document.getElementById('listsessions').remove();
}

function getcallback (arr) {
	$("#sessionslist").prepend("<p>Select the session:</p>");
	for(i in arr) {
		var value = arr[i]["Session"];
		$("#table1").append("<tr><td>" + value + "</td></tr>") ;
		$("#table1 tr").click(function(){
			$(this).addClass('selected').siblings().removeClass('selected');
			session = [$(this).find('td:first').html()];
			getProperties();
		});
	}
}

function getProperties() {
	$.postValues('list/individual_properties', JSON.stringify(session), postcallback);
}

function postcallback (arr) {
	OntoSession = session[0];
	var j = 0; var sensor_arr = [];
	for(i in arr) {
		if(arr[i]["Property"]=="Has_Sensory_Component") {
			sensor_arr[j] = arr[i]["Value"];
			j++;
		}
		if(arr[i]["Property"]=="Belongs_to_Scenario") {
			Belongs_to_Scenario = arr[i]["Value"];
		}
		if(arr[i]["Property"]=="Observation_Sample_Rate") {
			Observation_Sample_Rate = arr[i]["Value"];
		}
	}
	Has_Sensory_Component = sensor_arr;

	//document.getElementById("controller").innerHTML = "<br /><div id=\"controls\" class=\"button\"><a id=\"controlOn\" href=\"#\" OnClick=toogleControl()>Turn On All</a></div><br />"
}
