(function(){
	'use strict';
	
	angular
		.module('siiMobilityApp')
		.factory('Parameters', Parameters)
	
	function Parameters() {
		var service = {};
		service.timeoutSplashScreen = 7000;
		service.timeoutStartApplication = 2000;
		service.textSizeCategorySearcher = 22;
		service.timeoutGettingMenuCategorySearcher = 2500;
		service.veryLargePanelCategorySearcher = 453;
		service.largePanelCategorySearcher = 420;
		service.mediumPanelCategorySearcher = 385;
		service.normalPanelCategorySearcher = 350;
		service.smallPanelCategorySearcher = 315;
		service.verySmallPanelCategorySearcher = 278;
		service.timeoutGetQuery = 30000;
		service.timeoutPostQuery = 20000;
		service.timeoutGPS = 8000;
		service.distsQueryManager = 0.3;
		service.resultsQueryManager = 50;
		service.limitDistance = 150;
		service.peridoNightDat = 1800000;
		service.maxRowLog = 100;
		service.hidePanelGeneralDuration = 0;
		
		return service;
	}
})();