(function(){
	'use strict';
	
	angular
		.module('siiMobilityApp')
		.factory('SettingsManager', SettingsManager)
	
	SettingsManager.$inject = ['SiiMobilityService', 'RelativePath', 'Globalization', 'CategorySearcher', 'GpsManager', 'QueryManager', 'PrincipalMenu', 'Parameters'];
	function SettingsManager(SiiMobilityService, RelativePath, Globalization, CategorySearcher, GpsManager, QueryManager, PrincipalMenu, Parameters) {
		var service = {};

		service.urlDefaultSettings = RelativePath.jsonFolder + "defaultSettings.json";
		
		service.open = false;
		service.menu = null;
		service.defaultSettings = null;
		service.language = null;
		service.textSize = null;
		service.maxDistance = null;
		service.maxDistanceRecommender = null;
		service.numberOfItems = null;
		service.track = null;
		service.scanPeriod = null;
		service.profile = null;
		service.notifySuggestions = null;
		service.notifyInfoSoc = null;
		service.notifyPersonalAssistant = null;
		service.notifyPeriod = null;
		service.periodBackgroundNotifier = null;
		service.nightDay = null;
		service.chronologyMaxSize = null;
		service.gpsPosition = null;
		
		service.initializeSettings = initializeSettings;
		service.refreshMenu = refreshMenu;
		service.refreshAll = refreshAll;
		service.hideSettingsMenu = hideSettingsMenu;
		
		return service;

		function initializeSettings (settingsOnInit) {
			var service = this;
			//console.log("dbg280: " + "");
			
			if (service.defaultSettings == null) {
				$.ajax({
					url: service.urlDefaultSettings,
					async: false,
					dataType: "json",
					success: function(data) {
						//console.log("dbg282: " + "");
						service.defaultSettings = data
					}
				});
			}
			
			for (var setting in service.defaultSettings) {
				if (localStorage.getItem(setting) === null) {
					localStorage.setItem(setting, service.defaultSettings[setting]);
				}
				service[setting] = localStorage.getItem(setting);
			}
			//console.log("dbg284: " + "");
			if (service["language"] == "it") {
				localStorage.setItem("language", "ita");
			} else if (service["language"] == "es") {
				localStorage.setItem("language", "esp");
			} else if (service["language"] == "en") {
				localStorage.setItem("language", "eng");
			} else if (service["language"] == "fr") {
				localStorage.setItem("language", "fra");
			} else if (service["language"] == "de") {
				localStorage.setItem("language", "deu");
			}
			service["language"] = localStorage.getItem("language");
			//console.log("dbg286");
			if (settingsOnInit == "true") {
				//console.log("dbg284: " + typeof Globalization.refresh);
				Globalization.refresh(service["language"]);
				PrincipalMenu.refreshMenu();
				//console.log("dbg286: " + "");
				service.refreshMenu();
			} else {
				service.refreshAll();
			}
			//console.log("dbg288");
			
		}

		resetSettings = function() {
			var service = this;
			for (var setting in service.defaultSettings) {
				service[setting] = service.defaultSettings[setting];
			}
			service.refreshMenu();
		}

		function saveSettings () {
			var service = this;
			for (var setting in service.defaultSettings) {
				service[setting] = $("[name='" + setting+"']").val();
				localStorage.setItem(setting, service[setting]);
			}
			service.refreshAll();
		}

		function cancelChanges () {
			var service = this;
			for (var setting in service.defaultSettings) {
				if (localStorage.getItem(setting) === null) {
					localStorage.setItem(setting, service.defaultSettings[setting]);
				}
				service[setting] = localStorage.getItem(setting);
			}
		}

		function refreshMenu () {
			var service = this;
			//console.log("dbg490");
			$.ajax({
				url: RelativePath.jsonFolder + "settingsMenu/settingsMenu." + service.language + ".json",
				async: false,
				dataType: "json",
				success: function(data) {
					service.menu = data;
				}
			});
			//console.log("dbg300");
			for (var i = 0; i < service.menu.Settings.groups.length; i++) {
				for (var j = 0; j < service.menu.Settings.groups[i].items.length; j++) {
					var item = service.menu.Settings.groups[i].items[j];
					if (item.options != null) {
						for (var l = 0; l < item.options.length; l++) {
							var option = item.options[l];
							if (option.key == service[item.key]) {
								service.menu.Settings.groups[i].items[j].options[l].selected = "selected";
							}
						}
					}
				}
			}
			//console.log("dbg310");
			service.menu.Settings.platform = device.platform;
			//console.log("dbg320");
			if ($("#settingsMenu").length == 0) {
				$("#indexPage").append("<div id=\"settingsMenu\" class=\"commonMenu\"></div>")
			}
			//console.log("dbg330");
			//ViewManager.render(service.menu, "#settingsMenu", null);
			//console.log("dbg340");
		}

		function showSettingsMenu () {
			var service = this;
			service.refreshMenu();
			$('#settingsMenu').show();
			service.open = true;
			//console.log("dbg170");
			application.addingMenuToCheck("SettingsManager");
			application.setBackButtonListener();
		}

		function hideSettingsMenu () {
			var service = this;
			setTimeout(function () {
				$('#settingsMenu').hide(Parameters.hidePanelGeneralDuration);
				service.open = false;
				//console.log("dbg070");
				SiiMobilityService.removingMenuToCheck("SettingsManager");
				if (PrincipalMenu.fromPrincipalMenu) {
					PrincipalMenu.show();
					console.log("dbg700");
				}
			}, 1000);
		}

		function refreshAll () {
			var service = this;
			//console.log("dbg287: " + Globalization);
			Globalization.refresh(service["language"]);
			PrincipalMenu.refreshMenu();
			//console.log("dbg287: " + "");
			service.refreshMenu();
			//console.log("dbg288");
			CategorySearcher.refreshCategoryMenu(service.textSize, service.language, service.profile);
			//console.log("dbg289");
			GpsManager.refresh(service.gpsPosition);
			MapManager.initializeAndUpdatePopUpGpsMarker();
			MapManager.initializeAndUpdatePopUpManualMarker();
			ViewManager.render(null, '#threeVerticalDotMenu', 'ThreeVerticalDotMenu');
			QueryManager.refreshParameters(service.maxDistanceRecommender, service.maxDistance, service.numberOfItems, service.language, service.profile);
			if (service.profile == "operator") {
				if (service.language == "ita") {
					$("#profileShowerInner").html("Operatore");
				}
				else {
					$("#profileShowerInner").html("Operator");
				}
				$("#profileShower").show(0);
			} else {
				$("#profileShower").hide(0);
			}
			service.hideSettingsMenu();
		}

		function checkForBackButton () {
			var service = this;
			if (service.open) {
				service.hideSettingsMenu();
				if (PrincipalMenu.fromPrincipalMenu) {
					PrincipalMenu.show();
					console.log("dbg710");
				}
			}
		}

		function closeAll () {
			var service = this;
			if (service.open) {
				service.hideSettingsMenu();
			}
		}
	}
})();