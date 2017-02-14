var PathFinder = {

    open: false,
    expanded: false,
    results: [],
    showResult: false,
    varName: "PathFinder",
    idMenu: "pathFinderMenu",
    coordinates: "",
    
    pathPoints: [ ],
    lastSelected: null,
    curDestPointQuery: 1,
    curStartDateTime: null,
    curMarker: null,

    startPointIcon: null,
    destPointIcon: null,

    setCoordinates: function() {
        this.coordinates = MapManager.manualMarkerCoordinates();
    },
    
    keyPressEnter: function (event, name) {
        if (event.which == 13 || event.keyCode == 13) {
            // Call Text Search Query
            console.log("Key Press Enter! Point " + name);
            PathFinder.searchText();
            return false;
        }
        return true;
    },

    selectChange: function(id, value) {
        name = id.replace("select","");
        PathFinder.lastSelected = null;
        for (var point of PathFinder.pathPoints) {
            if (point.name == name) {
                PathFinder.lastSelected = point;
                point.type = value;
            }
        }
        var e = document.getElementById("divSearch" + name);
        e.style.display = 'none';
        if (PathFinder.lastSelected) {
            if (value == "gps") {
                // Find gps coordinates and get reverse geocoding
                PathFinder.coordinates = MapManager.gpsMarkerCoordinates();
                PathFinder.searchLocation();
                MapManager.removeAndUpdatePopUpGpsMarker();
            }
            else if (value == "point") {
                // Wait for user selection on map
            }
            else if (value == "text") {
                // Wait for full text search by user
                e.style.display = 'block';
            }
        }
    },

    init: function() {
                
        PathFinder.startPointIcon = Utility.checkServiceIcon(RelativePath.images + SettingsManager.language + '/FirstStopOfRoute.png', "classic");
        PathFinder.destPointIcon = Utility.checkServiceIcon(RelativePath.images + SettingsManager.language + '/LastStopOfRoute.png', "classic");
        
        PathFinder.show();
        //GpsManager.stopWatchingPosition();
        MapManager.removeAndUpdatePopUpGpsMarker();
        MapManager.map.on('singleclick', function (event) {
            if (PathFinder.open) {
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
                        if (!PathFinder.showResult && PathFinder.lastSelected && (PathFinder.lastSelected.type == "point")) {
                            $(element).popover({
                                'placement': 'top',
                                'animation': false,
                                'html': true,
                                'content': "<h4><a onclick=\"PathFinder.setCoordinates();PathFinder.searchLocation();MapManager.closePopUp();\" style=\"text-decoration: none;cursor: pointer;\"><b style=\"color: blue; white-space: nowrap;\"> " + Globalization.labels.pathFinderMenu.popupSelectLabel + " </b></a></h4><h4><a onclick=\"MapManager.removeManualMarker();\" style=\"text-decoration: none;cursor: pointer;\"><b style=\"color: red\"> " + Globalization.labels.pathFinderMenu.popupCancelLabel + " </b></a></h4>"
                            });
                            $(element).popover('show');
                        }
                    }
                }
            }
        });
    },

    addMarker: function(lat, lon) {
        console.log("Coordinate: " + lat + ", " + lon);
        if (PathFinder.curMarker === null) {
            var feature = new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.fromLonLat([lon, lat])),
                name: "curPoint"
            });
            
            var iconStyle = new ol.style.Style({
                image: new ol.style.Icon({
                    anchor: [0.5, 1],
                    size: [16, 24],
                    src: 'img/manualMarker.png'
                })
            })

            feature.setStyle(iconStyle);

            PathFinder.curMarker = new ol.layer.Vector({
                source: new ol.source.Vector({
                    features: [feature]
                })
            });
            if (MapManager.map != null) {
                MapManager.map.addLayer(PathFinder.curMarker);
                PathFinder.curMarker.setZIndex(50);
            }
        } else {
            PathFinder.curMarker.getSource().getFeatures()[0].setGeometry(new ol.geom.Point(ol.proj.fromLonLat([lon, lat])));
        }
    },

    addPointMarker: function (point) {
        console.log(point.name + " " + point.index);
        MapManager.removeManualMarker();
        MapManager.removeGpsMarker();
        if (!point.marker) {
            console.log("Crea Marker");
            var pointFeature = new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.fromLonLat([point.coordinates[1], point.coordinates[0]])),
                name: point.name
            });
            
            var iconUrl = PathFinder.destPointIcon;
            if (point.index == 0) {
                iconUrl = PathFinder.startPointIcon;
            }
            console.log(iconUrl);
            var iconStyle = new ol.style.Style({
                image: new ol.style.Icon({
                    anchor: [0.5, 1],
                    size: [36, 41],
                    src: iconUrl
                })
            })

            pointFeature.setStyle(iconStyle);

            point.marker = new ol.layer.Vector({
                source: new ol.source.Vector({
                    features: [pointFeature]
                })
            });
            if (MapManager.map != null) {
                MapManager.map.addLayer(point.marker);
                point.marker.setZIndex(50);
                
            }
        } else {
            point.marker.getSource().getFeatures()[0].setGeometry(new ol.geom.Point(ol.proj.fromLonLat([point.coordinates[1], point.coordinates[0]])));
        }
    },

    addPoint: function() {
        var newIndex = PathFinder.pathPoints[PathFinder.pathPoints.length-1].index + 1;
        PathFinder.pathPoints.push({ name: "Dest"+newIndex,
                            label: Globalization.labels.pathFinderMenu.destinationPointLabel+" "+newIndex,
                            index: newIndex, removable: true });
        PathFinder.refreshMenu();
        for (var point of PathFinder.pathPoints) {
            if (point.type) {
                console.log("Reimposto " + point.name + " Point Type")
                $("#select" + point.name).val(point.type);
            }
        }
    },

    removePoint: function(id) {
        console.log(id);
        var index = parseInt(id.replace("btnRemove", ""));
        if (index > 1) {
            for (var i in PathFinder.pathPoints) {
                if (PathFinder.pathPoints[i].index == index) {
                    if (PathFinder.pathPoints[i].marker) {
                        MapManager.map.removeLayer(PathFinder.pathPoints[i].marker);
                    }
                    PathFinder.pathPoints.splice(i, 1);
                    break;
                }
            }
            PathFinder.refreshMenu();
            for (var point of PathFinder.pathPoints) {
                if (point.type) {
                    console.log("Reimposto " + point.name + " Point Type")
                    $("#select" + point.name).val(point.type);
                }
            }
        }
    },

    resetPoints: function () {
        if (MapManager.selectedGeometry != null) {
            MapManager.map.removeLayer(MapManager.selectedGeometry);
            MapManager.selectedGeometry = null;
        }
        if (PathFinder.curMarker != null) {
            MapManager.map.removeLayer(PathFinder.curMarker);
            PathFinder.curMarker = null;
        }
        for (var point of PathFinder.pathPoints) {
            if (point.marker) {
                MapManager.map.removeLayer(point.marker);
            }
        }
        PathFinder.pathPoints = [];
        PathFinder.pathPoints.push({ name: "Start", label: Globalization.labels.pathFinderMenu.startPointLabel, index: 0 });
        PathFinder.pathPoints.push({ name: "Dest1", label: Globalization.labels.pathFinderMenu.destinationPointLabel, index: 1 });
        PathFinder.showResult = false;
        PathFinder.refreshMenu();
    },

    show: function () {
        PathFinder.resetPoints();
        application.resetInterface();
        MapManager.showMenuReduceMap("#" + PathFinder.idMenu);
        console.log("PathFinder - Show!");
        console.log("Icon: " + PathFinder.startPointIcon);
        $("#" + PathFinder.idMenu + "Collapse").hide();
        PathFinder.open = true;
        InfoManager.addingMenuToManage(PathFinder.varName);
        application.addingMenuToCheck(PathFinder.varName);
        application.setBackButtonListener();
    },

    hide: function () {
        PathFinder.resetPoints();
        $("#" + PathFinder.idMenu).css({ 'z-index': '1001' });
        MapManager.reduceMenuShowMap("#" + PathFinder.idMenu);
        InfoManager.removingMenuToManage(PathFinder.varName);
        application.removingMenuToCheck(PathFinder.varName);
        PathFinder.open = false;
    },

    checkForBackButton: function () {
        if (PathFinder.open) {
            PathFinder.hide();
        }
    },

    refreshMenuPosition: function () {
        if (PathFinder.open) {
            MapManager.showMenuReduceMap("#" + PathFinder.idMenu);
            Utility.checkAxisToDrag("#" + PathFinder.idMenu);
            if (PathFinder.expanded) {
                PathFinder.expandBusRoutesMenu();
            }
        }
    },

    refreshMenu: function () {
        if ($("#" + PathFinder.idMenu).length == 0) {
            $("#indexPage").
                append("<div id=\"" + PathFinder.idMenu + "\" class=\"commonHalfMenu\"></div>")
        }
        ViewManager.render(PathFinder, "#" + PathFinder.idMenu, "PathFinderMenu");
        for (var point of PathFinder.pathPoints) {
            console.log(point.name);
            ViewManager.render(point, "#pathFinderPoint" + point.name, "PathFinderPoint");
        }
        Utility.movingPanelWithTouch("#" + PathFinder.idMenu + "ExpandHandler",
            "#" + PathFinder.idMenu);
        if (PathFinder.expanded) {
            $("#" + PathFinder.idMenu + "Expand").hide();
        } else {
            $("#" + PathFinder.idMenu + "Collapse").hide();
        }
    },

    closeAll: function () {
        if (PathFinder.open) {
            PathFinder.hide();
        }
    },
    
    expandPathFinder: function () {
        Utility.expandMenu("#" + PathFinder.idMenu,
                           "#" + PathFinder.idMenu + "Expand",
                           "#" + PathFinder.idMenu + "Collapse");
        PathFinder.expanded = true;
    },

    collapsePathFinder: function () {
        Utility.collapseMenu("#" + PathFinder.idMenu,
                             "#" + PathFinder.idMenu + "Expand",
                             "#" + PathFinder.idMenu + "Collapse");
        PathFinder.expanded = false;
    },

    searchLocation: function() {
        var locationQuery = QueryManager.createLocationQuery(PathFinder.coordinates, "user");
        APIClient.executeQuery(locationQuery, PathFinder.successQueryLocation, PathFinder.errorQuery);
    },

    searchText: function() {
        var text = $("#textSearch" + PathFinder.lastSelected.name).val();
        var textQuery = QueryManager.createFullTextQuery(text);
        APIClient.executeQuery(textQuery, PathFinder.successQueryText, PathFinder.errorQuery, "user");
    },

    getPath: function() {
        // Validazione dati coordinate
        for (var p of PathFinder.pathPoints) {
            if (!p.coordinates) {
                navigator.notification.alert(Globalization.labels.pathFinderMenu.alertInputMessage, 
                    function() {}, Globalization.labels.pathFinderMenu.alertInputTitle);
                return;
            }
        }
        var d = new Date();
        PathFinder.curStartDateTime = d.toISOString();
        console.log(PathFinder.curStartDateTime);
        // Reset results
        PathFinder.results = [];
        PathFinder.curDestPointQuery = 1;
        PathFinder.getSubPath();
    },

    getSubPath: function() {
        // TODO: Chiamate API con tappe intermedie
        i = PathFinder.curDestPointQuery;
        if ((i > 0) && (i < PathFinder.pathPoints.length)) {
            if (PathFinder.pathPoints[i-1].coordinates && PathFinder.pathPoints[i].coordinates) {
                var pathQuery = QueryManager.createShortestPathQuery(PathFinder.pathPoints[i-1].coordinates, PathFinder.pathPoints[i].coordinates, "feet", "user", PathFinder.curStartDateTime);
                APIClient.executeQuery(pathQuery, PathFinder.successQueryPath, PathFinder.errorQuery);
            }
        }
        if (i >= PathFinder.pathPoints.length) {
            // Show lines and adjust results
            console.log("results: " + PathFinder.results.length);
            var multiline = "MULTILINESTRING(";
            for (var r of PathFinder.results) {
                for (var route of r.journey.routes) {
                    var line = route.wkt;
                    line = line.replace("LINESTRING", "");
                    console.log(line);
                    multiline = multiline + line + ",";
                    route.distance = Math.floor(route.distance * 1000);
                    for (var arc of route.arc) {
                        arc.distance = Math.floor(arc.distance * 1000);
                    }
                }
            }
            multiline = multiline.slice(0, -1) + ')';
            MapManager.addSelectedGeometry(multiline);
            PathFinder.showResult = true;
            PathFinder.refreshMenu();
        }
    },

    //callBack
    successQueryLocation: function (response) {
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
        for (var f of response.features) {
            console.log(f.id + " " + f.properties.name + " " + f.properties.tipo)
        }
    },

    //callBack
    errorQuery: function(error) {
        navigator.notification.alert(Globalization.alerts.servicesServerError.message, function() {}, Globalization.alerts.servicesServerError.title);
    },

    resetSearch: function () {
        QueryManager.resetMaxDists();
        Loading.hideAutoSearchLoading();
    },

}