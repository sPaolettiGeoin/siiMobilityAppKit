(function(){
	'use strict';
	
	angular
		.module('siiMobilityApp')
		.factory('Globalization', Globalization)
	
Globalization.$inject = ['RelativePath', 'SiiMobilityService', 'Parameters', 'Utility'];
function Globalization(RelativePath, SiiMobilityService, Parameters, Utility) {
	var service = {};

    service.labels = null;
    service.alerts = null;
	
	service.refresh = refresh;
	service.modifyLabels = modifyLabels;
	service.readWelcome = readWelcome;
	service.readDisclaimerText = readDisclaimerText;
	service.readDisclaimerLink = readDisclaimerLink;
	
	return service;

    function refresh(language) {
		var service = this;
		//console.log("dbg450");
        $.ajax({
            url: RelativePath.labels + "labels." + language + ".json",
            async: false,
            dataType: "json",
            success: function(data) {
				//console.log("dbg452: " + JSON.stringify(data));
                service.labels = data;
				//console.log("dbg454: " + service.labels.principalMenu.headerTitle);
            }
        });
        $.ajax({
            url: RelativePath.alerts + "alerts." + language + ".json",
            async: false,
            dataType: "json",
            success: function (data) {
                service.alerts = data;
            }
        });
		//console.log("dbg470");
        $.ajax({
            url: RelativePath.alerts + "alerts." + device.platform + "." + language + ".json",
            async: false,
            dataType: "json",
            success: function (data) {
				//console.log("dbg472");
                $.extend(service.alerts, data);
            }
        });
		//console.log("dbg480");
        Utility.loadFilesInsideDirectory("www/js/modules/", null, "labels." + language + ".json", true, loadAndAddLabels, function (e) {
            Utility.loadFilesInsideDirectory("www/js/modules/", null, "alerts." + language + ".json", true, loadAndAddAlerts, function (e) {
                Utility.loadFilesInsideDirectory("www/js/modules/", null, "alerts." + device.platform + "." + language + ".json", true, loadAndAddAlerts, function (e) {
					//console.log("dbg482");
                    $.ajax({
						url: SiiMobilityService.remoteJsonUrl + "labels/labels." + language + ".json",
                        cache: false,
                        timeout: Parameters.timeoutGettingMenuCategorySearcher,
                        dataType: "json",
                        success: function (data) {
                            service.modifyLabels(data);
                            //PrincipalMenu.refreshMenu();
                        }
                    });
                    $.ajax({
                        url: SiiMobilityService.remoteJsonUrl + "alerts/alerts." + language + ".json",
                        cache: false,
                        timeout: Parameters.timeoutGettingMenuCategorySearcher,
                        dataType: "json",
                        success: function (data) {
                            modifyAlerts(data);
                            //PrincipalMenu.refreshMenu();
                        }
                    });
                    $.ajax({
                        url: SiiMobilityService.remoteJsonUrl + "alerts/alerts." + device.platform + "." + language + ".json",
                        cache: false,
                        timeout: Parameters.timeoutGettingMenuCategorySearcher,
                        dataType: "json",
                        success: function (data) {
                            modifyAlerts(data);
                            //PrincipalMenu.refreshMenu();
                        }
                    });
                })
            })
        });
    }

    function loadAndAddLabels (fullPath) {
        $.ajax({
            url: fullPath,
            async: false,
            dataType: "json",
            success: function (data) {
                service.modifyLabels(data);
            }
        });
       
    }

    function loadAndAddAlerts (fullPath) {
        $.ajax({
            url: fullPath,
            async: false,
            dataType: "json",
            success: function (data) {
                modifyAlerts(data);
            }
        });
    }

    function modifyLabels (labelsToAdd) {
		var service = this;
		//console.log("dbg800: " + service);
        for (var objectName in labelsToAdd) {
            for (var fieldName in labelsToAdd[objectName]) {
                if (service.labels[objectName] != null) {
                    service.labels[objectName][fieldName] = labelsToAdd[objectName][fieldName];
                } else {
                    var jsonObject = {};
                    jsonObject[fieldName] = labelsToAdd[objectName][fieldName];
                    service.labels[objectName]= jsonObject;
                }
            }
        }
    }
	
	function readWelcome () {
		var service = this;
		var welcome = "";
		if (service.labels && service.labels.chooseProfile && service.labels.chooseProfile.welcome) {
			welcome = service.labels.chooseProfile.welcome;
		}
		return welcome;
	}
	
	function readDisclaimerText () {
		var service = this;
		var disclaimerText = "";
		if (service.labels && service.labels.chooseProfile && service.labels.chooseProfile.disclaimerText) {
			disclaimerText = service.labels.chooseProfile.disclaimerText;
		}
		return disclaimerText;
	}
	
	function readDisclaimerLink () {
		var service = this;
		var disclaimerLink = "";
		if (service.labels && service.labels.chooseProfile && service.labels.chooseProfile.disclaimerLink) {
			disclaimerLink = service.labels.chooseProfile.disclaimerLink;
		}
		return disclaimerLink;
	}

    function modifyAlerts (alertsToAdd) {
		var service = this;
        for (var objectName in alertsToAdd) {
            for (var fieldName in alertsToAdd[objectName]) {
                if (service.alerts[objectName] != null) {
                    service.alerts[objectName][fieldName] = alertsToAdd[objectName][fieldName];
                } else {
                    var jsonObject = {};
                    jsonObject[fieldName] = alertsToAdd[objectName][fieldName];
                    service.alerts[objectName] = jsonObject;
                }
            }
        }
    }
}
})();