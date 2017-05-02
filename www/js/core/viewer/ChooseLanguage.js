(function(){
	'use strict';
	
	angular
		.module('siiMobilityApp')
		.factory('ChooseLanguage', ChooseLanguage)
	
	ChooseLanguage.$inject = ['RelativePath', 'SettingsManager', 'ChooseProfile'];
	function ChooseLanguage(RelativePath, SettingsManager, ChooseProfile) {
		var service = {};

		service.open = false;
		
		service.show = show;
		service.hide = hide;
		
		return service;

		function show () {
			//console.log("dbg800");
			var service = this;
			
			$('#chooseLanguage').show();
			service.open = true;
		}

		function hide(choosenLanguage) {
			var service = this;
			//console.log("dbg810");
			$('#chooseLanguage').hide();
			//console.log("dbg260: " + typeof SettingsManager.initializeSettings);
			SettingsManager.initializeSettings("true");
			service.open = false;
			ChooseProfile.show(choosenLanguage);
		}
	}
})();