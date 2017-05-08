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
			return this.menuToCheckArray;
		}
		
		function addingMenuToCheck(menuToCheck){
			this.menuToCheckArray.unshift(menuToCheck);
		}
		
		function resetInterface(){
			for (var i = this.menuToCheckArray.length - 1; i >= 0; i--) {
				if (window[this.menuToCheckArray[i]] != null) {
					if (window[this.menuToCheckArray[i]]["closeAll"] != null) {
						window[this.menuToCheckArray[i]]["closeAll"]();
					}
				}
			}
		}
		
		function onResize() {
			console.log("dbg600: " + this);
			console.log("dbg610: " + this.menuToCheckArray);
			for (var i = 0; i < this.menuToCheckArray.length; i++) {
				if (window[$scope.menuToCheckArray[i]] != null) {
					if (window[$scope.menuToCheckArray[i]]["refreshMenuPosition"] != null) {
						window[$scope.menuToCheckArray[i]]["refreshMenuPosition"]();
					}
				}
			}
		}
		
		function removingMenuToCheck(menuToCheck) {
			var index = this.menuToCheckArray.indexOf(menuToCheck);
			if (index != -1) {
				this.menuToCheckArray.splice(this.menuToCheckArray.indexOf(menuToCheck), 1);
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