(function(){
	'use strict';
	
	angular
		.module('siiMobilityApp')
		.controller('GuideStyleCtrl', ['$scope', '$injector', '$ocLazyLoad', '$q', 'PrincipalMenu', 'SiiMobilityService', 'MapManager', 'InfoManager', 'Utility', 'SettingsManager',
		function($scope, $injector, $ocLazyLoad, $q, PrincipalMenu, SiiMobilityService, MapManager, InfoManager, Utility, SettingsManager) {
			$scope.varName = "GuideStyle";
			$scope.selectedDevice = {index: -1};
			$scope.message = "";
			$scope.buttonText = "Connect";
			
			var callings = [
				{
					action: "reset",
					message: "atz"
				}
			];
			var indexCalling = -1;
			
			function doWork() {
				PrincipalMenu.hide();
				init();
				//$("#map").hide();
			};
			
			function init() {
				$scope.menuHeaderTitle = "Stile di guida";
				
				var promise = setCall(bluetoothSerial.isEnabled);
				promise.then(function(data) {
					promise = setCall(bluetoothSerial.list);
					promise.then(function(results) {
						$scope.devices = results;
						$scope.canConnect = $scope.devices && typeof $scope.devices.length != "undefined";
					},
					function (error) {
						display(JSON.stringify(error));
					});
				},
				function(error) {
					showError(error);
				});
				
				show();
			};
			
			function setCall(method, param) {
				var deferred = $q.defer();
				if (!param) {
					method(deferred.resolve, deferred.reject);
				}
				else {
					method(param, deferred.resolve, deferred.reject);
				}
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
					var promise = setCall(bluetoothSerial.isConnected);
					promise.then(function(data) {
						display("attempting to disconnect");
						// if connected, do this:
						bluetoothSerial.disconnect(
							closePort,     // stop listening to the port
							showError      // show the error if you fail
						);
						promise = setCall(bluetoothSerial.disconnect);
						promise.then(function(data) {
							display("Disconnected from: " + $scope.devices[$scope.selectedDevice.index].address);
							// change the button's name:
							$scope.buttonText = "Connect";
							// unsubscribe from listening:
							promise = setCall(bluetoothSerial.unsubscribe);
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
					function(error) {
						$scope.canConnect = false;
						// if not connected, do this:
						// clear the screen and display an attempt to connect
						clear();
						display("Attempting to connect to " + $scope.devices[$scope.selectedDevice.index].address + ". " +
							"Make sure the serial port is open on the target device.");
						// attempt to connect:
						promise = setCall(bluetoothSerial.connect, $scope.devices[$scope.selectedDevice.index].address);
						promise.then(function(data) {
							openPort();
						},
						function(error) {
							showError(error);
						});
					});
				}
			};
			
			function openPort() {
				// if you get a good Bluetooth serial connection:
				display("Connected to: " + $scope.devices[$scope.selectedDevice.index].address);
				// change the button's name:
				$scope.buttonText = "Disconnect";
				$scope.canConnect = true;
				console.log("dbg062");
				
				var promise = setCall(bluetoothSerial.subscribe, '\r');
				promise.then(function(data) {
					console.log("dbg064");
					
					promise = setCall(bluetoothSerial.write, 'atz\r');
					promise.then(function(data) {
						display(data);
						
						console.log("dbg066");
						
						promise = setCall(bluetoothSerial.write, '010D\r');
						promise.then(function(data) {
							display(data);
						},
						function (data) {
							showError(error);
						});
					},
					function(error) {
						showError(error);
					});
				},
				function(error) {
					showError(error);
				});
			};
			
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