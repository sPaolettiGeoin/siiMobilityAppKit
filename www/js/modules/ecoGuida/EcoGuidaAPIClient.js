var ecoGuidaAPIClient = {
	carBrands: ["Alfa", "Dacia", "Ferrari"],
	carModels: [
		{"brand": "Alfa", "models": ["Delta", "Romeo"]},
		{"brand": "Dacia", "models": ["Sandero", "Duster"]},
		{"brand": "Ferrari", "models": ["1500", "2500"]}
	],
	executeQuery: function(actionQuery, successQueryAction, errorQuery) {
		console.log("actionQuery: " + actionQuery);
		//console.log("actionQuery.split('?')[0]: " + actionQuery.split("?")[0]);
		var action;
		var params = null;
		if (actionQuery.indexOf("?") > -1) {
			var sections = actionQuery.split("?");
			action = sections[0];
			params = sections[1];
		}
		else {
			action = actionQuery;
		}
		
		var response = {};
		response.status = {};
		response.status.error_message = "successful";
		response.status.current_operation = action;
		response.status.error_code = 0;
		response.data = {};
		
		var initialTime = new Date();
		console.log("action: " + action);
		if (action === "/ecoGuide/carBrands/") {
			response.data.carBrands = this.carBrands;
		}
		else if (action === "/ecoGuide/carModels/") {
			var getModels = function(brand) {
				var models = [];
				ecoGuidaAPIClient.carModels.forEach(function(model) {
					if (model.brand === brand) {
						models = model.models;
					}
				});
				return models;
			};
			var brand = ecoGuidaAPIClient.getParameterFromPath(params, "brand");
			response.data.carModels = getModels(brand);
		}
		else {
			errorQuery("Unknown action");
			return;
		}
		
		response.elapsed_ms = (new Date() - initialTime) / 1000;
		successQueryAction(JSON.stringify(response));
	},
	getParameterFromPath: function(params, paramName) {
		var value = null;
		if (params) {
			var paramsPairs = params.split("&");
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