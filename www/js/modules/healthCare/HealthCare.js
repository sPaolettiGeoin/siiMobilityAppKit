var HealthCare = {
	datiAnagrafici: {
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
	},
	open: false,
    expanded: false,
	showMap: false,
    varName: "HealthCare",
    idMenu: "healthCareMenu",
    menuHeaderTitle: "",
	fieldset_characteristics: "",
	fs_char_sex: "",
	fs_char_weight: "",
	modifyButton: "",
	hints: "",
	hint: "",
	healthOptions: [],
	init: function() {
		HealthCare.menuHeaderTitle = Globalization.labels.healthCareMenu.title;
		HealthCare.fieldset_characteristics = Globalization.labels.healthCareMenu.characteristics;
		HealthCare.fs_char_name = Globalization.labels.healthCareMenu.name;
		HealthCare.fs_char_sex = Globalization.labels.healthCareMenu.sex;
		HealthCare.fs_char_weight = Globalization.labels.healthCareMenu.weight;
		HealthCare.fs_char_age = Globalization.labels.healthCareMenu.age;
		HealthCare.fs_char_height = Globalization.labels.healthCareMenu.height;
		HealthCare.cancelButton = Globalization.labels.healthCareMenu.popupCancelLabel;
		HealthCare.modifyButton = Globalization.labels.healthCareMenu.modifyButton;
		HealthCare.hints = Globalization.labels.healthCareMenu.hints;
		HealthCare.healthAction = Globalization.labels.healthCareMenu.healthAction;
        
		HealthCare.loadDatiAnagrafici();
        HealthCare.show();
		
		HealthCare.getHint();
		HealthCare.getHealthOptions();
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
    refreshMenu: function () {
        if ($("#" + HealthCare.idMenu).length == 0) {
			$("#indexPage").
                append("<div id=\"" + HealthCare.idMenu + "\" class=\"commonHalfMenu\"></div>")
        }
		
        ViewManager.render(HealthCare, "#" + HealthCare.idMenu, "HealthCareMenu");
		
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

    //callBack
    errorQuery: function(error) {
		console.log("dbg090: " + JSON.stringify(error));
        navigator.notification.alert(Globalization.alerts.servicesServerError.message, function() {}, Globalization.alerts.servicesServerError.title);
    },
	loadDatiAnagrafici: function() {
		HealthCare.datiAnagrafici.name = localStorage.getItem("name");
		HealthCare.datiAnagrafici.sex = localStorage.getItem("sex");
		if (HealthCare.datiAnagrafici.sex === "M") {
			HealthCare.datiAnagrafici.sexDescr = Globalization.labels.healthCareMenu.options_sex_M;
		}
		else if (HealthCare.datiAnagrafici.sex === "F") {
			HealthCare.datiAnagrafici.sexDescr = Globalization.labels.healthCareMenu.options_sex_F;
		}
		
		HealthCare.datiAnagrafici.weight = localStorage.getItem("weight");
		HealthCare.datiAnagrafici.age = localStorage.getItem("age");
		HealthCare.datiAnagrafici.height = localStorage.getItem("height");
	},
	switchUpdateDatiAnagrafici: function(inModification) {
		HealthCare.datiAnagrafici.inModification = inModification;
        
		HealthCare.refreshMenu();
	},
	updateDatiAnagrafici: function() {
		localStorage.setItem("name", $("#name").val());
		localStorage.setItem("sex", $("#sex").val());
		localStorage.setItem("weight", $("#weight").val());
		localStorage.setItem("age", $("#age").val());
		localStorage.setItem("height", $("#height").val());
		
		HealthCare.loadDatiAnagrafici();
        
		HealthCare.switchUpdateDatiAnagrafici(false);
	},
	getHint: function() {
        var actionQuery = "/recommender/health/";
		actionQuery += "?" + HealthCare.componeDataQuery();
		appoAPIClient.executeQuery(actionQuery, HealthCare.successQueryAction, HealthCare.errorQuery);
    },
	getHealthOptions: function() {
        var actionQuery = "getHealthOptions";
		appoAPIClient.executeQuery(actionQuery, HealthCare.successQueryAction, HealthCare.errorQuery);
    },
	loadHealthAction: function() {
		var selectedOption = $("#healthActions option:selected");
		for (var indx = 0; indx < HealthCare.healthOptions.length; indx++) {
			HealthCare.healthOptions[indx].selected = HealthCare.healthOptions[indx].key === selectedOption.val() ? "selected" : "";
		}
		var actionQuery = "/recommender/healthgoals/";
		actionQuery += "?goal=" + selectedOption.val();
		actionQuery += "&" + HealthCare.componeDataQuery();
		//console.log("actionQuery: " + actionQuery);
		appoAPIClient.executeQuery(actionQuery, HealthCare.successQueryAction, HealthCare.errorQuery);
		//HealthCare.refreshMenu();
	},
	componeDataQuery: function() {
		var dataQuery = "userid=" + "666";
		dataQuery += "&sex=" + HealthCare.datiAnagrafici.sex;
		dataQuery += "&weight=" + HealthCare.datiAnagrafici.weight;
		dataQuery += "&age=" + HealthCare.datiAnagrafici.age;
		dataQuery += "&height=" + HealthCare.datiAnagrafici.height;
		
		return dataQuery;
	},
	successQueryAction: function (responseJson) {
		var response = JSON.parse(responseJson);
		if (response && response.status && response.status.error_code === 0) {
			var actionQuery = response.status.current_operation;
			if (actionQuery === "/recommender/health/") {
				HealthCare.hint = response.data.hint;
			}
			else if (actionQuery === "getHealthOptions") {
				HealthCare.healthOptions = response.data.options;
			}
			else if (actionQuery === "/recommender/healthgoals/") {
				HealthCare.healthHint = response.data.hint;
				
				if (response.data.journey) {
					MapManager.addSelectedGeometry(response.data.journey.wkt);
					HealthCare.collapseHealthCare();
					HealthCare.showMap = true;
					HealthCare.refreshMenu();
				}
			}
		}
		else {
			console.log("response: " + response);
		}
		
		HealthCare.refreshMenu();
    },
}