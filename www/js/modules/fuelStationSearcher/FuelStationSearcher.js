/* SII-MOBILITY DEV KIT MOBILE APP KM4CITY.
   Copyright (C) 2016 DISIT Lab http://www.disit.org/6981 - University of Florence
   This program is free software; you can redistribute it and/or
   modify it under the terms of the GNU Affero General Public License
   as published by the Free Software Foundation.
   The interactive user interfaces in modified source and object code versions 
   of this program must display Appropriate Legal Notices, as required under 
   Section 5 of the GNU Affero GPL . In accordance with Section 7(b) of the 
   GNU Affero GPL , these Appropriate Legal Notices must retain the display 
   of the "Sii-Mobility Dev Kit Mobile App Km4City" logo. The Logo "Sii-Mobility
  Dev Kit Mobile App Km4City" must be a clickable link that leads directly to the
  Internet URL http://www.sii-mobility.org oppure a DISIT Lab., using 
  technology derived from  Http://www.km4city.org.
   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.
   You should have received a copy of the GNU Affero General Public License
   along with this program; if not, write to the Free Software
   Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA. 
*/
var FuelStationSearcher = {

    open: false,
    expanded: false,
    results: null,
    varName: "FuelStationSearcher",
    idMenu: "fuelStationMenu",

    refreshMenu: function () {
        if ($("#" + FuelStationSearcher.idMenu).length == 0) {
            $("#indexPage").
                append("<div id=\"" + FuelStationSearcher.idMenu + "\" class=\"commonHalfMenu\"></div>")
        }
        ViewManager.render(FuelStationSearcher.results, "#" + FuelStationSearcher.idMenu, "FuelStationMenu");
        Utility.movingPanelWithTouch("#" + FuelStationSearcher.idMenu + "ExpandHandler",
            "#" + FuelStationSearcher.idMenu);
        if (FuelStationSearcher.expanded) {
            $("#" + FuelStationSearcher.idMenu + "Expand").hide();
        } else {
            $("#" + FuelStationSearcher.idMenu + "Collapse").hide();
        }
    },

    show: function () {
        application.resetInterface();
        MapManager.showMenuReduceMap("#" + FuelStationSearcher.idMenu);
        console.log("FuelStationSearcher - Show");
        $("#" + FuelStationSearcher.idMenu + "Collapse").hide();
        FuelStationSearcher.open = true;
        InfoManager.addingMenuToManage(FuelStationSearcher.varName);
        application.addingMenuToCheck(FuelStationSearcher.varName);
        application.setBackButtonListener();
    },

    hide: function () {
        $("#" + FuelStationSearcher.idMenu).css({ 'z-index': '1001' });
        MapManager.reduceMenuShowMap("#" + FuelStationSearcher.idMenu);
        InfoManager.removingMenuToManage(FuelStationSearcher.varName);
        application.removingMenuToCheck(FuelStationSearcher.varName);
        FuelStationSearcher.open = false;
    },

    checkForBackButton: function () {
        if (FuelStationSearcher.open) {
            FuelStationSearcher.hide();
        }
    },

    refreshMenuPosition: function () {
        if (FuelStationSearcher.open) {
            MapManager.showMenuReduceMap("#" + FuelStationSearcher.idMenu);
            Utility.checkAxisToDrag("#" + FuelStationSearcher.idMenu);
            if (FuelStationSearcher.expanded) {
                FuelStationSearcher.expandBusRoutesMenu();
            }
        }
    },

    closeAll: function () {
        if (FuelStationSearcher.open) {
            FuelStationSearcher.hide();
        }
    },

    expandFuelStationSearcher: function () {
        Utility.expandMenu("#" + FuelStationSearcher.idMenu,
                           "#" + FuelStationSearcher.idMenu + "Expand",
                           "#" + FuelStationSearcher.idMenu + "Collapse");
        FuelStationSearcher.expanded = true;
    },

    collapseFuelStationSearcher: function () {
        Utility.collapseMenu("#" + FuelStationSearcher.idMenu,
                             "#" + FuelStationSearcher.idMenu + "Expand",
                             "#" + FuelStationSearcher.idMenu + "Collapse");
        FuelStationSearcher.expanded = false;
    },

    search: function() {
        var fuelStationQuery = QueryManager.createCategoriesQuery(['Fuel_station'],
                SearchManager.searchCenter, "user");
        APIClient.executeQuery(fuelStationQuery, FuelStationSearcher.searchInformationForEachFeature, FuelStationSearcher.errorQuery);
    },

    searchInformationForEachFeature(response) {
        for (var category in response) {
            if (response[category].features.length != 0) {
                FuelStationSearcher.responseLength = response[category].features.length;
                FuelStationSearcher.temporaryResponse = {
                    "Results": {
                        "features": [],
                        "fullCount": FuelStationSearcher.responseLength,
                        "type": "FeatureCollection",
                    }
                };
                Loading.showAutoSearchLoading();
                for (var i = 0; i < response[category].features.length; i++) {
                    var serviceQuery = QueryManager.createServiceQuery(response[category].features[i].properties.serviceUri, "app");
                    APIClient.executeQueryWithoutAlert(serviceQuery, FuelStationSearcher.mergeResults, FuelStationSearcher.decrementAndCheckRetrieved);
                }
            } else {
                SearchManager.startAutoSearch(FuelStationSearcher.varName);
            }
        } 
    },

    mergeResults: function (response) {
        for (var category in response) {
            if (response[category].features != null) {
                if (response[category].features.length != 0) {
                    if (response.realtime != null) {
                        if (response.realtime.results != null) {
                            if (response.realtime.results.bindings[0] != null) {
                                
                                response[category].features[0].properties.fuelPrices = response.realtime.results.bindings;

                                for (i = 0; i < response[category].features[0].properties.fuelPrices.length; i++) { 
                                    if (response[category].features[0].properties.fuelPrices[i].self && 
                                            response[category].features[0].properties.fuelPrices[i].self.value == "true") {
                                        response[category].features[0].properties.fuelPrices[i].isSelf = true
                                    }
                                }
                                /*
                                for (var binding in response.realtime.results.bindings) {
                                    var fp;
                                    fp.fuel = binding.fuel.value;
                                    fp.price = binding.price.value;
                                    fp.currency = binding.currency.value;
                                    fp.self = binding.self.value;
                                    response[category].features[0].properties.fuelPrices.push(fp)
                                }*/
                            }
                        }
                    }
                    FuelStationSearcher.temporaryResponse["Results"].features.push(response[category].features[0]);
                }
            }
        }

        FuelStationSearcher.decrementAndCheckRetrieved();
    },

    decrementAndCheckRetrieved: function(){
        FuelStationSearcher.responseLength--;

        if (FuelStationSearcher.responseLength == 0) {
            FuelStationSearcher.successQuery(FuelStationSearcher.temporaryResponse);
            Loading.hideAutoSearchLoading();
        }
    },

    //callBack
    successQuery: function (response) {
       
        var responseObject = response;

        if (SearchManager.typeOfSearchCenter == "selectedServiceMarker") {
            MapManager.searchOnSelectedServiceMarker = true;
        }
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

        FuelStationSearcher.results = responseObject["Results"];
        FuelStationSearcher.refreshMenu();
        FuelStationSearcher.show();
        MapManager.addGeoJSONLayer(responseObject);
        FuelStationSearcher.resetSearch();
    },

    //callBack
    errorQuery: function(error) {
        navigator.notification.alert(Globalization.alerts.servicesServerError.message, 
                                     function() {},
                                     Globalization.alerts.servicesServerError.title);
    },

    resetSearch: function () {
        QueryManager.resetMaxDists();
        Loading.hideAutoSearchLoading();
    },

}