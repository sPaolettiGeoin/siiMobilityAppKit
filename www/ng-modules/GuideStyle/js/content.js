(function(){
	'use strict';
	
	angular
		.module('siiMobilityApp')
		.controller('GuideStyleCtrl', ['$scope', '$q', 'SiiMobilityService', 'PrincipalMenu', 'MapManager', 'InfoManager', 'Utility',
		function($scope, $q, SiiMobilityService, PrincipalMenu, MapManager, InfoManager, Utility) {
			$scope.varName = "GuideStyle";
			$scope.menuHeaderTitle = "Stile di guida";
			$scope.selectedDevice = {index: -1};
			$scope.message = "";
			$scope.buttonText = "Connect";
			
			$scope.communicationInitialized = false;
			
			function doWork() {
				PrincipalMenu.hide();
				init();
				$("#map").hide();
			};
			
			function init() {
				var promise = setCall(bluetoothSerial.isEnabled, "readBTState");
				
				promise.then(function(response) {
					promise = setCall(bluetoothSerial.list, "listOfDevices");
					promise.then(function(results) {
						$scope.devices = results;
						$scope.canConnect = $scope.devices && typeof $scope.devices.length != "undefined";
					});
				});
				
				show();
			};
			
			function setCall(methodToCall, action, param) {
				var msg = "Prepare call '" + action + "'";
				if (typeof param != "undefined") {
					msg += " with param: " + param;
				}
				console.log(msg);
				
				var deferred = $q.defer();
				if (!param) {
					methodToCall(deferred.resolve, showError);
				}
				else {
					methodToCall(param, deferred.resolve, showError);
				}
				deferred.promise.then(function(response) {
					console.log("Response from call '" + action + "': '" + response + "'");
					return response;
				});
				return deferred.promise;
			}
			
			function show () {
				SiiMobilityService.resetInterface();
				MapManager.showMenuReduceMap("#" + $scope.idMenu);
				//$("#" + $scope.idMenu + "Expand").hide();
				$scope.open = true;
				InfoManager.addingMenuToManage($scope.varName);
				SiiMobilityService.addingMenuToCheck($scope.varName);
				SiiMobilityService.setBackButtonListener();
				//refreshMenu();
				//$scope.expandHealthCare();
				Utility.expandMenu("#" + $scope.varName,
								   "#" + $scope.varName + "Expand",
								   "#" + $scope.varName + "Collapse");
			};
			
			$scope.manageConnection = function() {
				if ($scope.canConnect) {
					var device = $scope.devices[$scope.selectedDevice.index].address;
					var promise = setCall(bluetoothSerial.isConnected, "readDeviceState", device);
					promise.then(function(state) {
						if (state === "Not connected.") {
							openConnection();
						}
						else {
							closeConnection();
						}
					});
				}
			};
			
			function openConnection() {
				var device = $scope.devices[$scope.selectedDevice.index].address;
				$scope.canConnect = false;
				clear();
				
				display("Attempting to connect to " + device + ". Make sure the serial port is open on the target device.");
				// attempt to connect:
				var promise = setCall(bluetoothSerial.connect, "connect", device);
				promise.then(function(data) {
					display("Connected to: " + device);
					// change the button's name:
					$scope.buttonText = "Disconnect";
					$scope.canConnect = true;
					
					promise = setCall(bluetoothSerial.subscribe, "subscribe", '\r');
					promise.then(function(data) {
						receiver(data);
						var promise = setCall(bluetoothSerial.write, "reset", 'atz\r');
						promise.then(function(data) {
							promise = setCall(bluetoothSerial.write, "protocol", 'atsp0\r');
							promise.then(function() {
								$scope.communicationInitialized = true;
							});
						});
					});
				});
			}
			
			function receiver(data) {
				console.log("Received async data: " + data);
				clear();
				if (new RegExp("^41\\s.*").test(data)) {
					convert(data);
				}
				else {
					display("Something wrong");
				}
			}
			
			function closeConnection() {
				var device = $scope.devices[$scope.selectedDevice.index].address;
				var promise = setCall(bluetoothSerial.disconnect, "disconnect");
				promise.then(function(data) {
					display("Disconnected from: " + device);
					// change the button's name:
					$scope.buttonText = "Connect";
					// unsubscribe from listening:
					promise = setCall(bluetoothSerial.unsubscribe, "unsubscribe");
					promise.then(function(data) {
						display(data);
					});
				});
			}
			
			$scope.readTemp = function() {
				var promise = setCall(bluetoothSerial.write, "Engine coolant temperature", '0105\r');
				promise.then();
			}
			
			function convert(data) {
				var bytes = data.split(" ");
				if (bytes && bytes.length >= 3) {
					var message = bytes[1];
					if (message === "05") {
						var absTemp = parseInt(bytes[2], 16);
						var realTemp = absTemp - 40;
						display("Engine temp: " + realTemp);
					}
				}
				else {
					display("Something wrong");
				}
			}
			
			function showError(error) {
				display(error);
			};

			function display(message) {
				console.log("OnSceen: " + message);
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