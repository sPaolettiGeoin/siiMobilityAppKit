var appoAPIClient = {
	hints: ["Utilizza le scale al posto dell'ascensore", "Usi sempre l'auto e fai poco moto. Lo sai che camminando 10 minuti ogni giorno consumi 100 calorie?"],
	healthOptions: '[{"key": "lose_weight", "value": "Perdere peso"},' +
					'{"key": "walk_more", "value": "Camminare di piu\'"}]',
	executeQuery: function(actionQuery, successQueryAction, errorQuery) {
		//console.log("actionQuery: " + actionQuery);
		//console.log("actionQuery.split('?')[0]: " + actionQuery.split("?")[0]);
		var action;
		var json;
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
			json = '{"response":{"error_message":"successful","current_operation":"route optimization","error_code":"0"}' +
							',"elapsed_ms":14327,"message_version":"1.0",' +
							'"hint": "' + this.hints[randomHintIndex] + '"}';
			//console.log("json: " + json);
		}
		else if (action === "getHealthOptions") {
			json = '{"response":{"error_message":"successful","current_operation":"route optimization","error_code":"0"}' +
							',"elapsed_ms":14327,"message_version":"1.0",' +
							'"responseObject": ' + this.healthOptions + '}';
		}
		else if (action === "/recommender/healthgoals/") {
			//console.log("params: " + params);
			//console.log("healthGoal: " + healthGoal);
			var healthGoal = appoAPIClient.getParameterFromPath(params, "goal");
			console.log("healthGoal: " + healthGoal);
			
			if (healthGoal === "lose_weight") {
				var sex = appoAPIClient.getParameterFromPath(params, "sex");
				//console.log("sex: " + sex);
				if (sex === "M") {
					json = '{"response":{"error_message":"successful","current_operation":"route optimization","error_code":"0"}' +
							',"elapsed_ms":14327,"message_version":"1.0",' +
							'"hint": "Porta fuori il cane"}';
				}
				else {
					json = '{"response":{"error_message":"successful","current_operation":"route optimization","error_code":"0"}' +
							',"elapsed_ms":14327,"message_version":"1.0",' +
							'"hint": "Porta fuori la cagna"}';
				}
			}
			else if (healthGoal === "walk_more") {
				json = '{"journey":{"routes":[{"wkt":"LINESTRING(11.248197799999955 43.77360880000041,' +
				'11.248243299999997 43.77364769999992,11.248776499999991 43.7732725,11.248813200000027 43.773246700000236,' +
				'11.248888499999957 43.7732941000004,11.249025699999956 43.77327530000041,11.249024899999958 43.7732369000004)"}]},' +
				'"response":{"error_message":"successful","current_operation":"route optimization","error_code":"0"},' +
				'"elapsed_ms":14327,"message_version":"1.0",' +
				'"hint": "Invece di prendere l\'auto per andare a lavoro, prendi l\'autobus a soli 800 metri da casa. La linea 6 ti porta a 500 metri dal ' + 'lavoro e camminerai per 20 minuti al giorno.",' +
				'"needMap": "true"}';
			}
			else {
				errorQuery("Unknown goal: " + healthGoal);
				return;
			}
		}
		else {
			errorQuery("Unknown action");
			return;
		}
		
		successQueryAction(action, json);
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