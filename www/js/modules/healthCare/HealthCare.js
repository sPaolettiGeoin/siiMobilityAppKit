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
			options[0] = {key: "M", value: Globalization.labels.healthCareMenu.options_sex_M, selected: this.sex === Globalization.labels.healthCareMenu.options_sex_M ? "selected" : ""};
			options[1] = {key: "F", value: Globalization.labels.healthCareMenu.options_sex_F, selected: this.sex === Globalization.labels.healthCareMenu.options_sex_F ? "selected" : ""};
			return options;
		}
	},
	open: false,
    expanded: false,
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
		/*
        for (var point of HealthCare.pathPoints) {
            console.log(point.name);
            ViewManager.render(point, "#healthCareMenu" + point.name, "HealthCareMenu");
        }
		*/
        Utility.movingPanelWithTouch("#" + HealthCare.idMenu + "ExpandHandler",
            "#" + HealthCare.idMenu);
		console.log("HealthCare.expanded: " + HealthCare.expanded);
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
        var actionQuery = "getHint";
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
		var actionQuery = "getHealthGoal?goal=" + selectedOption.val();
		//console.log("actionQuery: " + actionQuery);
		appoAPIClient.executeQuery(actionQuery, HealthCare.successQueryAction, HealthCare.errorQuery);
		//HealthCare.refreshMenu();
	},
	successQueryAction: function (actionQuery, response) {
		if (actionQuery === "getHint") {
			HealthCare.hint = response;
		}
		else if (actionQuery === "getHealthOptions") {
			HealthCare.healthOptions = response;
		}
		else if (actionQuery === "getHealthGoal") {
			HealthCare.healthHint = response;
		}
		
		HealthCare.refreshMenu();
    },
}

var appoAPIClient = {
	hints: ["Utilizza le scale ogni volta sia possibile", "Usi sempre l'auto e fai poco moto. Lo sai che camminando 10 minuti ogni giorno consumi 100 calorie?"],
	healthOptions: [
					{key: "loss_weigth", value: "Perdere peso"},
					{key: "walk_more", value: "Camminare di più"}
					],
	executeQuery: function(actionQuery, successQueryAction, errorQuery) {
		//console.log("actionQuery: " + actionQuery);
		//console.log("actionQuery.split('?')[0]: " + actionQuery.split("?")[0]);
		if (actionQuery === "getHint") {
			var randomHintIndex = Math.floor((Math.random() * this.hints.length));
			successQueryAction(actionQuery, this.hints[randomHintIndex]);
		}
		else if (actionQuery === "getHealthOptions") {
			successQueryAction(actionQuery, this.healthOptions);
		}
		else if (actionQuery.split("?")[0] === "getHealthGoal") {
			var healthGoal = appoAPIClient.getParameterFromPath(actionQuery, "goal");
			//console.log("healthGoal: " + healthGoal);
			if (healthGoal === "loss_weigth") {
				successQueryAction(actionQuery.split("?")[0], "Porta fuori il cane");
			}
			else if (healthGoal === "walk_more") {
				successQueryAction(actionQuery.split("?")[0], "Invece di prendere l'auto per andare a lavoro, prendi l'autobus a soli 800 metri da casa. La linea 6 ti porta a 500 metri dal lavoro e camminerai per 20 minuti al giorno.");
			}
			else {
				errorQuery("Unknown healthGoal");
			}
		}
		else {
			errorQuery("Unknown action");
		}
	},
	getParameterFromPath: function(url, paramName) {
		var value = null;
		if (url != null && url.indexOf("?") > -1) {
			var queryString = url.split("?")[1];
			var paramsPairs = queryString.split("&");
			var paramsPair;
			for (var indx = 0; indx < paramsPairs.length; indx++) {
				if (paramsPairs[indx].indexOf("=") > -1) {
					paramsPair = paramsPairs[indx].split("=");
					if (paramsPair[0] == paramName) {
						value = paramsPair[1];
					}
				}
			}
		}
		return value;
	}
}