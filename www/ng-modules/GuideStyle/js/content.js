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
				console.log("dbg promise: " + promise);
				promise.then(function(response) {
					console.log("Send action '" + nextCalling.actionName + "' with response '" + response + "'");
					nextCalling = getNextAction(initCallings);
					promise = setCall(nextCalling);
					promise.then(function(results) {
						console.log("Send action '" + nextCalling.actionName + "' with response '" + results + "'");
						$scope.devices = results;
						$scope.canConnect = $scope.devices && typeof $scope.devices.length != "undefined";
					},
					function (error) {
						console.log("dbg999: " + error);
						display(JSON.stringify(error));
					});
				},
				function(error) {
					console.log("dbg998: " + error);
					showError(error);
				});
				
				show();
			};
			
			function setCall(objectCall, dynamicParam) {
				console.log("Prepare call to " + objectCall.actionName);
				console.log("objectCall.method: " + objectCall.method);
				console.log("bluetoothSerial is null: " + bluetoothSerial == null);
				
				var param = null;
				if (dynamicParam) {
					param = dynamicParam;
				}
				else if (objectCall.message) {
					param = objectCall.message;
				}

				var deferred = $q.defer();
				if (!param) {
					objectCall.method(deferred.resolve, deferred.reject);
				}
				else {
					objectCall.method(param, deferred.resolve, deferred.reject);
				}
				console.log("dbg qui si arriva?");
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
					var promise = setCall(bluetoothSerial.isConnected);
					promise.then(function(isConected) {
						var nextCalling = getNextAction(disconnectionCallings);
						promise = setCall(nextCalling);
						promise.then(function(data) {
							display("Disconnected from: " + device);
							// change the button's name:
							$scope.buttonText = "Connect";
							// unsubscribe from listening:
							nextCalling = getNextAction(disconnectionCallings);
							promise = setCall(nextCalling);
							promise.then(function(data) {
								display(data);
							},
							function(error) {
								showError(error);
							});
						},
						function(error) {
							showError(error);
						});
					},
					function(isDisconnected) {
						$scope.canConnect = false;
						clear();
						
						display("Attempting to connect to " + device + ". Make sure the serial port is open on the target device.");
						// attempt to connect:
						var nextCalling = getNextAction(connectionCallings);
						console.log("dbg333: " + nextCalling);
						promise = setCall(nextCalling, device);
						promise.then(function(data) {
							display("Connected to: " + device);
							// change the button's name:
							$scope.buttonText = "Disconnect";
							$scope.canConnect = true;
							console.log("dbg062");
							
							nextCalling = getNextAction(connectionCallings);
							promise = setCall(nextCalling);
							promise.then(function(data) {
								console.log("dbg064. Received: " + data);
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
							},
							function(error) {
								showError(error);
							});
						},
						function(error) {
							showError(error);
						});
					});
				}
			};
			
			$scope.readTemp = function() {
				var nextCalling = getNextAction(tempCallings);
				var promise = setCall(nextCalling);
				promise.then(function(data) {
					display(data);
				},
				function(error) {
					showError(error);
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