var EcoGuida = {
	open: false,
    varName: "EcoGuida",
    idMenu: "ecoGuidaMenu",
	init: function() {
		EcoGuida.menuHeaderTitle = Globalization.labels.ecoGuidaMenu.title;
		EcoGuida.ramanzina1 = Globalization.labels.ecoGuidaMenu.ramanzina1;
		EcoGuida.ramanzina2 = Globalization.labels.ecoGuidaMenu.ramanzina2;
		EcoGuida.ramanzina3 = Globalization.labels.ecoGuidaMenu.ramanzina3;
		EcoGuida.ramanzina4 = Globalization.labels.ecoGuidaMenu.ramanzina4;
		EcoGuida.ramanzina5 = Globalization.labels.ecoGuidaMenu.ramanzina5;
		
		EcoGuida.loadPage();
		
		EcoGuida.communicationInitialized = false;
		EcoGuida.threadId = -1;
		
		EcoGuida.checkBluetooth();
		
		if (localStorage.getItem("ecoGuidaCarModel") == null) {
			EcoGuida.getCarBrands();
		}
		else {
			EcoGuida.loadCarModel();
		}
			
		EcoGuida.show();
		
		$("#refreshBtn").click(EcoGuida.checkBluetooth);
		$("#disconnectBtn").click(EcoGuida.disconnect);
		document.getElementById("deviceList").addEventListener('touchstart', EcoGuida.connect, false);
    },
	loadPage: function () {
        if ($("#" + EcoGuida.idMenu).length == 0) {
			$("#indexPage").
                append("<div id=\"" + EcoGuida.idMenu + "\" class=\"commonHalfMenu\"></div>")
        }
		
        ViewManager.render(EcoGuida, "#" + EcoGuida.idMenu, "EcoGuidaMenu");
    },
	getCarBrands: function() {
		$("#carModelsList").show();
		$("#carModelDiv").hide();
        var actionQuery = "/ecoGuide/carBrands/";
		ecoGuidaAPIClient.executeQuery(actionQuery, EcoGuida.successQueryAction, EcoGuida.errorQuery);
    },
	getCarModels: function(brand) {
		var actionQuery = "/ecoGuide/carModels/?brand=" + brand;
		ecoGuidaAPIClient.executeQuery(actionQuery, EcoGuida.successQueryAction, EcoGuida.errorQuery);
    },
	setCarModel: function(carModel) {
		localStorage.setItem("ecoGuidaCarModel", carModel);
		EcoGuida.loadCarModel();
	},
	loadCarModel: function() {
		$("#carModelsList").hide();
		$("#carModelDiv").show();
		$("#carModel").html(localStorage.getItem("ecoGuidaCarModel"));
	},
	checkBluetooth: function() {
		bluetoothSerial.isEnabled(
            EcoGuida.readDeviceList,
            function() {$("#refreshBtn").show();EcoGuida.showMessage("Bluetooth is not enabled. Abilitarlo e premere il pulsante 'Refresh'");}
        )
	},
	readDeviceList: function() {
		bluetoothSerial.list(EcoGuida.onDeviceList, EcoGuida.errorQuery);
		$("#refreshBtn").hide();
	},
    onDeviceList: function(devices) {
        // remove existing devices
        document.getElementById("deviceList").innerHTML = "";

        devices.forEach(function(device) {
            var listItem = document.createElement('li');
            listItem.innerHTML = '<b>' + device.name + '</b><br/>' + device.id;

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
            var option = document.createElement('option');
            option.innerHTML = "No Bluetooth Devices";
            document.getElementById("deviceList").appendChild(option);

            if (cordova.platformId === "ios") { // BLE
                EcoGuida.showMessage("No Bluetooth Peripherals Discovered.");
            } else { // Android or Windows Phone
                EcoGuida.showMessage("Please Pair a Bluetooth Device.");
            }
        } else {
            EcoGuida.showMessage("Found " + devices.length + " device" + (devices.length === 1 ? "." : "s."));
        }
    },
	connect: function(e) {
        var onConnect = function() {
                // subscribe for incoming data
                bluetoothSerial.subscribe('\r', EcoGuida.onData, EcoGuida.errorQuery);

                EcoGuida.showMessage("Connected");

				$("#disconnectBtn").show();
				
				var interval = 15000;
				EcoGuida.threadId = setInterval(function() {
					var success = function() {
						var command = $("#command").val();
						console.log("sent message: " + command);
					};

					var command = $("#command").val();
					bluetoothSerial.write(command + "\r", success, EcoGuida.errorQuery);
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
			EcoGuida.showMessage("Device disconnected");
			
			$("#disconnectBtn").hide();
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
					EcoGuida.showMessage("Engine temp: " + realTemp);
				}
				else if (message === "0D") {
					var speed = parseInt(bytes[2], 16);
					EcoGuida.showMessage("Speed: " + speed);
				}
				else if (message === "0B") {
					var intakeManifoldAbsolutePressure = parseInt(bytes[2], 16);
					EcoGuida.showMessage("Intake manifold absolute pressure: " + intakeManifoldAbsolutePressure);
				}
				else if (message === "0F") {
					var intakeAirTemperature = parseInt(bytes[2], 16) - 40;
					EcoGuida.showMessage("Intake air temperature: " + intakeAirTemperature);
				}
				else if (message === "10") {
					var massAirFlow = (256 * parseInt(bytes[2], 16) + parseInt(bytes[3], 16)) / 100;
					EcoGuida.showMessage("Mass air flow: " + massAirFlow);
				}
			}
			else {
				EcoGuida.showMessage("Something wrong", true);
			}
		}
	},
	show: function () {
        application.resetInterface();
		
		$("#disconnectBtn").hide();
        EcoGuida.open = true;
        InfoManager.addingMenuToManage(EcoGuida.varName);
        application.addingMenuToCheck(EcoGuida.varName);
        application.setBackButtonListener();
		Utility.expandMenu("#" + EcoGuida.idMenu,
                           "#" + EcoGuida.idMenu + "Expand",
                           "#" + EcoGuida.idMenu + "Collapse");
    },

    hide: function () {
        $("#" + EcoGuida.idMenu).css({ 'z-index': '1001' });
        InfoManager.removingMenuToManage(EcoGuida.varName);
        application.removingMenuToCheck(EcoGuida.varName);
        EcoGuida.open = false;
    },

    checkForBackButton: function () {
        if (EcoGuida.open) {
            EcoGuida.hide();
        }
    },
	showMessage: function(message, append) {
		console.log(message);
		var msgElem = $("#message");
		if (append) {
			message = msgElem.html() + "<br>" + message;
		}
		
		msgElem.html(message);
	},
    closeAll: function () {
        if (EcoGuida.open) {
            EcoGuida.hide();
        }
    },
	closeThread: function() {
		if (EcoGuida.threadId != -1) {
			window.clearInterval(EcoGuida.threadId);
			EcoGuida.threadId = -1;
		}
	},

    //callBack
    errorQuery: function(error, apiError) {
		console.log("dbg090: " + JSON.stringify(error));
		if (apiError) {
			navigator.notification.alert(Globalization.alerts.servicesServerError.message, function() {}, Globalization.alerts.servicesServerError.title);
		}
		else {
			EcoGuida.showMessage(error);
		}
		
		EcoGuida.closeThread();
    },
	successQueryAction: function (responseJson) {
		console.log("responseJson: " + responseJson);
		var response = JSON.parse(responseJson);
		if (response && response.status && response.status.error_code === 0) {
			var actionQuery = response.status.current_operation;
			if (actionQuery === "/ecoGuide/carBrands/") {
				var carBrands = response.data.carBrands;
				document.getElementById("carModelsList").innerHTML = "";

				carBrands.forEach(function(carBrand) {

					var listItem = document.createElement('li');
					listItem.innerHTML = '<b onclick="EcoGuida.getCarModels(\'' + carBrand + '\');">' + carBrand + '</b><br/>' + carBrand;

					if (cordova.platformId === 'windowsphone') {
						//
					} else {
						listItem.dataset.carBrand = carBrand;
					}
					document.getElementById("carModelsList").appendChild(listItem);
				});
			}
			else if (actionQuery === "/ecoGuide/carModels/") {
				var carModels = response.data.carModels;
				document.getElementById("carModelsList").innerHTML = "";

				carModels.forEach(function(carModel) {
					var listItem = document.createElement('li');
					listItem.innerHTML = '<b onclick="EcoGuida.setCarModel(\'' + carModel + '\');">' + carModel + '</b><br/>' + carModel;

					if (cordova.platformId === 'windowsphone') {
						//
					} else {
						listItem.dataset.carModel = carModel;
					}
					document.getElementById("carModelsList").appendChild(listItem);
				});
				var returnBtnHtml = "<input type='button' value='Torna ai brands' onclick='EcoGuida.getCarBrands();'>";
				document.getElementById("carModelsList").innerHTML += "<br>" + returnBtnHtml;
			}
		}
		else {
			console.log("response: " + response);
		}
    },
}