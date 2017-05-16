(function(){
	'use strict';
	
	angular
		.module('siiMobilityApp')
		.controller('GuideStyleCtrl', ['$scope', '$injector', '$ocLazyLoad', '$q', 'PrincipalMenu', 'SiiMobilityService', 'MapManager', 'InfoManager', 'Utility', 'SettingsManager',
		function($scope, $injector, $ocLazyLoad, $q, PrincipalMenu, SiiMobilityService, MapManager, InfoManager, Utility, SettingsManager) {
			$scope.varName = "GuideStyle";
			$scope.selectedDevice = {index: -1};
			$scope.message = "";
			
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
				
				var deferred = $q.defer();
				bluetoothSerial.isEnabled(
					deferred.resolve,
					function() {display("Bluetooth is not enabled.")}
				);
				var promise = deferred.promise;
				promise.then(function(data) {
					deferred = $q.defer();
					bluetoothSerial.list(
						deferred.resolve,
						function(error) {display(JSON.stringify(error));}
					);
					var promise = deferred.promise;
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
			
			function doCall(method) {
				var deferred = $q.defer();
				method(deferred.resolve, deferred.reject);
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
				// connect() will get called only if isConnected() (below)
				// returns failure. In other words, if not connected, then connect:
				var connect = function () {
					$scope.canConnect = false;
					// if not connected, do this:
					// clear the screen and display an attempt to connect
					clear();
					display("Attempting to connect to " + $scope.devices[$scope.selectedDevice.index].address + ". " +
						"Make sure the serial port is open on the target device.");
					// attempt to connect:
					bluetoothSerial.connect(
						$scope.devices[$scope.selectedDevice.index].address,  // device to connect to
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
			
			function doCall(method, success) {
				var deferred = $q.defer();
				
				indexCalling++;
				bluetoothSerial.write(callings[indexCalling].message + '\r', deferred.resolve, showError);
				method
				
				return doCall.promise;
			}
			
			function openPort() {
				var afterSubscription = function(data) {
					var setProtocol = function(data) {
						display(data);
						
						var readSpeed = function(data) {
							display(data);
						}
						console.log("dbg066");
						bluetoothSerial.write('010D\r', readSpeed, showError);
					}
					console.log("dbg064");
					bluetoothSerial.write('atz\r', setProtocol, showError);
				}
				// if you get a good Bluetooth serial connection:
				display("Connected to: " + $scope.devices[$scope.selectedDevice.index].address);
				// change the button's name:
				$("#connectButton").innerHTML = "Disconnect";
				$scope.canConnect = true;
				console.log("dbg062");
				bluetoothSerial.subscribe('\r', afterSubscription, showError);
			};

		/*
			unsubscribes from any Bluetooth serial listener and changes the button:
		*/
			function closePort() {
				// if you get a good Bluetooth serial connection:
				display("Disconnected from: " + $scope.devices[$scope.selectedDevice.index].address);
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