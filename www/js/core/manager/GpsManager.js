(function() {
	'use strict';
	
	angular
		.module('siiMobilityApp')
		.factory('GpsManager', GpsManager)
	
	GpsManager.$inject = ['Parameters'];
	function GpsManager(Parameters) {
		var service = {};

		service.checkGPS = null;
		service.timeout = Parameters.timeoutGPS;
		service.mode = null;
		service.status = false;
		service.latitude = null;
		service.longitude = null;
		service.heading = null;
		service.accuracy = null;
		service.altitude = null;
		service.speed = null;
		service.timestamp = null;
		service.gpsStarted = false;
		service.watchID = null;
		
		service.refresh = refresh;
		service.initializePosition = initializePosition;
		service.watchingPosition = watchingPosition;
		service.stopWatchingPosition = stopWatchingPosition;
		service.onSuccessInit = onSuccessInit;
		service.onErrorInit = onErrorInit;
		
		return service;

		function refresh (gpsPosition){
			//console.log("dbg300");
			var service = this;
			
			if (gpsPosition == "true" && service.gpsStarted == false) {
				service.initializePosition();
			} else if (gpsPosition == "false" && service.gpsStarted == true) {
				service.stopWatchingPosition();
				MapManager.removeGpsMarker();
				service.gpsStarted = false;
			}
		}

		function initializePosition () {
			var service = this;
			
			if (service.gpsStarted == false) {
				if (device.platform == "Android" || device.platform == "iOS") {
					if (device.platform == "iOS"){
						setInterval(function(){
									CheckGPS.check(function(){service.status = true}, function(){service.status = false})
									}, 20000);
					}
					CheckGPS.check(function () {
						var options = { timeout: service.timeout, enableHighAccuracy: true };
						//console.log("dbg010: " + typeof onSuccessInit);
						//console.log("dbg020: " + typeof onErrorInit);
						navigator.geolocation.getCurrentPosition(service.onSuccessInit, service.onErrorInit, options);
						//console.log("dbg030");
					},
						function () {
							if (service.checkGPS === null) {
								MapManager.disableGpsZoom();
								service.checkGPS = setInterval(function () {
									service.initializePosition();
								}, service.timeout);
							}
						});
				}
				if (device.platform == "Win32NT" || device.platform == "windows" || device.platform == "Web") {
					navigator.geolocation.getCurrentPosition(service.onSuccessInit, service.onErrorInit, {
						timeout: service.timeout
					});
				}
			}
		}

		function onSuccessInit(position) {
			console.log("dbg040: " + position);
			var service = this;
			
			if (service.checkGPS != null) {
				clearInterval(service.checkGPS);
			}
			service.status = true;
			service.latitude = position.coords.latitude;
			service.longitude = position.coords.longitude;
			service.heading = Math.round(position.coords.heading);
			service.accuracy = position.coords.accuracy;
			service.timestamp = position.timestamp;
			if (position.coords.altitude != null && position.coords.speed != null) {
				service.altitude = position.coords.altitude;
				service.speed = position.coords.speed;
				service.mode = "gps";
			} else {
				service.mode = "network";
			}
			service.watchingPosition();
			service.gpsStarted = true;
			MapManager.initializeGpsMarker(service.latitude, service.longitude);
			if (typeof Notificator != "undefined") {
				Notificator.startNotifySuggestions();
			}
		}

		function onErrorInit(error) {
			var service = this;
			
			if (service.checkGPS === null) {
				navigator.notification.alert(Globalization.alerts.positionWarning.message, function() {}, Globalization.alerts.positionWarning.title);
				if (error.code != 1)
					service.checkGPS = setInterval(function() {
						service.initializePosition();
					}, service.timeout);
			}
		}

		function watchingPosition() {
			var service = this;
			
			var options = { timeout: service.timeout, enableHighAccuracy: true };
			service.watchID = navigator.geolocation.watchPosition(onSuccessUpdate, onErrorUpdate, options);
		}

		function stopWatchingPosition(){
			var service = this;
			
			navigator.geolocation.clearWatch(service.watchID);
			service.watchID = null;
		}

		function onSuccessUpdate (position) {
			var service = this;
			
			service.status = true;
			service.latitude = position.coords.latitude;
			service.longitude = position.coords.longitude;
			service.heading = Math.round(position.coords.heading);
			service.accuracy = position.coords.accuracy;
			service.timestamp = position.timestamp;
			if (position.coords.altitude != null && position.coords.speed != null) {
				service.altitude = position.coords.altitude;
				service.speed = position.coords.speed;
				service.mode = "gps";
			} else {
				service.mode = "network";
			}
			if (service.heading != null && !isNaN(service.heading) && CompassManager.isAvailable != true) {
				MapManager.updateRotation(service.heading, "gps");
			}
			MapManager.updateGpsMarker(service.latitude, service.longitude);
		}

		function onErrorUpdate(error) {
			// Nothing To Do
		}

		function currentCoordinates() {
			var service = this;
			
			if (service.latitude != null && service.longitude != null) {
				return [service.latitude, service.longitude];
			}
			return null;
		}

		function getDistanceFromLatLonInM(lat1, lon1, lat2, lon2) {
			var service = this;
			
			var R = 6371; // Radius of the earth in km
			var dLat = service.deg2rad(lat2 - lat1); // deg2rad below
			var dLon = service.deg2rad(lon2 - lon1);
			var a =
				Math.sin(dLat / 2) * Math.sin(dLat / 2) +
				Math.cos(service.deg2rad(lat1)) * Math.cos(service.deg2rad(lat2)) *
				Math.sin(dLon / 2) * Math.sin(dLon / 2);
			var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
			var d = R * c; // Distance in km
			return d * 1000;
		}

		function getDistanceFromGPSInM(latitude, longitude) {
			var service = this;
			
			if (service.latitude != null && service.longitude != null) {
				var R = 6371; // Radius of the earth in km
				var dLat = service.deg2rad(service.latitude - latitude); // deg2rad below
				var dLon = service.deg2rad(service.longitude - longitude);
				var a =
					Math.sin(dLat / 2) * Math.sin(dLat / 2) +
					Math.cos(service.deg2rad(latitude)) * Math.cos(service.deg2rad(service.latitude)) *
					Math.sin(dLon / 2) * Math.sin(dLon / 2);
				var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
				var d = R * c; // Distance in km
				return d * 1000;
			} else {
				return null;
			}
		}

		function deg2rad(deg) {
			return deg * (Math.PI / 180)
		}
	}
})();