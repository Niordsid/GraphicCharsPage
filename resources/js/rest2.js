//var baseURL2 = 'http://localhost:5904/';
var baseURL2 = 'https://api.arca.acacia.red/';

var behav;

jQuery.extend({
	getvalue2s2: function(url2, getcallback2) {
		var result = null;
		$.ajax({
			'url' : baseURL2 + url2,
			'type' : 'GET',
			statusCode : {
				200: getcallback2
			 },
			'error' : function(xhr, status, error) { console.log(status + error); }
		});
	}
});

jQuery.extend({
	postvalue2s2: function(url3, jsonstring2, postcallback2) {
		var result = null;
		$.ajax({
			url : baseURL2 + url3,
			type : "POST",
			data : jsonstring2,
			dataType: 'json',
			contentType : 'application/json',
			statusCode : {
				201: postcallback2,
				200: postcallback2
			 },
			error : function(xhr, status, error) { console.log(status + error); }
		});
	}
});

function getBehaviour(url) {
	$.getvalue2s2(url, getcallback2);
	document.getElementById('listbehaviour').remove();
}

function getcallback2 (arr2) {
	$("#behaviourlist").prepend("<p>Select the Behaviour:</p>");
	for(i in arr2) {
		var value2 = arr2[i]["Behaviour"];
		$("#table2").append("<tr><td>" + value2 + "</td></tr>") ;
		$("#table2 tr").click(function(){
			$(this).addClass('selected').siblings().removeClass('selected');
			behav = [$(this).find('td:first').html()];
			getProperties2();
		});
	}
}

function getProperties2() {
	$.postvalue2s2('list/individual_properties', JSON.stringify(behav), postcallback2);
}

function postcallback2 (arr2) {
	var off_task;
	for(i in arr2) {
		if(arr2[i]["Property"]=="Off_Task") {
			off_task = arr2[i]["Value"];
		}
	}
	if (off_task > 0.4) {
		badalert(off_task)
	} else {
		goodalert(off_task)
	}
}

function badalert(offtaskvalue2) {
	alert("Alert: Student_123 is showing issue: Drop Out! Off_Task=" + offtaskvalue2);
}
function goodalert(offtaskvalue3) {
	alert("Alert: Student_123 is Ok! Off_Task=" + offtaskvalue3);
}
