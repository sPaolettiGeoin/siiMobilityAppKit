(function(){
	'use strict';
	
	angular
		.module('siiMobilityApp')
		.factory('SiiMobilityService', SiiMobilityService)
	
	function SiiMobilityService() {
		var service = {};
		
		service.uid = null;
		service.uid2 = null;
		service.remoteJsonUrl = "http://www.disit.org/km4city/appdevkit/";
		
		service.appID = "smak-x";
		service.version = "0.0.1";
		service.menuToCheckArray = [];
	    
		service.checkConnection = checkConnection;
	    service.getAppID = getAppID;
		service.getMenuToCheckArray = getMenuToCheckArray;
		service.addingMenuToCheck = addingMenuToCheck;
		service.resetInterface = resetInterface;
		service.onResize = onResize;
		service.removingMenuToCheck = removingMenuToCheck;
		service.setBackButtonListener = setBackButtonListener;
		service.resetBackButtonListener = resetBackButtonListener;
	    
	    return service;
		
		function checkConnection() {
			var networkState = navigator.connection.type;
			return networkState != Connection.NONE;
		}
	    
	    function getAppID() {
	    	return this.appID;
	    }
		
		function getMenuToCheckArray() {
			return service.menuToCheckArray;
		}
		
		function addingMenuToCheck(menuToCheck){
			service.menuToCheckArray.unshift(menuToCheck);
		}
		
		function resetInterface(){
			console.log("dbg456: " + service.menuToCheckArray.length);
			for (var i = service.menuToCheckArray.length - 1; i >= 0; i--) {
				if (window[service.menuToCheckArray[i]] != null) {
					if (window[service.menuToCheckArray[i]]["closeAll"] != null) {
						window[service.menuToCheckArray[i]]["closeAll"]();
					}
				}
			}
		}
		
		function onResize() {
			for (var i = 0; i < service.menuToCheckArray.length; i++) {
				if (window[service.menuToCheckArray[i]] != null) {
					if (window[service.menuToCheckArray[i]]["refreshMenuPosition"] != null) {
						window[service.menuToCheckArray[i]]["refreshMenuPosition"]();
					}
				}
			}
		}
		
		function removingMenuToCheck(menuToCheck) {
			var index = service.menuToCheckArray.indexOf(menuToCheck);
			if (index != -1) {
				service.menuToCheckArray.splice(service.menuToCheckArray.indexOf(menuToCheck), 1);
			}
		}
		
		function setBackButtonListener() {
			if (device.platform == "Win32NT" || device.platform == "windows") {
				document.addEventListener('backbutton', onBackKeyDown, false);
			}
		}

		function resetBackButtonListener () {
			if (device.platform == "Win32NT" || device.platform == "windows") {
				document.removeEventListener('backbutton', onBackKeyDown, false);
			}
		}
	}
})();