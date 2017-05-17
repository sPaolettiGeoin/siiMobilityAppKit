(function(){
	'use strict';
	
	angular
		.module('siiMobilityApp')
		.controller('GuideStyleCtrl', ['$scope', '$injector', '$ocLazyLoad', '$q', 'PrincipalMenu', 'SiiMobilityService', 'MapManager', 'InfoManager', 'Utility', 'SettingsManager',
		function($scope, $injector, $ocLazyLoad, $q, PrincipalMenu, SiiMobilityService, MapManager, InfoManager, Utility, SettingsManager) {
			$scope.varName = "GuideStyle";
			$scope.menuHeaderTitle = "Stile di guida";
			$scope.selectedDevice = {index: -1};
			$scope.message = "";
			$scope.buttonText = "Connect";
			
			var initCallings = {
				actualIndex: -1,
				actions:
				[
					{
						actionName: "ReadBTState",
						method: bluetoothSerial.isEnabled
					},
					{
						actionName: "ListDevices",
						method: bluetoothSerial.list
					}
				]
			}
			
			var stateCallings = {
				actualIndex: -1,
				actions:
				[
					{
						actionName: "reading state",
						method: bluetoothSerial.isConnected
					}
				]
			}
			
			var connectionCallings = {
				actualIndex: -1,
				actions:
				[
					{
						actionName: "attempting to connect",
						method: bluetoothSerial.connect
					},
					{
						actionName: "subscribe",
						method: bluetoothSerial.subscribe,
						message: "\r"
					}
				]
			}
			
			var disconnectionCallings = {
				actualIndex: -1,
				actions:
				[
					{
						actionName: "attempting to disconnect",
						method: bluetoothSerial.disconnect
					},
					{
						actionName: "unsubscribe",
						method: bluetoothSerial.unsubscribe
					}
				]
			}
			
			//Engine coolant temperature
			var tempCallings = {
				actualIndex: -1,
				actions:
				[
					{
						actionName: "reset",
						method: bluetoothSerial.write,
						message: "atz\r"
					},
					{
						actionName: "protocol",
						method: bluetoothSerial.write,
						message: "atsp0\r"
					},
					{
						actionName: "Engine coolant temperature",
						method: bluetoothSerial.write,
						message: "0105"
					}
				]
			}
			
			function getNextAction(typeCallings) {
				typeCallings.actualIndex++;
				return typeCallings.actions[typeCallings.actualIndex];
			}
			
			function doWork() {
				PrincipalMenu.hide();
				init();
				$("#map").hide();
			};
			
			function init() {
				var nextCalling = getNextAction(initCallings);
				var promise = setCall(nextCalling);
				
				promise.then(function(response) {
					//console.log("Send action '" + nextCalling.actionName + "' with response '" + response + "'");
					nextCalling = getNextAction(initCallings);
					promise = setCall(nextCalling);
					promise.then(function(results) {
						//console.log("Send action '" + nextCalling.actionName + "' with response '" + results + "'");
						$scope.devices = results;
						$scope.canConnect = $scope.devices && typeof $scope.devices.length != "undefined";
					});
				});
				
				show();
			};
			
			function setCall(objectCall, dynamicParam) {
				console.log("Prepare call to " + objectCall.actionName);
				
				var param = null;
				if (dynamicParam) {
					param = dynamicParam;
				}
				else if (objectCall.message) {
					param = objectCall.message;
				}

				var deferred = $q.defer();
				if (!param) {
					objectCall.method(deferred.resolve, showError);
				}
				else {
					objectCall.method(param, deferred.resolve, showError);
				}
				deferred.promise.then(function(response) {
					console.log("Sent action '" + objectCall.actionName + "' with response '" + response + "'");
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
					var nextCalling = getNextAction(stateCallings);
					var promise = setCall(nextCalling, device);
					promise.then(function(state) {
						console.log('state === "Not connected": ' + (state === "Not connected."));
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
				var nextCalling = getNextAction(connectionCallings);
				var promise = setCall(nextCalling, device);
				promise.then(function(data) {
					display("Connected to: " + device);
					// change the button's name:
					$scope.buttonText = "Disconnect";
					$scope.canConnect = true;
					
					nextCalling = getNextAction(connectionCallings);
					promise = setCall(nextCalling);
					promise.then(function(data) {
						clear();
						if (new RegExp("^41 .*").test(data)) {
							var bytes = data.split(" ");
							if (bytes && bytes.length >= 3) {
								var absTemp = parseInt(bytes[2], 16);
								var realTemp = absTemp - 40;
								display("Engine temp: " + realTemp);
							}
							else {
								display("Engine temp: " + "something wrong");
							}
						}
					});
				});
			}
			
			function closeConnection() {
				var device = $scope.devices[$scope.selectedDevice.index].address;
				var nextCalling = getNextAction(disconnectionCallings);
				var promise = setCall(nextCalling);
				promise.then(function(data) {
					display("Disconnected from: " + device);
					// change the button's name:
					$scope.buttonText = "Connect";
					// unsubscribe from listening:
					nextCalling = getNextAction(disconnectionCallings);
					promise = setCall(nextCalling);
					promise.then(function(data) {
						display(data);
					});
				});
			}
			
			$scope.readTemp = function() {
				var nextCalling = getNextAction(tempCallings);
				var promise = setCall(nextCalling);
				promise.then(function(data) {
					display(data);
				});
			}
			
			function showError(error) {
				display(error);
			};

			function display(message) {
				console.log("dbgxxx: " + message);
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