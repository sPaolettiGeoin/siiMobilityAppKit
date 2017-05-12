(function() {
	'use strict';
	
	angular
		.module('siiMobilityApp')
		.factory('PrincipalMenu', PrincipalMenu)
	
	PrincipalMenu.$inject = ['RelativePath', 'Parameters', 'Globalization', 'SiiMobilityService', 'QueryManager', 'APIClient', 'Utility', 'MapManager'];
	function PrincipalMenu(RelativePath, Parameters, Globalization, SiiMobilityService, QueryManager, APIClient, Utility, MapManager) {
		var service = {
			open: false,
			fromPrincipalMenu: false,
			suggestionsBadge: 0,
			eventsBadge: 0,
			principalMenuButtons: [],
			draggedButton: null,
			droppedButton: null,
			modifing: false,
			init: true,

			createPrincipalMenu: function () {
				var service = this;
				
				if (service.principalMenuButtons.length == 0) {
					if (JSON.parse(localStorage.getItem("principalMenuButtons")) != null){
						service.principalMenuButtons = JSON.parse(localStorage.getItem("principalMenuButtons"));
					}
				}

				if (service.init) {
					service.checkNewButtons();
				}
				service.refreshMenu();
				$("#principalMenuInner div.principalMenuButton").on("taphold", function (event) { service.modifyPrincipalMenu(); })
				if (service.modifing == true) {
					service.modifyPrincipalMenu();
				}
			},

			refreshMenu: function () {
				//var service = this;
				
				//ViewManager.render({ "principalMenuButtons": service.principalMenuButtons }, '#principalMenu', 'PrincipalMenu');

			},

			checkNewButtons: function () {
				var service = this;
				
				//console.log("dbg500: " + typeof service.checkButtonsToAdd);
				$.ajax({
					url: RelativePath.jsonFolder + "principalMenu.json",
					async: false,
					dataType: "json",
					success: function (data) {
						//console.log("dbg510: " + service.principalMenuButtons.length);
						if (service.principalMenuButtons.length == 0) {
							service.principalMenuButtons = data;
							for (var i = 0; i < service.principalMenuButtons.length; i++) {
								if (service.principalMenuButtons[i] != undefined) {
									service.principalMenuButtons[i].globalizedText = Globalization.labels.principalMenu[service.principalMenuButtons[i].captionTextId];
									//$("#" + service.principalMenuButtons[i].captionId).html(Globalization.labels.principalMenu[service.principalMenuButtons[i].captionTextId]);
								}
							}
						} else {
							//console.log("dbg510");
							//console.log("dbg510: " + typeof service.checkButtonsToAdd);
							service.checkButtonsToAdd(data);
						}
					}
				});

				//console.log("dbg400: " + Utility);
				Utility.loadFilesInsideDirectory("www/js/modules/", null, "principalMenu.json", true, service.loadModulesButton.bind(service), function (e) {
					service.refreshMenu();
					localStorage.setItem("principalMenuButtons", JSON.stringify(service.principalMenuButtons));
					service.init = false;
				});

				
				//console.log("dbg030");
				$.ajax({
					url: SiiMobilityService.remoteJsonUrl + "principalMenu.json",
					cache: false,
					timeout: Parameters.timeoutGettingMenuCategorySearcher,
					dataType: "json",
					success: function (data) {
						//console.log("dbg520");
						service.checkButtonsToAdd(data);
						service.refreshMenu();
					}
				});
			},

			loadModulesButton: function (fullPath) {
				var service = this;
				//console.log("dbg528: " + this);
				
				$.ajax({
					url: fullPath,
					async: false,
					dataType: "json",
					success: function (data) {
						//console.log("dbg530");
						//console.log("dbg530: " + typeof service);
						service.checkButtonsToAdd(data);
					}
				});
			},

			checkButtonsToAdd: function(buttonsToAdd){
				var service = this;
				
				for (var i = 0; i < buttonsToAdd.length; i++) {
					var j = 0;
					var buttonAlreadyInserted = false;
					while (j < service.principalMenuButtons.length && !buttonAlreadyInserted) {
						//console.log("dbg222: " + JSON.stringify(service.principalMenuButtons[j]));
						if (service.principalMenuButtons[j].captionId == buttonsToAdd[i].captionId) {
							buttonAlreadyInserted = true;
							if (buttonsToAdd[i].delete != true) {
								if (buttonsToAdd[i].forceRemoved) {
									service.principalMenuButtons[j].removed = buttonsToAdd[i].removed;
								} else {
									buttonsToAdd[i].removed = service.principalMenuButtons[j].removed;
								}
								service.principalMenuButtons.splice(j, 1, buttonsToAdd[i]);
							} else {
								service.principalMenuButtons.splice(j, 1);
							}
						}
						j++;
					}
					if (!buttonAlreadyInserted && buttonsToAdd[i].delete != true) {
						if (buttonsToAdd[i].index == 0) {
							var inserted = false;
							for (var k = 0; k < service.principalMenuButtons.length; k++) {
								if (service.principalMenuButtons[k].removed == true) {
									service.principalMenuButtons.splice(k, 0, buttonsToAdd[i]);
									inserted = true;
									break;
								}
							}
							if (!inserted) {
								service.principalMenuButtons.push(buttonsToAdd[i]);
							}
						} else {
							service.principalMenuButtons.splice(buttonsToAdd[i].index, 0, buttonsToAdd[i]);
						}
					}
				}
				service.refreshIndexOfMenuButton();
			},

			resetPrincipalMenu: function(){
				var service = this;
				
				//console.log("dbg510");
				$.ajax({
					url: RelativePath.jsonFolder + "principalMenu.json",
					async: false,
					dataType: "json",
					success: function (data) {
						service.principalMenuButtons = data
						for (var i = 0; i < service.principalMenuButtons.length; i++) {
							if (service.principalMenuButtons[i] != undefined) {
								service.principalMenuButtons[i].globalizedText = Globalization.labels.principalMenu[service.principalMenuButtons[i].captionTextId];
								//$("#" + service.principalMenuButtons[i].captionId).html(Globalization.labels.principalMenu[service.principalMenuButtons[i].captionTextId]);
							}
						}
					}
				});
				service.createPrincipalMenu();
			},

			show: function () {
				var service = this;
				
				service.createPrincipalMenu();
				//console.log("dbg058");
				$("#splashScreenVideoContainer").remove();
				$('#principalMenu').show();
				//console.log("dbg050");
				SiiMobilityService.resetInterface();
				MapManager.resetMarker();
				service.open = true;
				service.fromPrincipalMenu = false;
				if (Math.abs(localStorage.getItem("latestEventsClickedTime") - (new Date().getTime())) > Parameters.showBadgeAfterThisTime || localStorage.getItem("latestEventsClickedTime") == null) {
					var eventsQuery = QueryManager.createEventsQuery("day", "app");
					APIClient.executeQueryWithoutAlert(eventsQuery, service.updatingEventsBadge, null);
				}
				if (service.weatherInterval != null) {
					clearInterval(service.weatherInterval);
				}
				service.refreshingBadge();
				//console.log("dbg060");
			},

			hide: function() {
				var service = this;
				
				$('#principalMenu').hide(Parameters.hidePanelGeneralDuration);
				console.log("dbg060: " + Parameters.hidePanelGeneralDuration);
				SiiMobilityService.setBackButtonListener();
				service.open = false;
			},

			clickOnLogo: function(){
				var service = this;
				
				if (service.open && device.platform != "Web") {
					window.plugins.toast.showWithOptions(
							{
								message: Globalization.labels.principalMenu.alertLogoMessage,
								duration: "long", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself. 
								position: "bottom",
								addPixelsY: -40  // added a negative value to move it up a bit (default 0) 
							},
							function () { }, // optional
							function () { }    // optional 
							);
				} else {
					service.show();
				}
			},

			updateBadge: function (suggestionsBadge, eventsBadge, weatherBadge, infoSOCBadge, personalAssistantBadge) {
				var service = this;
				console.log("dbg100");
				
				if (eventsBadge != null && eventsBadge != 0) {
					service.eventsBadge = eventsBadge;
					localStorage.setItem("eventsBadge", service.eventsBadge);
					console.log("dbg070");
				}
				service.refreshingBadge();
			},

			updatingEventsBadge: function(response){
				var service = this;
				
				service.updateBadge(null, response.Event.features.length);
			},

			resetEventsBadge: function () {
				var service = this;
				
				service.eventsBadge = 0;
				localStorage.setItem("eventsBadge", service.eventsBadge);
				//console.log("dbg080");
				service.refreshingBadge();
				$('#eventsBadge').hide();
			},

			refreshingBadge: function () {
				var service = this;
				//console.log("dbg110");
				service.eventsBadge = localStorage.getItem("eventsBadge");
				//console.log("dbg112");
				if (service.eventsBadge != null) {
					if (service.eventsBadge != 0) {
						console.log("dbg120");
						$('#eventsBadge').html(service.eventsBadge);
						$('#eventsBadge').show();
					}
				}
				//console.log("dbg130");
			},

			logPrincipalMenuChoices: function (buttonId) {
				var service = this;
				
				if (buttonId != null ) {
					var logPrincipalMenuChoicesQuery = QueryManager.createLogPrincipalMenuChoices(buttonId, "app");
					APIClient.executeQueryWithoutAlert(logPrincipalMenuChoicesQuery, service.logPrincipalMenuChoicesSuccessQuery, null);
				}
			},

			logPrincipalMenuChoicesSuccessQuery: function (data) {
				console.log(JSON.stringify(data));
				console.log("SUCCESS LOG BUTTON");
			},

			modifyPrincipalMenu: function(){
				var service = this;
				
				$("#principalMenuInner div.principalMenuButton").draggable({
						drag: function (event, ui) {
							service.draggedButton = $(this).data('index');
						},
						containment: "#principalMenuInner",
						revert: "invalid",
						handle: "i.glyphicon-move",
						zIndex: 2,
						opacity: 0.50
					});
				$("#principalMenuInner div.principalMenuButton").droppable({
						drop: function (event, ui) {
							service.droppedButton = $(this).data('index');
							service.swapButtons(service.draggedButton, service.droppedButton);
						},
					classes: {
						"ui-droppable-hover": "ui-state-hover",
						"ui-droppable-active": "ui-state-default"
						}
					});
				service.modifing = true;
				$("#principalMenuInner div.principalMenuButtonRemoved").show();
				$("#principalMenuInner div.ribbon").hide();
				$("#principalMenuInner span.step").hide();
				$('#principalMenuModifyMenuButton').hide();
				$('#principalMenuResetMenuButton').show();
				$('#principalMenuSaveMenuButton').show();
				$("#principalMenuInner i.iconModifing").show();
				$('#principalMenuInner div').prop('onclick', null).off('click');
			},

			swapButtons: function (buttonIndex, targetIndex) {
				var service = this;
				
				if (buttonIndex != undefined && targetIndex != undefined) {
					var tempElement = service.principalMenuButtons[targetIndex];
					service.principalMenuButtons[targetIndex] = service.principalMenuButtons[buttonIndex];
					service.principalMenuButtons[targetIndex].index = targetIndex;
					service.principalMenuButtons[buttonIndex] = tempElement;
					service.principalMenuButtons[buttonIndex].index = buttonIndex;
				}
					service.createPrincipalMenu();
			},

			savePrincipalMenu: function(){
				var service = this;
				
				localStorage.setItem("principalMenuButtons", JSON.stringify(service.principalMenuButtons));
				service.modifing = false;
				$("#principalMenuInner div.principalMenuButtonRemoved").hide();
				$('#principalMenuModifyMenuButton').show();
				$('#principalMenuResetMenuButton').hide();
				$('#principalMenuSaveMenuButton').hide();
				$("#principalMenuInner i.iconModifing").hide();
				service.createPrincipalMenu();
			},

			removeButtonFromPrincipalMenu: function (buttonIndex) {
				var service = this;
				
				service.principalMenuButtons[buttonIndex].removed = true;
				service.principalMenuButtons.push(service.principalMenuButtons.splice(buttonIndex, 1)[0]);
				service.refreshIndexOfMenuButton();
				service.createPrincipalMenu();
			},

			addButtonToPrincipalMenu: function (buttonIndex) {
				var service = this;
				
				for (var i = 0; i < service.principalMenuButtons.length; i++) {
					if (service.principalMenuButtons[i].removed == true) {
						if (i != buttonIndex) {
							service.principalMenuButtons[buttonIndex].removed = false;
							service.principalMenuButtons.splice(i, 0, service.principalMenuButtons.splice(buttonIndex, 1)[0]);
							break;
						} else {
							service.principalMenuButtons[buttonIndex].removed = false;
							break;
						}
					}
				}
				service.refreshIndexOfMenuButton();
				service.createPrincipalMenu();
			},

			refreshIndexOfMenuButton: function () {
				var service = this;
				
				for (var i = 0; i < service.principalMenuButtons.length; i++) {
					if (service.principalMenuButtons[i] != undefined) {
						service.principalMenuButtons[i].index = i;
					}
				}
			}
		}
		
		return service;
	}
})();
