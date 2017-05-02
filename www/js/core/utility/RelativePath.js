(function(){
	'use strict';
	
	angular
		.module('siiMobilityApp')
		.factory('RelativePath', RelativePath)
	
	function RelativePath() {
		var service = {};
		service.images = 'img/mapicons/';
		service.labels = 'js/data/json/labels/';
		service.alerts = 'js/data/json/alerts/';
		service.profiles = 'js/data/json/profiles/';
		service.jsonFolder = 'js/data/json/';
		return service;
	}
})();