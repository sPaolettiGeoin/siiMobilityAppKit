var HealthCare = {
	
	datiAnagrafici: {
		nome: "Fabio Biffoli",
		sesso: "M",
		peso: "65Kg"
	},

    open: false,
    expanded: false,
    results: [],
    showResult: false,
    varName: "HealthCare",
    idMenu: "healthCareMenu",
    coordinates: "",
    menuHeaderTitle: "",
	fieldset_characteristics: "",
	fs_char_sex: "",
	fs_char_weight: "",
	modifyButton: "",
	hints: "",
	hint: "",
    pathPoints: [ ],
    lastSelected: null,
    curDestPointQuery: 1,
    curStartDateTime: null,
    curMarker: null,

    startPointIcon: null,
    destPointIcon: null,
	keyPressEnter: function (event, name) {
        if (event.which == 13 || event.keyCode == 13) {
            // Call Text Search Query
            console.log("Key Press Enter! Point " + name);
            HealthCare.searchText();
            return false;
        }
        return true;
    },
	init: function() {
        HealthCare.menuHeaderTitle = Globalization.labels.healthCareMenu.title;
		HealthCare.fieldset_characteristics = Globalization.labels.healthCareMenu.characteristics;
		HealthCare.fs_char_sex = Globalization.labels.healthCareMenu.sex;
		HealthCare.fs_char_weight = Globalization.labels.healthCareMenu.weight;
		HealthCare.modifyButton = Globalization.labels.healthCareMenu.modifyButton;
		HealthCare.hints = Globalization.labels.healthCareMenu.hints;
        //HealthCare.startPointIcon = Utility.checkServiceIcon(RelativePath.images + SettingsManager.language + '/FirstStopOfRoute.png', "classic");
        //HealthCare.destPointIcon = Utility.checkServiceIcon(RelativePath.images + SettingsManager.language + '/LastStopOfRoute.png', "classic");
        
        HealthCare.show();
		
		HealthCare.getHint();
        //GpsManager.stopWatchingPosition();
        //MapManager.removeAndUpdatePopUpGpsMarker();
		/*
        MapManager.map.on('singleclick', function (event) {
            if (HealthCare.open) {
                if (MapManager.map != null) {
                    if (MapManager.manualMarker != null) {
                        $(document.getElementById('manualPopup')).popover('destroy');
                        var element = document.getElementById('manualPopup');
                        if (MapManager.manualMarkerPopUp == null) {
                            MapManager.manualMarkerPopUp = new ol.Overlay({
                                element: element,
                                offset: [0, -23],
                                positioning: 'bottom-center'
                            });

                            MapManager.map.addOverlay(MapManager.manualMarkerPopUp);
                        }

                        MapManager.manualMarkerPopUp.setPosition(MapManager.manualMarker.getSource().getFeatures()[0].getGeometry().getCoordinates());
                        if (!HealthCare.showResult && HealthCare.lastSelected && (HealthCare.lastSelected.type == "point")) {
                            $(element).popover({
                                'placement': 'top',
                                'animation': false,
                                'html': true,
                                'content': "<h4><a onclick=\"HealthCare.setCoordinates();HealthCare.searchLocation();MapManager.closePopUp();\" style=\"text-decoration: none;cursor: pointer;\"><b style=\"color: blue; white-space: nowrap;\"> " + Globalization.labels.healthCareMenu.popupSelectLabel + " </b></a></h4><h4><a onclick=\"MapManager.removeManualMarker();\" style=\"text-decoration: none;cursor: pointer;\"><b style=\"color: red\"> " + Globalization.labels.healthCareMenu.popupCancelLabel + " </b></a></h4>"
                            });
                            $(element).popover('show');
                        }
                    }
                }
            }
        });
		*/
    },
	show: function () {
        application.resetInterface();
        MapManager.showMenuReduceMap("#" + HealthCare.idMenu);
        $("#" + HealthCare.idMenu + "Expand").hide();
        HealthCare.open = true;
        InfoManager.addingMenuToManage(HealthCare.varName);
        application.addingMenuToCheck(HealthCare.varName);
        application.setBackButtonListener();
		HealthCare.refreshMenu();
		HealthCare.expandHealthCare();
    },

    hide: function () {
        $("#" + HealthCare.idMenu).css({ 'z-index': '1001' });
        MapManager.reduceMenuShowMap("#" + HealthCare.idMenu);
        InfoManager.removingMenuToManage(HealthCare.varName);
        application.removingMenuToCheck(HealthCare.varName);
        HealthCare.open = false;
    },

    checkForBackButton: function () {
        if (HealthCare.open) {
            HealthCare.hide();
        }
    },
	
    refreshMenuPosition: function () {
        if (HealthCare.open) {
            MapManager.showMenuReduceMap("#" + HealthCare.idMenu);
            Utility.checkAxisToDrag("#" + HealthCare.idMenu);
            if (HealthCare.expanded) {
                HealthCare.expandBusRoutesMenu();
            }
        }
    },
	
    refreshMenu: function () {
        if ($("#" + HealthCare.idMenu).length == 0) {
            $("#indexPage").
                append("<div id=\"" + HealthCare.idMenu + "\" class=\"commonHalfMenu\"></div>")
        }
		console.log("dbg020");
		
        ViewManager.render(HealthCare, "#" + HealthCare.idMenu, "HealthCareMenu");
		/*
        for (var point of HealthCare.pathPoints) {
            console.log(point.name);
            ViewManager.render(point, "#healthCareMenu" + point.name, "HealthCareMenu");
        }
		*/
        Utility.movingPanelWithTouch("#" + HealthCare.idMenu + "ExpandHandler",
            "#" + HealthCare.idMenu);
        if (HealthCare.expanded) {
            $("#" + HealthCare.idMenu + "Expand").hide();
        } else {
            $("#" + HealthCare.idMenu + "Collapse").hide();
        }
    },

    closeAll: function () {
        if (HealthCare.open) {
            HealthCare.hide();
        }
    },
    
    expandHealthCare: function () {
        Utility.expandMenu("#" + HealthCare.idMenu,
                           "#" + HealthCare.idMenu + "Expand",
                           "#" + HealthCare.idMenu + "Collapse");
        HealthCare.expanded = true;
    },

    collapseHealthCare: function () {
        Utility.collapseMenu("#" + HealthCare.idMenu,
                             "#" + HealthCare.idMenu + "Expand",
                             "#" + HealthCare.idMenu + "Collapse");
        HealthCare.expanded = false;
    },

    searchLocation: function() {
		console.log("dbg040");
        var locationQuery = QueryManager.createLocationQuery(HealthCare.coordinates, "user");
        APIClient.executeQuery(locationQuery, HealthCare.successQueryLocation, HealthCare.errorQuery);
    },

    searchText: function() {
		console.log("dbg050");
        var text = $("#textSearch" + HealthCare.lastSelected.name).val();
        var textQuery = QueryManager.createFullTextQuery(text);
        APIClient.executeQuery(textQuery, HealthCare.successQueryText, HealthCare.errorQuery, "user");
    },
    renderSingleService: function(singleService){
		console.log("dbg010: " + singleService);
        ViewManager.render(singleService, "#" + InfoManager.idMenu, "js/modules/HealthCare.mst.html");
    },
//callBack
    successQueryLocation: function (response) {
		console.log("dbg030: " + response);
        for (var point of PathFinder.pathPoints) {
            if (PathFinder.lastSelected && (PathFinder.lastSelected.name == point.name)) {
                point.coordinates = PathFinder.coordinates;
                point.address = response.address + ", " + response.number + " " + response.municipality;
                ViewManager.render(point, "#pathFinderPoint" + point.name, "PathFinderPoint");
                $("#select" + point.name).val(point.type);
                PathFinder.addPointMarker(point);
                break;
            }
        }
    },

    successQueryPath: function (response) {
		console.log("dbg070");
        if (response.journey && response.journey.routes[0]) {
            var i = PathFinder.curDestPointQuery;
            var indexRoute = 0;
            for (var r of response.journey.routes) {
                PathFinder.curStartDateTime = r.eta;
                for (var indexArc in r.arc) {
                    response.journey.routes[indexRoute].arc[indexArc].index = i + "_" + indexRoute + "_" + indexArc;
                }
                response.journey.routes[indexRoute].index = i+ "_" + indexRoute;
                indexRoute++;
            }
            PathFinder.results.push({  index: i,
                            sourcePoint: PathFinder.pathPoints[i-1],
                            destPoint: PathFinder.pathPoints[i],
                            journey: response.journey});
        }
        PathFinder.curDestPointQuery++;
        PathFinder.getSubPath();
    },

    successQueryText: function (response) {
		console.log("dbg080");
        for (var f of response.features) {
            console.log(f.id + " " + f.properties.name + " " + f.properties.tipo)
        }
    },

    //callBack
    errorQuery: function(error) {
		console.log("dbg090: " + JSON.stringify(error));
        navigator.notification.alert(Globalization.alerts.servicesServerError.message, function() {}, Globalization.alerts.servicesServerError.title);
    },

    resetSearch: function () {
		console.log("dbg100");
        QueryManager.resetMaxDists();
        Loading.hideAutoSearchLoading();
    },
	updateDatiAnagrafici: function() {
		HealthCare.datiAnagrafici.peso = "55Kg";
		HealthCare.refreshMenu();
	},
	getHint: function() {
        var actionQuery = QueryManager.createRetrieveActionsQuery();
		console.log("actionQuery: " + actionQuery);
		HealthCare.hint = "Informazione non ricevuta";
		HealthCare.refreshMenu();
        APIClient.executeQuery(actionQuery, HealthCare.successQueryAction, HealthCare.errorQuery);
    },
	successQueryAction: function (response) {
		console.log("dbg030: " + response);
        HealthCare.hint = response;
		HealthCare.refreshMenu();
    },
}