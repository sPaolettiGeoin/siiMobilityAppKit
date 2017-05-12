(function(){
	'use strict';
	console.log("dbg455");
	angular
		.module('siiMobilityApp')
		.controller('HealthCareCtrl', ['$scope', 'Globalization', 'PrincipalMenu', 'SiiMobilityService', 'MapManager', 'InfoManager', 'Utility', 'SettingsManager', function($scope, Globalization, PrincipalMenu, SiiMobilityService, MapManager, InfoManager, Utility, SettingsManager) {
		  
		  $scope.datiAnagrafici = {
			name: "",
			sex: "",
			weight: "",
			age: "",
			height: "",
			inModification: false,
			sexOptions: function() {
				var options = [];
				options.length = 2;
				options[0] = {key: "M", value: Globalization.labels.healthCareMenu.options_sex_M, selected: this.sex === "M" ? "selected" : ""};
				options[1] = {key: "F", value: Globalization.labels.healthCareMenu.options_sex_F, selected: this.sex === "F" ? "selected" : ""};
				return options;
			}
		};
			
			
			$scope.open = false;
			$scope.expanded = false;
			$scope.showMap = false;
			$scope.varName = "HealthCare";
			$scope.idMenu = "healthCareMenu";
			$scope.menuHeaderTitle = "";
			$scope.fieldset_characteristics = "";
			$scope.fs_char_sex = "";
			$scope.fs_char_weight = "";
			$scope.modifyButton = "";
			$scope.hints = "";
			$scope.hint = "";
			$scope.healthOptions = [];
			$scope.init = function() {
				$scope.menuHeaderTitle = Globalization.labels.healthCareMenu.title;
				$scope.fieldset_characteristics = Globalization.labels.healthCareMenu.characteristics;
				$scope.fs_char_name = Globalization.labels.healthCareMenu.name;
				$scope.fs_char_sex = Globalization.labels.healthCareMenu.sex;
				$scope.fs_char_weight = Globalization.labels.healthCareMenu.weight;
				$scope.fs_char_age = Globalization.labels.healthCareMenu.age;
				$scope.fs_char_height = Globalization.labels.healthCareMenu.height;
				$scope.cancelButton = Globalization.labels.healthCareMenu.popupCancelLabel;
				$scope.modifyButton = Globalization.labels.healthCareMenu.modifyButton;
				$scope.hints = Globalization.labels.healthCareMenu.hints;
				$scope.healthAction = Globalization.labels.healthCareMenu.healthAction;
				
				$scope.loadDatiAnagrafici();
				$scope.show();
				
				$scope.getHint();
				getHealthOptions();
			};
			function doWork() {
				console.log("dbg777");
				PrincipalMenu.hide();
				$scope.init();
				//console.log("dbg880: " + document.getElementById("map").outerHTML);
				
				//
				//$("#container").show();
				//$("#container").show();
				$("#map").hide();
			};
			$scope.show = function () {
				SiiMobilityService.resetInterface();
				MapManager.showMenuReduceMap("#" + $scope.idMenu);
				$("#" + $scope.idMenu + "Expand").hide();
				$scope.open = true;
				InfoManager.addingMenuToManage($scope.varName);
				SiiMobilityService.addingMenuToCheck($scope.varName);
				SiiMobilityService.setBackButtonListener();
				refreshMenu();
				$scope.expandHealthCare();
			};
			
			function hide () {
				$("#" + $scope.idMenu).css({ 'z-index': '1001' });
				MapManager.reduceMenuShowMap("#" + $scope.idMenu);
				InfoManager.removingMenuToManage($scope.varName);
				SiiMobilityService.removingMenuToCheck($scope.varName);
				$scope.open = false;
			};

			function checkForBackButton () {
				if ($scope.open) {
					hide();
				}
			};
			
			function refreshMenu () {
				Utility.movingPanelWithTouch("#" + $scope.idMenu + "ExpandHandler",
					"#" + $scope.idMenu);
				
				console.log("dbg020: " + $scope.expanded);
				
				if ($scope.expanded) {
					$("#" + $scope.idMenu + "Expand").hide();
				} else {
					$("#" + $scope.idMenu + "Collapse").hide();
				}
			};
			
			function closeAll() {
				if ($scope.open) {
					this.hide();
				}
			};
			
			$scope.expandHealthCare = function () {
				console.log("dbg010: " + $scope.idMenu);
				Utility.expandMenu("#" + $scope.idMenu,
								   "#" + $scope.idMenu + "Expand",
								   "#" + $scope.idMenu + "Collapse");
				$scope.expanded = true;
			};

			$scope.collapseHealthCare = function () {
				Utility.collapseMenu("#" + $scope.idMenu,
									 "#" + $scope.idMenu + "Expand",
									 "#" + $scope.idMenu + "Collapse");
				$scope.expanded = false;
			};

			//callBack
			$scope.errorQuery = function(error) {
				console.log("dbg090: " + JSON.stringify(error));
				navigator.notification.alert(Globalization.alerts.servicesServerError.message, function() {}, Globalization.alerts.servicesServerError.title);
			};
			$scope.loadDatiAnagrafici = function() {
				$scope.datiAnagrafici.name = localStorage.getItem("name");
				$scope.datiAnagrafici.sex = localStorage.getItem("sex");
				if ($scope.datiAnagrafici.sex === "M") {
					$scope.datiAnagrafici.sexDescr = Globalization.labels.healthCareMenu.options_sex_M;
				}
				else if ($scope.datiAnagrafici.sex === "F") {
					$scope.datiAnagrafici.sexDescr = Globalization.labels.healthCareMenu.options_sex_F;
				}
				
				$scope.datiAnagrafici.weight = localStorage.getItem("weight");
				$scope.datiAnagrafici.age = localStorage.getItem("age");
				$scope.datiAnagrafici.height = localStorage.getItem("height");
			};
			
			$scope.switchUpdateDatiAnagrafici = function(inModification) {
				$scope.datiAnagrafici.inModification = inModification;
				
				refreshMenu();
			};
			$scope.updateDatiAnagrafici = function() {
				localStorage.setItem("name", $scope.datiAnagrafici.name);
				localStorage.setItem("sex", $scope.datiAnagrafici.sex);
				localStorage.setItem("weight", $scope.datiAnagrafici.weight);
				localStorage.setItem("age", $scope.datiAnagrafici.age);
				localStorage.setItem("height", $scope.datiAnagrafici.height);
				
				$scope.loadDatiAnagrafici();
				
				$scope.switchUpdateDatiAnagrafici(false);
			};
			
			$scope.getHint = function() {
				var actionQuery = "/recommender/health/";
				actionQuery += "?" + $scope.componeDataQuery();
				appoAPIClient.executeQuery(actionQuery, $scope.successQueryAction, $scope.errorQuery);
			};
			function getHealthOptions () {
				var actionQuery = "/recommender/healthgoals_all";
				appoAPIClient.executeQuery(actionQuery, $scope.successQueryAction, $scope.errorQuery);
			};
			$scope.loadHealthAction = function() {
				var actionQuery = "/recommender/healthgoals/";
				actionQuery += "?goal=" + $scope.selectedHealthOption.key;
				console.log("dbg050: " + $scope.selectedHealthOption.key);
				actionQuery += "&" + $scope.componeDataQuery();
				appoAPIClient.executeQuery(actionQuery, $scope.successQueryAction, $scope.errorQuery);
				//refreshMenu();
			};
			$scope.componeDataQuery = function() {
				var dataQuery = "sex=" + $scope.datiAnagrafici.sex;
				dataQuery += "&weight=" + $scope.datiAnagrafici.weight;
				dataQuery += "&age=" + $scope.datiAnagrafici.age;
				dataQuery += "&height=" + $scope.datiAnagrafici.height;
				dataQuery += "&lang=" + SettingsManager.language;
				dataQuery += "&uid=" + SiiMobilityService.uid;
				
				return dataQuery;
			};
			$scope.successQueryAction = function (responseJson) {
				console.log("responseJson: " + responseJson);
				var response = JSON.parse(responseJson);
				if (response && response.status && response.status.error_code === 0) {
					console.log("typeof response.data.journey: " + typeof response.data.journey);
					$scope.showMap = typeof response.data.journey != "undefined";
					//$scope.showMap = true;
					//console.log("$scope.showMap: " + $scope.showMap);
					if ($scope.showMap) {
						$scope.collapseHealthCare();
					}
					else {
						$scope.expandHealthCare();
					}
					var actionQuery = response.status.current_operation;
					if (actionQuery === "/recommender/health/") {
						$scope.hint = response.data.hint;
					}
					else if (actionQuery === "/recommender/healthgoals_all") {
						$scope.healthOptions = response.data.options;
					}
					else if (actionQuery === "/recommender/healthgoals/") {
						$scope.healthHint = response.data.hint;
						
						if (response.data.journey) {
							MapManager.addSelectedGeometry(response.data.journey.wkt);
						}
					}
				}
				else {
					console.log("response: " + response);
				}
				
				refreshMenu();
			};
		
		doWork();
		  
		  
		  
		  
		  
		  
		}])
})();