window.onload = init;

var OntoSession = null;
var Has_Sensory_Component  = null;
var Belongs_to_Scenario = null;
var Observation_Sample_Rate = null;

//var socket = new WebSocket("ws://localhost:5904/actions");
var socket = new WebSocket("wss://api.arca.acacia.red/actions");

socket.onmessage = onMessage;
// socket.onopen = function () {
	// console.log("connected");
// };
// socket.onclose = function () {
	// console.log("onclose");
// };
// socket.onerror = function (error) {
	// console.log(error);
// };

function onMessage(event) {
    var device = JSON.parse(event.data);
    if (device.action === "add") {
        printDeviceElement(device);
    }
    if (device.action === "remove") {
        document.getElementById(device.id).remove();
        //device.parentNode.removeChild(device);
    }
    if (device.action === "toggleOnOff") {
        var node = document.getElementById(device.id);
        var statusText = node.children[2];
        if (device.statusOnOff === "On") {
            statusText.innerHTML = "<b>Status:</b> " + device.statusOnOff + " (<a href=\"#\" OnClick=toggleOffDevice(" + device.id + ")>Turn off</a>)";
        } else if (device.statusOnOff === "Off") {
            statusText.innerHTML = "<b>Status:</b> " + device.statusOnOff + " (<a href=\"#\" OnClick=toggleOnDevice(" + device.id + ")>Turn on</a>)";
        }
    }
    if (device.action === "toggleStartStop") {
        var node = document.getElementById(device.id);
        var recording = node.children[3];
        if (device.statusStartStop === "Start") {
            recording.innerHTML = "<b>Recording:</b> Yes (<a href=\"#\" OnClick=toggleStopDevice(" + device.id + ")>Stop</a>)";
        } else if (device.statusStartStop === "Stop") {
            recording.innerHTML = "<b>Recording:</b> No (<a href=\"#\" OnClick=toggleStartDevice(" + device.id + ")>Start</a>)";
        }
    }
}

function addDevice() {
    var DeviceAction = {
        action: "add",
        name: "Student_Dummy",
		sensors: ["GP3","Affectiva"],
        type: "Student",
        statusOnOff: "Off",
		statusStartStop: "Stop",
		session: "Session_2017-07-06_14-00-00"
    };
    socket.send(JSON.stringify(DeviceAction));
	document.getElementById("add_device").innerHTML = "<a href=\"#\" OnClick=removeDevice()>Remove dummy student</a>"
}

function removeDevice() {
    var id = document.getElementsByClassName("device Student")[0].id
    var DeviceAction = {
        action: "remove",
        id: parseInt(id)
    };
    socket.send(JSON.stringify(DeviceAction));
	document.getElementById("add_device").innerHTML = "<a href=\"#\" OnClick=addDevice()>Add dummy student</a>"
	//document.getElementById('add_device').remove();
}

function toggleOnDevice(element) {
    var id = element;
    var DeviceAction = {
        action: "on",
        id: id,
		Session: OntoSession,//
		Scenario: Belongs_to_Scenario,//
		Digital_Observation_Sample_Rate: Observation_Sample_Rate,//
		Sensory_Component: Has_Sensory_Component//
    };
    socket.send(JSON.stringify(DeviceAction));
}

function toggleOffDevice(element) {
    var id = element;
    var DeviceAction = {
        action: "off",
        id: id
    };
    socket.send(JSON.stringify(DeviceAction));
}

function toggleStartDevice(element) {
    var id = element;
    var DeviceAction = {
        action: "start",
        id: id
    };
    socket.send(JSON.stringify(DeviceAction));
}

function toggleStopDevice(element) {
    var id = element;
    var DeviceAction = {
        action: "stop",
        id: id
    };
    socket.send(JSON.stringify(DeviceAction));
}

function toogleAllfunction(function_name) {
	var classes = document.getElementsByClassName("device");
	for (var item of classes) {
		window[function_name](item);
	}
}

function toogleControl() {
	if(document.getElementById("controlOn")){
		toogleAllfunction('toggleOnDevice')
		document.getElementById("controls").innerHTML = "<a id=\"controlStart\" href=\"#\" OnClick=toogleControl()>Start All</a>"
	} else if(document.getElementById("controlStart")){
		toogleAllfunction('toggleStartDevice')
		document.getElementById("controls").innerHTML = "<a id=\"controlStop\" href=\"#\" OnClick=toogleControl()>Stop All</a>"
	} else if(document.getElementById("controlStop")){
		toogleAllfunction('toggleStopDevice')
		document.getElementById("controls").innerHTML = "<a id=\"controlOff\" href=\"#\" OnClick=toogleControl()>Turn Off All</a>"
	} else if(document.getElementById("controlOff")){
		toogleAllfunction('toggleOffDevice')
		document.getElementById("controls").innerHTML = "<a id=\"controlOn\" href=\"#\" OnClick=toogleControl()>Turn On All</a>"
	}
}

function printDeviceElement(device) {
    var content = document.getElementById("content");

    var deviceDiv = document.createElement("div");
    deviceDiv.setAttribute("id", device.id);
    deviceDiv.setAttribute("class", "device " + device.type);
    content.appendChild(deviceDiv);

    var deviceName = document.createElement("span");
    deviceName.setAttribute("class", "deviceName");
    deviceName.innerHTML = device.name;
    deviceDiv.appendChild(deviceName);

    var deviceType = document.createElement("span");
    deviceType.innerHTML = "<b>Type:</b> " + device.type;
    deviceDiv.appendChild(deviceType);

    var deviceStatus = document.createElement("span");
    if (device.statusOnOff === "On") {
        deviceStatus.innerHTML = "<b>Status:</b> " + device.statusOnOff + " (<a href=\"#\" OnClick=toggleOffDevice(" + device.id + ")>Turn off</a>)";
    } else if (device.statusOnOff === "Off") {
        deviceStatus.innerHTML = "<b>Status:</b> " + device.statusOnOff + " (<a href=\"#\" OnClick=toggleOnDevice(" + device.id + ")>Turn on</a>)";
    }
    deviceDiv.appendChild(deviceStatus);

    var deviceRecording = document.createElement("span");
    if ((device.statusStartStop === "Start") && (device.statusOnOff === "On")) {
        deviceRecording.innerHTML = "<b>Recording:</b> Yes (<a href=\"#\" OnClick=toggleStopDevice(" + device.id + ")>Stop</a>)";
    } else if (device.statusStartStop === "Stop") {
        deviceRecording.innerHTML = "<b>Recording:</b> No (<a href=\"#\" OnClick=toggleStartDevice(" + device.id + ")>Start</a>)";
    }
    deviceDiv.appendChild(deviceRecording);

    var deviceSensors = document.createElement("span");
	var sensorsList = "<br><table><tr><th rowspan=\"" + device.sensors.length + "\">Sensors:</th>";
	for (var i = 0; i < device.sensors.length; i++) {
		sensorsList += "<td>" + device.sensors[i] + "</td></tr><tr>";
	}
	sensorsList += "</tr></table>";
    deviceSensors.innerHTML = sensorsList;
    deviceDiv.appendChild(deviceSensors);
}

function init() {
}
