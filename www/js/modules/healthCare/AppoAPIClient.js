var appoAPIClient = {
	hints: ["Utilizza le scale al posto dell'ascensore", "Usi sempre l'auto e fai poco moto. Lo sai che camminando 10 minuti ogni giorno consumi 100 calorie?"],
	healthOptions: [
					{key: "lose_weight", value: "Perdere peso"},
					{key: "walk_more", value: "Camminare di più"}
					],
	executeQuery: function(actionQuery, successQueryAction, errorQuery) {
		//console.log("actionQuery: " + actionQuery);
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
		if (action === "/recommender/health/") {
			var randomHintIndex = Math.floor((Math.random() * this.hints.length));
			successQueryAction(action, this.hints[randomHintIndex]);
		}
		else if (action === "getHealthOptions") {
			successQueryAction(action, this.healthOptions);
		}
		else if (action === "/recommender/healthgoals/") {
			console.log("params: " + params);
			//console.log("healthGoal: " + healthGoal);
			var healthGoal = appoAPIClient.getParameterFromPath(params, "goal");
			console.log("healthGoal: " + healthGoal);
			if (healthGoal === "lose_weight") {
				var sex = appoAPIClient.getParameterFromPath(params, "sex");
				if (sex === "M") {
					successQueryAction(action, "Porta fuori il cane");
				}
				else {
					successQueryAction(action, "Porta fuori la cagna");
				}
			}
			else if (healthGoal === "walk_more") {
				successQueryAction(action, "Invece di prendere l'auto per andare a lavoro, prendi l'autobus a soli 800 metri da casa. La linea 6 ti porta a 500 metri dal lavoro e camminerai per 20 minuti al giorno.");
			}
			else {
				errorQuery("Unknown goal: " + healthGoal);
			}
		}
		else {
			errorQuery("Unknown action");
		}
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