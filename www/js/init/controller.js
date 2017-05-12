(function() {
	var siiMobilityApp = angular.module('siiMobilityApp');

	siiMobilityApp.controller('SiiMobilityController', function SiiMobilityController($scope, $injector, $state, $ocLazyLoad, SiiMobilityService, SettingsManager, GpsManager, ChooseLanguage, ChooseProfile, RelativePath, Globalization, PrincipalMenu, Utility, InfoManager, MapManager) {
		$.ajax({
			url: RelativePath.jsonFolder + "languages.json",
			async: false,
			dataType: "json",
			success: function(data) {
				//console.log("dbg830");
				$scope.languages = data.languages;
				//ViewManager.render(data, '#chooseLanguage', 'ChooseLanguage');
			}
		});
		
		$scope.ngDynamicModules = [
			{
				"iconClass": "glyphicon glyphicon-heart",
				"iconFontSize": "35px",
				"iconColor": "#660000",
				"text": "Tieniti in forma",
				"textFontSize": "38px",
				"textColor": "#CC0000",
				"captionId": "HealthCare",
				"captionTextId": "moduleHealthCare",
				"ribbon": true,
				"ribbonStyle": "background: #CC0000;background: linear-gradient(#FF6600 0%, #CC0000 100%);",
				"ribbonText":  "NEW",
				"removed": false
			  }
		];
		$scope.readWelcome = function() {
			return Globalization.readWelcome();
		};
		$scope.readDisclaimerText = function() {
			return Globalization.readDisclaimerText();
		};
		
		$scope.readDisclaimerLink = function() {
			return Globalization.readDisclaimerLink();
		};
		
		$scope.$watch(function () {
				return Globalization.labels;
			},	function (labels) {
				if (Globalization.labels && Globalization.labels.principalMenu && Globalization.labels.principalMenu.headerTitle) {
					$scope.headerTitle = Globalization.labels.principalMenu.headerTitle;
				}
		});
		
		$scope.$watch(function () {
				return PrincipalMenu.principalMenuButtons; 
			},	function (principalMenuButtons) {
				$scope.principalMenuButtons = principalMenuButtons;
		});

		bindEvents = function () {
			document.addEventListener('deviceready', onDeviceReady, false);
			document.addEventListener("pause", onPause, false);
			document.addEventListener("resume", onResume, false);
			document.addEventListener('backbutton', onBackKeyDown, false);
			window.addEventListener('resize', SiiMobilityService.onResize, false);
		},

		onDeviceReady = function () {
			receivedEvent('deviceready');
			if (device.platform == "Android") {
				var loadAllTimeout = 5500;
			} else {
				loadAllTimeout = 0;
			}

			setTimeout(function () {
				Utility.loadFilesInsideDirectory("www/js/modules/", "js", null, true, Utility.loadJS, function (e) {
					if (localStorage.getItem("acceptInformation") === null || (localStorage.getItem("profile") == "all" && localStorage.getItem("appVersion") != $scope.version)) {
						//console.log("dbg710");
						ChooseLanguage.show();
						$("#splashScreenVideoContainer").remove();
						screen.unlockOrientation();
					} else {
						startingApp();
					}

					cordova.getAppVersion.getVersionNumber().then(function (version) {
						$scope.version = version;
					});

					cordova.getAppVersion.getAppName().then(function (appName) {
						$scope.appID = appName.substring(0, 1).toLowerCase() + "dck-" + device.platform.substring(0, 1).toLowerCase();
					});
					$scope.uid = forge_sha256(device.uuid);
					if (typeof window.MacAddress != "undefined") {
						window.MacAddress.getMacAddress(
							function (macAddress) {
								$scope.uid2 = hex_md5(macAddress.toLowerCase().replace(/:/g, "")).substring(0, 24);
								$scope.uid2 = XXH.h64($scope.uid2, 0).toString(16);
							},
							function (fail) { }
						);
					}
				});
			}, loadAllTimeout);
		},

		startingApp = function () {
			//console.log("dbg270");
			SettingsManager.initializeSettings();
			//console.log("dbg272");
			PrincipalMenu.show();
			//console.log("dbg720");
			screen.unlockOrientation();
			//console.log("dbg722");
			if (!SiiMobilityService.checkConnection()) {
				navigator.notification.alert(Globalization.alerts.connectionError.message, function () { }, Globalization.alerts.connectionError.title);
			}
			//console.log("dbg724");
			MapManager.createMap();
			//console.log("dbg726");
			InfoManager.checkNewSingleTemplates();
			//console.log("dbg728");
			$.ajax({
				url: "js/Cesium/Cesium.js",
				dataType: "script",
				success: function () {
					//console.log("dbg730");
					CESIUM_BASE_URL = "js/Cesium";
				}
			});
			//console.log("dbg740");
			if (device.platform == "Win32NT" || device.platform == "windows") {
				SiiMobilityService.resetBackButtonListener();
			}
			//console.log("dbg750");
		},
		
		showPanelMenu = function () {
			//console.log("dbg020");
			if (CategorySearcher.openPanelMenu == false) {
				CategorySearcher.openPanelMenu = true;
				if (CategorySearcher.newStart != true || localStorage.getItem("firstStart") == null) {
					CategorySearcher.selectAll();
				}
				localStorage.setItem("firstStart", "false");
				CategorySearcher.newStart = false;
				application.addingMenuToCheck("CategorySearcher");
				application.setBackButtonListener();
				$('#categorySearchMenu').css('height', $('#content').height() + 'px');
				$("input[name=search]").val(""); 
				$("input[name=search]").attr("placeholder", Globalization.labels.categorySearchMenu.filter);
				$('#categorySearchMenuImage').addClass("glyphicon-chevron-right").removeClass("glyphicon-th-list");
			} else {
				CategorySearcher.resetPanel();
			}
		},
		
		$scope.chooseLanguage = function(choosenLanguage) {
			//console.log('dbg850');
			localStorage.setItem('language', choosenLanguage);
			ChooseLanguage.hide(choosenLanguage);
			//console.log('dbg859');
			
			$.ajax({
				url: RelativePath.profiles + "profiles." + choosenLanguage + ".json",
				async: false,
				dataType: "json",
				success: function(data) {
					//console.log("dbg442");
					$scope.profiles = data.profiles;
					//ViewManager.render(data, '#chooseProfile', 'ChooseProfile');
				}
			});
		}
		
		$scope.chooseProfile = function(chosenProfile) {
			localStorage.setItem('profile', chosenProfile);
			ChooseProfile.hide();
			startingApp();
		}

		onBackKeyDown = function (event) {
			//console.log("dbg720");
			if (device.platform == "Android" || device.platform == "iOS") {
				if (PrincipalMenu.open && !ChooseLanguage.open && !ChooseProfile.open) {
					if (PrincipalMenu.modifing) {
						PrincipalMenu.savePrincipalMenu();
					} else {
						PrincipalMenu.resetEventsBadge();
						close();
					}
				}
			}

			var menuToCheckArray = SiiMobilityService.getMenuToCheckArray();
			if (menuToCheckArray.length == 0) {
				PrincipalMenu.show();
				//console.log("dbg740");
				if (PrincipalMenu.modifing) {
					PrincipalMenu.savePrincipalMenu();
				} else {
					SiiMobilityService.resetBackButtonListener();
				}
			} else {
				if (window[menuToCheckArray[0]] != null) {
					if (window[menuToCheckArray[0]]["checkForBackButton"] != null) {
						window[menuToCheckArray[0]]["checkForBackButton"]();
					}
				}
			}

			if (menuToCheckArray.length == 0) {
				if (!PrincipalMenu.open && device.platform != "Web") {
					window.plugins.toast.showWithOptions({
						message: Globalization.labels.principalMenu.returnMenu,
						duration: "long", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself. 
						position: "bottom",
						addPixelsY: -40 // added a negative value to move it up a bit (default 0) 
					},
						function () { }, // optional
						function () { } // optional 
					);
				}
			}
		},

		onPause = function (event) {
			if (typeof GpsManager != "undefined") {
				GpsManager.stopWatchingPosition();
			}
		},

		onResume = function (event) {
			if (typeof GpsManager != "undefined") {
				GpsManager.watchingPosition();
			}
		},
		
		$scope.launchApp = function(principalMenuButton) {
			$ocLazyLoad.load("ng-modules/" + principalMenuButton.captionId + "/js/" + principalMenuButton.captionId + ".js").then(function() {
				$state.go(principalMenuButton.captionId);
			}, function(e) {
				console.log('errr');
				console.error(e);
			});
		},

		close = function () {
			navigator.Backbutton.goHome(function () { }, function () { });
		},

		// Update DOM on a Received Event
		receivedEvent = function (id) { }
		
		bindEvents();
	});
})();