(function(){
	'use strict';
	
	angular
		.module('siiMobilityApp')
		.factory('CategorySearcher', CategorySearcher)
	
	CategorySearcher.$inject = ['Parameters', 'RelativePath', 'Globalization', 'Utility', 'SiiMobilityService'];
	function CategorySearcher(Parameters, RelativePath, Globalization, Utility, SiiMobilityService) {
		var service = {};

		service.openPanelMenu = false;
		service.open = false;
		service.results = null;
		service.expanded = false;
		service.forceSelectedKeys = null;
		service.tplSearch = false;
		service.currentLanguage = null;
		service.currentProfile = null;
		service.currentMenu = null;
		service.activeTree = "categorySearchFancyTree";
		service.currentMenuAll = null;
		service.textSize = null;
		service.defaultTextSize = Parameters.textSizeCategorySearcher;
		service.newStart = true;
		
		service.refreshCategoryMenu = refreshCategoryMenu;
		service.rescaleFontSize = rescaleFontSize;
		service.createMenu = createMenu;
		service.searchMenuLocally = searchMenuLocally;
		
		return service;

		function createMenu (divId, source, profile) {
			var service = this;
			//console.log("dbg410");
			$("#" + divId).fancytree({
				source: source,
				extensions: ["glyph", "persist", "filter"],
				checkbox: true,
				selectMode: 3,
				imagePath: RelativePath.images,
				clickFolderMode: 2,
				click: function (event, data) {
					if (!data.node.folder) {
						data.node.toggleSelected();
						return false;
					}
				},
				glyph: {
					map: {
						doc: "glyphicon glyphicon-file",
						docOpen: "glyphicon glyphicon-file",
						checkbox: "glyphicon glyphicon-unchecked",
						checkboxSelected: "glyphicon glyphicon-check",
						checkboxUnknown: "glyphicon glyphicon-share",
						error: "glyphicon glyphicon-warning-sign",
						expanderClosed: "glyphicon glyphicon-chevron-right",
						expanderLazy: "glyphicon glyphicon-chevron-right",
						// expanderLazy: "glyphicon glyphicon-expand",
						expanderOpen: "glyphicon glyphicon-chevron-down",
						// expanderOpen: "glyphicon glyphicon-collapse-down",
						folder: "glyphicon glyphicon-folder-close",
						folderOpen: "glyphicon glyphicon-folder-open",
						loading: "glyphicon glyphicon-refresh"
						// loading: "icon-spinner icon-spin"
					}
				},
				persist: {
					// Available options with their default:
					cookieDelimiter: "~", // character used to join key strings
					cookiePrefix: undefined, // 'fancytree-<treeId>-' by default
					cookie: { // settings passed to jquery.cookie plugin
						raw: false,
						expires: "",
						path: "",
						domain: "",
						secure: false
					},
					expandLazy: false, // true: recursively expand and load lazy nodes
					overrideSource: true, // true: cookie takes precedence over `source` data attributes.
					store: "local", // 'cookie': use cookie, 'local': use localStore, 'session': use sessionStore
					types: "selected" // which status types to store
				},
				filter: {
					autoApply: true,  // Re-apply last filter if lazy data is loaded
					counter: true,  // Show a badge with number of matching child nodes near parent icons
					fuzzy: false,  // Match single characters in order, e.g. 'fb' will match 'FooBar'
					hideExpandedCounter: true,  // Hide counter badge, when parent is expanded
					highlight: false,  // Highlight matches by wrapping inside <mark> tags
					nodata: Globalization.labels.categorySearchMenu.noService,
					mode: "hide"  // Grayout unmatched nodes (pass "hide" to remove unmatched node instead)
				}
			});

			service.rescaleFontSize();
			if (profile != "all") {
				$(".fancytree-exp-n span.fancytree-expander, .fancytree-exp-nl span.fancytree-expander").css("width", "0px");
				$("span.fancytree-checkbox").css("margin-left", "0.2em");
			}
		}

		function filterTplResults (){
			var service = this;
			
			var match = $("input[name=filterTplResults]").val();
			var resultsFilteredObject = {
				"Results": {
					"fullCount": service.results.features.length,
					"type": "FeatureCollection",
					"features": [],
					"tplSearch": true
				}
			};

			for (var i = 0; i < service.results.features.length; i++) {
				if (service.results.features[i].properties.busLines != null) {
					if (service.results.features[i].properties.busLines.indexOf(match) !== -1) {
						resultsFilteredObject["Results"].features.push(service.results.features[i]);
					}
				}
			}

			ViewManager.render(resultsFilteredObject["Results"], "#resultsMenu", "ResultsMenu");
			$('#collapseResultsMenu').hide();
			$("input[name=filterTplResults]").val(match);
			$("input[name=filterTplResults]").attr("placeholder", Globalization.labels.categorySearchMenu.filterLines);
			$("#resultsMenuInner").css("top", "92px");
			MapManager.addGeoJSONLayer(resultsFilteredObject);
		}

		function resetFilterTplResults () {
			var service = this;
			
			$("input[name=filterTplResults]").val("");
			service.show(service.results);
			$("input[name=filterTplResults]").attr("placeholder", Globalization.labels.categorySearchMenu.filterLines);
			$("#resultsMenuInner").css("top", "92px");
			MapManager.addGeoJSONLayer({ "Results": service.results });
		}

		function filterMenu () {
			var service = this;
			
			   var match =  $("input[name=search]").val();
			   if (match.length >= 2) {
				   service.activeTree = "categorySearchFancyTreeComplete";
				   service.selectAll();
				   $("#categorySearchFancyTreeComplete").show(0);
				   $("#categorySearchFancyTree").hide(0);
				   var opts = 
					$("#categorySearchFancyTreeComplete").fancytree("getTree").filterNodes(match, {
						autoExpand: true,
						leavesOnly: true
					});
				} else if (match == "") {
					$("#categorySearchFancyTreeComplete").fancytree("getTree").clearFilter();
					service.activeTree = "categorySearchFancyTree";
					$("#categorySearchFancyTreeComplete").hide(0);
					$("#categorySearchFancyTree").show(0);
				}
		}
		function resetFilterMenu (){
			var service = this;
			
			$("input[name=search]").val("");
			$("#categorySearchFancyTreeComplete").fancytree("getTree").clearFilter();
			service.activeTree = "categorySearchFancyTree";
			$("#categorySearchFancyTreeComplete").hide(0);
			$("#categorySearchFancyTree").show(0);
			service.selectAll();
		}

		function refreshCategoryMenu (textSize, language, profile) {
			var service = this;
			//console.log("dbg320");
			if (service.textSize != textSize) {
				service.textSize = textSize;
			}
			//console.log("dbg330");
			if (service.currentLanguage != language || service.currentProfile != profile) {
				service.currentLanguage = language;
				service.currentProfile = profile;
				//ViewManager.render(null, "#categorySearchMenu", "CategorySearchMenu");
				if (SiiMobilityService.checkConnection()) {
					$.ajax({
						url: "http://www.disit.org/km4city/mapSearchMenu/mapSearchMenu." + language + "." + profile + ".json",
						cache: false,
						timeout: Parameters.timeoutGettingMenuCategorySearcher,
						dataType: "json",
						beforeSend: function () {
							Loading.showSettingsLoading();
						},
						success: function (data) {
							service.currentMenu = data;
							localStorage.setItem("categorySearchMenu." + language + "." + profile + ".json", JSON.stringify(data));
							service.createMenu("categorySearchFancyTree", service.currentMenu, profile);
						},
						error: function (data) {
							service.currentMenu = service.searchMenuLocally(textSize, language, profile);
							service.createMenu("categorySearchFancyTree", service.currentMenu, profile);
						},
						complete: function () {
							Loading.hideSettingsLoading();
						}

					});
					//console.log("dbg340");
					$.ajax({
						url: "http://www.disit.org/km4city/mapSearchMenu/mapSearchMenu." + language + ".all.json",
						cache: false,
						timeout: Parameters.timeoutGettingMenuCategorySearcher,
						dataType: "json",
						beforeSend: function () {
							Loading.showSettingsLoading();
						},
						success: function (data) {
							service.currentMenuAll = data;
							localStorage.setItem("categorySearchMenu." + language + ".all.json", JSON.stringify(data));
							service.createMenu("categorySearchFancyTreeComplete", service.currentMenuAll, "all");
						},
						error: function (data) {
							service.currentMenuAll = service.searchMenuLocally(textSize, language, "all");
							service.createMenu("categorySearchFancyTreeComplete", service.currentMenuAll, "all");
						},
						complete: function () {
							Loading.hideSettingsLoading();
						}

					});
				} else {
					service.currentMenu = service.searchMenuLocally(textSize, language, profile);
					service.createMenu("categorySearchFancyTree", service.currentMenu, profile);
					service.currentMenuAll = service.searchMenuLocally(textSize, language, "all");
					service.createMenu("categorySearchFancyTreeComplete", service.currentMenuAll, "all");
				}
				//console.log("dbg350");
				service.activeTree = "categorySearchFancyTree";
			}
			//console.log("dbg352");
			service.rescaleFontSize();
			//console.log("dbg354");
		}

		function searchMenuLocally (textSize, language, profile) {
			var currentMenu = null;
			if (localStorage.getItem("categorySearchMenu." + language + "." + profile + ".json") != null) {
				currentMenu = JSON.parse(localStorage.getItem("categorySearchMenu." + language + "." + profile + ".json"));
			}
			//console.log("dbg420");
			if (currentMenu == null) {
				$.ajax({
					url: RelativePath.jsonFolder + "mapSearchMenu/mapSearchMenu." + language + "." + profile + ".json",
					async: false,
					dataType: "json",
					success: function (data) {
						currentMenu = data;
					}
				});
			}
			return currentMenu;
		}

		function deselectAll () {
			var service = this;
			
			$("#" + service.activeTree).fancytree("getTree").visit(function (node) {
				node.setSelected(false);
			});
			return false;
		}

		function selectAll () {
			var service = this;
			
			$("#" + service.activeTree).fancytree("getTree").visit(function (node) {
				node.setSelected(true);
			});
			return false;
		}

		function resetMenu () {
			var service = this;
			
			$("#" + service.activeTree).fancytree("getTree").visit(function (node) {
				node.setExpanded(false);
			});
			service.deselectAll();
		}

		function rescaleFontSize () {
			var service = this;
			var currentTextSize = service.textSize;
			$("div#categorySearchMenu.ui-panel").css("height",$(window).height() - 55 + "px");
			if (currentTextSize == 26) {
				if ($(window).width() > Parameters.veryLargePanelCategorySearcher) {
					$("div#categorySearchMenu.ui-panel").css("width", Parameters.veryLargePanelCategorySearcher + "px");
				} else {
					currentTextSize = 24;
				}
			}
			if (currentTextSize == 24) {
				if ($(window).width() > Parameters.largePanelCategorySearcher) {
					$("div#categorySearchMenu.ui-panel").css("width", Parameters.veryLargePanelCategorySearcher + "px");
				} else {
					currentTextSize = 22;
				}
			}
			if (currentTextSize == 22) {
				if ($(window).width() > Parameters.mediumPanelCategorySearcher) {
					$("div#categorySearchMenu.ui-panel").css("width", Parameters.mediumPanelCategorySearcher + "px");
				} else {
					currentTextSize = 20;
				}
			}
			if (currentTextSize == 20) {
				if ($(window).width() > Parameters.normalPanelCategorySearcher) {
					$("div#categorySearchMenu.ui-panel").css("width", Parameters.normalPanelCategorySearcher + "px");
				} else {
					currentTextSize = 18;
				}
			}
			if (currentTextSize == 18) {
				if ($(window).width() > Parameters.smallPanelCategorySearcher) {
					$("div#categorySearchMenu.ui-panel").css("width", Parameters.smallPanelCategorySearcher + "px");
				} else {
					currentTextSize = 16;
				}
			}
			if (currentTextSize == 16) {
				if ($(window).width() > Parameters.verySmallPanelCategorySearcher) {
					$("div#categorySearchMenu.ui-panel").css("width", Parameters.verySmallPanelCategorySearcher + "px");
				}
			}
			$("#categorySearchFancyTree").children("ul.fancytree-container").css("font-size", currentTextSize + "px");
			$("#categorySearchFancyTreeComplete").children("ul.fancytree-container").css("font-size", currentTextSize + "px");

		}

		function search (forceSelection) {
			var service = this;
			
			if (SearchManager.searchCenter != null) {
				var selectedNodeNumber = $("#" + service.activeTree).fancytree("getTree").getSelectedNodes().length;

				if (selectedNodeNumber == 0 && service.forceSelectedKeys == null) {

					navigator.notification.alert(Globalization.alerts.servicesCategoryNotSelected.message, function () { }, Globalization.alerts.servicesCategoryNotSelected.title);

					return false;
				}
		
				var selectedKeys = ["Service"];
				if ($("#" + service.activeTree).fancytree("getTree").isFilterActive()) {
					selectedKeys = []
					selectedKeys = $.map($("#" + service.activeTree).fancytree("getTree").getSelectedNodes(), function (node) {
						if (node.isMatched() && !node.hasChildren()) {
							return node.key;
						}
					});
				} else if (selectedNodeNumber != $("#" + service.activeTree).fancytree("getTree").count() || profile != "all") {
					selectedKeys = $.map($("#" + service.activeTree).fancytree("getTree").getSelectedNodes(true), function (node) {
							return node.key;
					});
				}

				if (selectedKeys.length == 0 && service.forceSelectedKeys == null) {
					navigator.notification.alert(Globalization.alerts.servicesCategoryNotSelected.message, function () { }, Globalization.alerts.servicesCategoryNotSelected.title);
					return false;
				}

				if (service.forceSelectedKeys != null) {
					selectedKeys = service.forceSelectedKeys;
				} 
				var categoriesQuery = QueryManager.createCategoriesQuery(selectedKeys, SearchManager.searchCenter, "user");
				APIClient.executeQuery(categoriesQuery, successQuery, errorQuery);
			} else {
				navigator.notification.confirm(Globalization.alerts.noPosition.message, function (indexButton) {
					if (device.platform == "Android") {
						if (indexButton == 3) {
							CheckGPS.openSettings();
						}
						if (indexButton == 1 || indexButton == 0) {
							resetSearch();
						}
					} else if (device.platform == "iOS" || device.platform == "Win32NT" || device.platform == "windows" || device.platform == "Web") {
						if (indexButton == 1 || indexButton == 0) {
							resetSearch();
						}
					}
				}, Globalization.alerts.noPosition.title, Globalization.alerts.noPosition.buttonName);
			}
		}

		function onKeyEnter (event) {
			var service = this;
			
			if (event.which == 13 || event.keyCode == 13) {
				//code to execute here
				SearchManager.search("CategorySearcher");
				service.hidePanelMenu();
				return false;
			}
			return true;
		}

		function onFilterEnter (event) {
			if (event.which == 13 || event.keyCode == 13) {
				//code to execute here
				filterTplResults();
				return false;
			}
			return true;
		}

		function hidePanelMenu () {
			var service = this;
			
			$('#categorySearchMenu').panel('close');
			$('#categorySearchMenuImage').removeClass("glyphicon-chevron-right").addClass("glyphicon-th-list");
			service.openPanelMenu = false;
			if (!service.open) {
				//console.log("dbg180");
				application.removingMenuToCheck("CategorySearcher");
			}
		}

		function checkForBackButton () {
			var service = this;
			
			if (service.open && !service.openPanelMenu) {
				hide();
			}
			if (service.openPanelMenu) {
				hidePanelMenu();
			}
		}

		function refreshMenuPosition () {
			var service = this;
			
			if (service.open) {
				MapManager.showMenuReduceMap('#resultsMenu');
				Utility.checkAxisToDrag("#resultsMenu");
				if (service.expanded) {
					service.expandResultsMenu();
				}
			}
			service.rescaleFontSize();
		}

		function closeAll(){
			var service = this;
			
			if (service.openPanelMenu) {
				service.hidePanelMenu();
			}
			if (service.open) {
				service.hide();
			}
		}

		function refreshMenu () {
			var service = this;
			
			if ($("#resultsMenu").length == 0) {
				$("#indexPage").append("<div id=\"resultsMenu\" class=\"commonHalfMenu\"></div>")
			}
			ViewManager.render(service.results, "#resultsMenu", "ResultsMenu");
			Utility.movingPanelWithTouch("#resultsMenuExpandHandler", "#resultsMenu");
		}

		function expandResultsMenu () {
			var service = this;
			
			Utility.expandMenu("#resultsMenu", "#expandResultsMenu", "#collapseResultsMenu");
			service.expanded = true;
		}

		function collapseResultsMenu () {
			var service = this;
			
			Utility.collapseMenu("#resultsMenu", "#expandResultsMenu", "#collapseResultsMenu");
			service.expanded = false;
		}

		function show () {
			var service = this;
			
			//console.log("dbg190");
			application.resetInterface();
			MapManager.showMenuReduceMap('#resultsMenu');
			$('#collapseResultsMenu').hide();
			service.open = true;
			InfoManager.addingMenuToManage("CategorySearcher");
			application.addingMenuToCheck("CategorySearcher");
			application.setBackButtonListener();
		}

		function hide () {
			var service = this;
			
			$('#resultsMenu').css({ 'z-index': '1001' });
			MapManager.reduceMenuShowMap('#resultsMenu');
			service.open = false;
			InfoManager.removingMenuToManage("CategorySearcher");
			//console.log("dbg230");
			application.removingMenuToCheck("CategorySearcher");
			service.tplSearch = false;
		}

		function resetPanel () {
			var service = this;
			
			service.openPanelMenu = false;
			$('#categorySearchMenuImage').toggleClass("glyphicon-chevron-right glyphicon-th-list");
			//console.log("dbg240");
			if (!service.open) {
				application.removingMenuToCheck("CategorySearcher");
			}
			application.resetBackButtonListener();
		}

		function resetSearch () {
			var service = this;
			
			service.forceSelectedKeys = null;
			QueryManager.resetMaxDists();
			Loading.hideAutoSearchLoading();
		}


		//callBack
		function successQuery (response) {
			var lengthCategory = 0;
			var emptyCategory = 0;
			var responseObject = {
				"Results": {
					"fullCount": 0,
					"type": "FeatureCollection",
					"features": []
				}
			};
			for (var category in response) {
				lengthCategory++;
			}
		  
			for (var category in response) {
				if (response[category].features.length != 0) {
					responseObject["Results"].features = responseObject["Results"].features.concat(response[category].features);
					responseObject["Results"].fullCount = responseObject["Results"].fullCount + response[category].fullCount;
				} else {
					emptyCategory++;
					if (emptyCategory == lengthCategory) {
						SearchManager.startAutoSearch("CategorySearcher");
					}

				}
				
			}
			if (SearchManager.typeOfSearchCenter == "selectedServiceMarker") {
				MapManager.searchOnSelectedServiceMarker = true;
			}

			if (responseObject["Results"].features.length != 0) {
				for (var i = 0; i < responseObject["Results"].features.length; i++) {
					responseObject["Results"].features[i].id = i;
					Utility.enrichService(responseObject["Results"].features[i], i);
				}
				if (responseObject["Results"].features[0].properties.distanceFromSearchCenter != null) {
					responseObject["Results"].features.sort(function (a, b) {
						return a.properties.distanceFromSearchCenter - b.properties.distanceFromSearchCenter
					});
				} else {
					responseObject["Results"].features.sort(function (a, b) {
						return a.properties.distanceFromGPS - b.properties.distanceFromGPS
					});
				}

				responseObject["Results"].tplSearch = service.tplSearch;

				service.results = responseObject["Results"];
				service.refreshMenu();
				service.show();
				MapManager.addGeoJSONLayer(responseObject);
				service.resetSearch();
				if (responseObject["Results"].tplSearch) {
					$("input[name=filterTplResults]").attr("placeholder", Globalization.labels.categorySearchMenu.filterLines);
					$("#resultsMenuInner").css("top", "92px");
				}
				$("#categorySearchGoButton").css("width", "50%");
				$("#categorySearchLastResultsButton").show();
			}
		}

		function lastResults () {
			var service = this;
			
			service.refreshMenu();
			service.show();
			MapManager.addGeoJSONLayerWithoutArea({ "Results": service.results });
			if (service.results.tplSearch) {
				$("input[name=filterTplResults]").attr("placeholder", Globalization.labels.categorySearchMenu.filterLines);
				$("#resultsMenuInner").css("top", "92px");
			}
		}

		//callBack
		function errorQuery (error) {
			var service = this;
			
			service.resetSearch();
			navigator.notification.alert(Globalization.alerts.servicesServerError.message, function () { }, Globalization.alerts.servicesServerError.title);
		}
	}
})();