(function(){
	'use strict';
	
	angular
		.module('siiMobilityApp')
		.factory('Loading', Loading)
	
	Loading.$inject = [];
	function Loading() {
		var Loading = {

			show: function() {
				$('#loadingImage').show(0);
			},

			hide: function() {
				$('#loadingImage').hide(0);
			},
			
			showSettingsLoading: function() {
				$('#settingsLoadingImage').show(0);
			},

			hideSettingsLoading: function() {
				$('#settingsLoadingImage').hide(0);
			},

			showAutoSearchLoading: function () {
				$('#autoSearchLoadingImage').show(0);
			},

			hideAutoSearchLoading: function () {
				$('#autoSearchLoadingImage').hide(0);
			}
		}
		
		return Loading;
	}
})();