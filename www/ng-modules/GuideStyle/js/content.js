(function(){
	'use strict';
	
	angular
		.module('siiMobilityApp')
		.controller('GuideStyleCtrl', ['$scope', '$injector', '$ocLazyLoad', 'PrincipalMenu', 'SiiMobilityService', 'MapManager', 'InfoManager', 'Utility', 'SettingsManager',
		function($scope, $injector, $ocLazyLoad, PrincipalMenu, SiiMobilityService, MapManager, InfoManager, Utility, SettingsManager) {
			$scope.varName = "GuideStyle";
			$scope.macAddress = "2C:01:00:01:87:5E";
			$scope.message = "";
			
			function doWork() {
				PrincipalMenu.hide();
				init();
				$("#map").hide();
			};
			
			function init() {
				$scope.menuHeaderTitle = "Stile di guida";
				
				var listPorts = function() {
					// list the available BT ports:
					bluetoothSerial.list(
						function(results) {
							//app.display(JSON.stringify(results));
							$scope.devices = results;
							$scope.canConnect = $scope.devices && typeof $scope.devices.length != "undefined";
						},
						function(error) {
							display(JSON.stringify(error));
						}
					);
				}

				// if isEnabled returns failure, this function is called:
				var notEnabled = function() {
					display("Bluetooth is not enabled.")
				}

				 // check if Bluetooth is on:
				bluetoothSerial.isEnabled(
					listPorts,
					notEnabled
				);
				
				show();
			};
			
			function show () {
				SiiMobilityService.resetInterface();
				//MapManager.showMenuReduceMap("#" + $scope.idMenu);
				//$("#" + $scope.idMenu + "Expand").hide();
				$scope.open = true;
				InfoManager.addingMenuToManage($scope.varName);
				SiiMobilityService.addingMenuToCheck($scope.varName);
				SiiMobilityService.setBackButtonListener();
				//refreshMenu();
				//$scope.expandHealthCare();
			};
			
			$scope.manageConnection = function() {
				// connect() will get called only if isConnected() (below)
				// returns failure. In other words, if not connected, then connect:
				var connect = function () {
					$scope.canConnect = false;
					// if not connected, do this:
					// clear the screen and display an attempt to connect
					clear();
					display("Attempting to connect to " + $scope.macAddress + ". " +
						"Make sure the serial port is open on the target device.");
					// attempt to connect:
					bluetoothSerial.connect(
						$scope.macAddress,  // device to connect to
						openPort,    // start listening if you succeed
						showError    // show the error if you fail
					);
				};

				// disconnect() will get called only if isConnected() (below)
				// returns success  In other words, if  connected, then disconnect:
				var disconnect = function () {
					display("attempting to disconnect");
					// if connected, do this:
					bluetoothSerial.disconnect(
						closePort,     // stop listening to the port
						showError      // show the error if you fail
					);
				};

				// here's the real action of the manageConnection function:
				if ($scope.canConnect) {
					bluetoothSerial.isConnected(disconnect, connect);
				}
				console.log("dbg030");
			};
			
			function openPort() {
				var afterReset = function(data) {
					var setProtocol = function(data) {
						display(data);
						
						var readSpeed = function(data) {
							display(data);
						}
						bluetoothSerial.write('010D\r', readSpeed, showError);
					}
					bluetoothSerial.write('atsp0\r', setProtocol, showError);
				}
				// if you get a good Bluetooth serial connection:
				display("Connected to: " + $scope.macAddress);
				// change the button's name:
				$("#connectButton").innerHTML = "Disconnect";
				$scope.canConnect = true;
				
				bluetoothSerial.write('atz\r', afterReset, showError);
			};

		/*
			unsubscribes from any Bluetooth serial listener and changes the button:
		*/
			function closePort() {
				// if you get a good Bluetooth serial connection:
				display("Disconnected from: " + $scope.macAddress);
				// change the button's name:
				$("#connectButton").innerHTML = "Connect";
				// unsubscribe from listening:
				bluetoothSerial.unsubscribe(
						function (data) {
							display(data);
						},
						showError
				);
			};
			
			function showError(error) {
				console.log("dbg099: " + error);
				display(error);
			};

			function display(message) {
				if (!$scope.message) {
					$scope.message = "";
				}
				$scope.message += message;
			};
			
			function clear() {
				$scope.message = "";
			};
			
			doWork();
		}
	])
})();