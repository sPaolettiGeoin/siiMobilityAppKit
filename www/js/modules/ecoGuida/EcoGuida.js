var EcoGuida = {
	open: false,
    expanded: false,
	showMap: false,
    varName: "EcoGuida",
    idMenu: "ecoGuidaMenu",
	init: function() {
		EcoGuida.menuHeaderTitle = Globalization.labels.ecoGuidaMenu.title;
		EcoGuida.ramanzina1 = Globalization.labels.ecoGuidaMenu.ramanzina1;
		EcoGuida.ramanzina2 = Globalization.labels.ecoGuidaMenu.ramanzina2;
		EcoGuida.ramanzina3 = Globalization.labels.ecoGuidaMenu.ramanzina3;
		EcoGuida.ramanzina4 = Globalization.labels.ecoGuidaMenu.ramanzina4;
		EcoGuida.ramanzina5 = Globalization.labels.ecoGuidaMenu.ramanzina5;
		
		EcoGuida.message = "";
		EcoGuida.communicationInitialized = false;
		EcoGuida.threadId = -1;
		
		bluetoothSerial.isEnabled(
            function() {bluetoothSerial.list(EcoGuida.onDeviceList, EcoGuida.errorQuery);},
            function() {
				EcoGuida.message = "Bluetooth is not enabled.";
				EcoGuida.refreshMenu();
				}
        )
			
		EcoGuida.show();
		
		document.getElementById("deviceList").addEventListener('touchstart', EcoGuida.connect, false);
    },
    onDeviceList: function(devices) {
        var option;

        // remove existing devices
        document.getElementById("deviceList").innerHTML = "";
        //app.setStatus("");

        devices.forEach(function(device) {

            var listItem = document.createElement('li'),
                html = '<b>' + device.name + '</b><br/>' + device.id;

            listItem.innerHTML = html;

            if (cordova.platformId === 'windowsphone') {
				// This is a temporary hack until I get the list tap working
				var button = document.createElement('button');
				button.innerHTML = "Connect";
				button.addEventListener('click', app.connect, false);
				button.dataset = {};
				button.dataset.deviceId = device.id;
				listItem.appendChild(button);
            } else {
				listItem.dataset.deviceId = device.id;
            }
            document.getElementById("deviceList").appendChild(listItem);
        });

        if (devices.length === 0) {
            option = document.createElement('option');
            option.innerHTML = "No Bluetooth Devices";
            document.getElementById("deviceList").appendChild(option);

            if (cordova.platformId === "ios") { // BLE
                //app.setStatus("No Bluetooth Peripherals Discovered.");
            } else { // Android or Windows Phone
                //app.setStatus("Please Pair a Bluetooth Device.");
            }
        } else {
            //app.setStatus("Found " + devices.length + " device" + (devices.length === 1 ? "." : "s."));
        }
    },
	connect: function(e) {
        var onConnect = function() {
                // subscribe for incoming data
                bluetoothSerial.subscribe('\r', EcoGuida.onData, EcoGuida.errorQuery);

                EcoGuida.message = "Connected";
				
				var interval = 15000;
				EcoGuida.threadId = setInterval(function() {
					var success = function() {
						console.log("sent message: 010D");
					};

					bluetoothSerial.write("010D\r", success, EcoGuida.errorQuery);
				}, interval);
            };

        var deviceId = e.target.dataset.deviceId;
        if (!deviceId) { // try the parent
            deviceId = e.target.parentNode.dataset.deviceId;
        }

        bluetoothSerial.connect(deviceId, onConnect, EcoGuida.errorQuery);
    },
	disconnect: function() {
		var closePort = function() {
			EcoGuida.message = "Device disconnected";
			bluetoothSerial.unsubscribe(
					function (data) {
						console.log("After unsubscribing: " + data)
					},
					EcoGuida.errorQuery
			);
		}
		bluetoothSerial.disconnect(
			closePort,
			EcoGuida.errorQuery
		);
	},
	onData: function(data) {
        console.log("received data " + data);
		if (new RegExp("^41\\s.*").test(data)) {
			EcoGuida.convert(data);
		}
    },
	convert: function(data) {
		if (data && data.length > 0) {
			var bytes = data.split(" ");
			if (bytes && bytes.length >= 3) {
				var message = bytes[1];
				if (message === "05") {
					var absTemp = parseInt(bytes[2], 16);
					var realTemp = absTemp - 40;
					EcoGuida.message = "Engine temp: " + realTemp;
				}
				else if (message === "0D") {
					var speed = parseInt(bytes[2], 16);
					EcoGuida.message = "Speed: " + speed;
					console.log("Speed: " + speed);
				}
			}
			else {
				EcoGuida.message += "Something wrong";
			}
			
			EcoGuida.refreshMenu();
		}
	},
	show: function () {
        application.resetInterface();
        MapManager.showMenuReduceMap("#" + EcoGuida.idMenu);
        $("#" + EcoGuida.idMenu + "Expand").hide();
        EcoGuida.open = true;
        InfoManager.addingMenuToManage(EcoGuida.varName);
        application.addingMenuToCheck(EcoGuida.varName);
        application.setBackButtonListener();
		EcoGuida.refreshMenu();
		EcoGuida.expandEcoGuida();
    },

    hide: function () {
        $("#" + EcoGuida.idMenu).css({ 'z-index': '1001' });
        MapManager.reduceMenuShowMap("#" + EcoGuida.idMenu);
        InfoManager.removingMenuToManage(EcoGuida.varName);
        application.removingMenuToCheck(EcoGuida.varName);
        EcoGuida.open = false;
    },

    checkForBackButton: function () {
        if (EcoGuida.open) {
            EcoGuida.hide();
        }
    },
    refreshMenu: function () {
        if ($("#" + EcoGuida.idMenu).length == 0) {
			$("#indexPage").
                append("<div id=\"" + EcoGuida.idMenu + "\" class=\"commonHalfMenu\"></div>")
        }
		
        ViewManager.render(EcoGuida, "#" + EcoGuida.idMenu, "EcoGuidaMenu");
		
        Utility.movingPanelWithTouch("#" + EcoGuida.idMenu + "ExpandHandler",
            "#" + EcoGuida.idMenu);
		
        if (EcoGuida.expanded) {
            $("#" + EcoGuida.idMenu + "Expand").hide();
        } else {
            $("#" + EcoGuida.idMenu + "Collapse").hide();
        }
    },

    closeAll: function () {
        if (EcoGuida.open) {
            EcoGuida.hide();
        }
    },
    
    expandEcoGuida: function () {
        Utility.expandMenu("#" + EcoGuida.idMenu,
                           "#" + EcoGuida.idMenu + "Expand",
                           "#" + EcoGuida.idMenu + "Collapse");
        EcoGuida.expanded = true;
    },

    collapseEcoGuida: function () {
        Utility.collapseMenu("#" + EcoGuida.idMenu,
                             "#" + EcoGuida.idMenu + "Expand",
                             "#" + EcoGuida.idMenu + "Collapse");
        EcoGuida.expanded = false;
    },

    //callBack
    errorQuery: function(error) {
		console.log("dbg090: " + JSON.stringify(error));
        navigator.notification.alert(Globalization.alerts.servicesServerError.message, function() {}, Globalization.alerts.servicesServerError.title);
		
		if (EcoGuida.threadId != -1) {
			window.clearInterval(EcoGuida.threadId);
		}
    },
	successQueryAction: function (responseJson) {
		console.log("responseJson: " + responseJson);
		var response = JSON.parse(responseJson);
		if (response && response.status && response.status.error_code === 0) {
			
		}
		else {
			console.log("response: " + response);
		}
		
		EcoGuida.refreshMenu();
    },
}