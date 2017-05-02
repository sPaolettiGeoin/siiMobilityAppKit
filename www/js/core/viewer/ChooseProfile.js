(function() {
	'use strict';
	
	angular
		.module('siiMobilityApp')
		.factory('ChooseProfile', ChooseProfile)
	
	ChooseProfile.$inject = ['RelativePath', 'SiiMobilityService'];
	function ChooseProfile(RelativePath, SiiMobilityService) {
		//console.log("dbg050: " + SiiMobilityService);
		var service = {};

		service.open = false;
		service.show = show;
		service.hide = hide;
		service.checkForBackButton = checkForBackButton;
		
		return service;

		function show (language) {
			//console.log("dbg440");

			$('#chooseProfile').show();
			ChooseProfile.open = true;
			//console.log("dbg090: " + SiiMobilityService);
			SiiMobilityService.addingMenuToCheck("ChooseProfile");
			//console.log("dbg092: " + SiiMobilityService);
		}

		function hide() {
			$('#chooseProfile').hide();
			localStorage.setItem("acceptInformation", true);
			//console.log("dbg200");
			localStorage.setItem("appVersion", SiiMobilityService.version);
			ChooseProfile.open = false;
			SiiMobilityService.removingMenuToCheck("ChooseProfile");
			//SiiMobilityService.startingApp();
		}

		function checkForBackButton () {
			//console.log("dbg700");
			var service = this;
			if (service.open) {
				service.hide();
				ChooseLanguage.show();
			}
		}
	}
})();