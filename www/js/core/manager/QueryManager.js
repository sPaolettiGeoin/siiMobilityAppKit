(function(){
	'use strict';
	
	angular
		.module('siiMobilityApp')
		.factory('QueryManager', QueryManager)
	
QueryManager.$inject = ['Parameters', 'SiiMobilityService'];
function QueryManager(Parameters, SiiMobilityService) {
	var service = {
			defaultDists: Parameters.distsQueryManager,
			defaultDistsRecommender: Parameters.distsRecommenderQueryManager,
			defaultResults: Parameters.resultsQueryManager,
			defaultLanguage: "ita",
			defaultProfile: "all",
			version: null,
			appID: null,
			maxDists: null,
			maxDistsRecommender: null,
			maxResults: null,
			language: null,
			profile: null,
			backupMaxDists: null,
			format: "json",
		
			refreshParameters: function(maxDistanceRecommender, maxDistance, numberOfItems, language, profile) {
				//console.log("dbg310");
				if (maxDistanceRecommender != null) {
					QueryManager.maxDistsRecommender = maxDistanceRecommender;
				} else {
					QueryManager.maxDistsRecommender = QueryManager.defaultDistsRecommender;
				}
				if (maxDistance != null) {
					QueryManager.maxDists = maxDistance;
				} else {
					QueryManager.maxDists = QueryManager.defaultDists;
				}

				if (numberOfItems != null) {
					QueryManager.maxResults = numberOfItems;
				} else {
					QueryManager.maxResults = QueryManager.defaultResults;
				}

				if (language != null) {
					QueryManager.language = language.substring(0,2);
				} else {
					QueryManager.language = QueryManager.defaultLanguage;
				}

				if (profile != null) {
					QueryManager.profile = profile;
				} else {
					QueryManager.profile = QueryManager.defaultProfile;
				}
				//console.log("dbg160");
				QueryManager.appID = SiiMobilityService.appID;
				QueryManager.version = SiiMobilityService.version;
			},

			createRetrieveActionsQuery: function () {
				return "engager-api/engager?uid=" + SiiMobilityService.uid;
			},

			createBusStopsRoutesQuery: function (line, agencyUri, busStopName, geometry, requestFrom) {
				return "tpl/bus-routes/?line=" + line + "&agency=" + agencyUri + "&busStopName=" + busStopName + "&geometry=" + geometry + "&requestFrom=" + requestFrom + "&uid=" + SiiMobilityService.uid;
			},

			createRouteQuery: function (route, geometry, requestFrom) {
				return "tpl/bus-stops/?route=" + route + "&geometry=" + geometry + "&requestFrom=" + requestFrom + "&uid=" + SiiMobilityService.uid;
			},

			createLocationQuery: function(queryCoordinates, requestFrom) {
				return "location/?position=" + queryCoordinates.join(";") + "&requestFrom=" + requestFrom + "&uid=" + SiiMobilityService.uid + "&lang=" + QueryManager.language;
			},

			createCategoriesQuery: function (categories, queryCoordinates, requestFrom) {
				if (QueryManager.maxDists === null || QueryManager.maxResults === null) {
					QueryManager.refreshParameters();
				}
				return "?selection=" + queryCoordinates.join(";") + "&requestFrom=" + requestFrom + "&categories=" + categories.join(";") + "&maxResults=" + QueryManager.maxResults + "&maxDists=" + QueryManager.maxDists + "&format=" + QueryManager.format + "&uid=" + SiiMobilityService.uid + "&lang=" + QueryManager.language + "&geometry=true";
			},

			createServiceQuery: function (serviceUri, requestFrom) {
				return "?serviceUri=" + serviceUri + "&requestFrom=" + requestFrom + "&format=" + QueryManager.format + "&uid=" + SiiMobilityService.uid + "&lang=" + QueryManager.language;
			},

			createTextQuery: function (text, queryCoordinates, requestFrom) {
				return "?selection=" + queryCoordinates.join(";") + "&requestFrom=" + requestFrom + "&search=" + encodeURIComponent(text) + "&maxResults=" + QueryManager.maxResults + "&maxDists=" + QueryManager.maxDists + "&format=" + QueryManager.format + "&uid=" + SiiMobilityService.uid + "&lang=" + QueryManager.language + "&geometry=true";
			},

			createFullTextQuery: function (text, requestFrom) {
				return "?search=" + encodeURIComponent(text) + "&requestFrom=" + requestFrom + "&maxResults=" + QueryManager.maxResults + "&format=" + QueryManager.format + "&uid=" + SiiMobilityService.uid + "&lang=" + QueryManager.language + "&geometry=true";
			},

			createFeedbackQuery: function (serviceUri, comment, stars, requestFrom) {
				if (stars != null) {
					return "feedback/?serviceUri=" + serviceUri + "&uid=" + SiiMobilityService.uid + "&stars=" + stars + "&requestFrom=" + requestFrom;
				} else if (comment != null) {
					return "feedback/?serviceUri=" + serviceUri + "&uid=" + SiiMobilityService.uid + "&comment=" + encodeURIComponent(comment) + "&requestFrom=" + requestFrom;
				}
			},

			createLastFeedbackQuery: function (requestFrom) {
				return "feedback/last/?lang=" + QueryManager.language + "&maxResults=" + 8 + "&uid=" + SiiMobilityService.uid + "&requestFrom=" + requestFrom;
			},
			
			createEventsQuery: function(time, requestFrom){
				return "events/?range=" + time + "&requestFrom=" + requestFrom + "&uid=" + SiiMobilityService.uid;
			},

			createVoteSuggestion: function (serviceUri, genID, vote, suggType) {
				if (serviceUri != null) {
					return "?action=assess&uid=" + SiiMobilityService.uid + "&serviceUri=" + serviceUri + "&vote=" + vote + "&suggType=" + suggType;
				} else if (genID != null) {
					return "?action=assess&uid=" + SiiMobilityService.uid + "&genID=" + genID + "&vote=" + vote + "&suggType=" + suggType;
				}
			},

			createRecommenderQuery: function(queryCoordinates, mode, aroundMe) {
				LogRecommender.write(dateFormat(new Date(), "[yyyy-mm-dd HH:MM:ss]") + "getSuggestions " + " latitude=" + queryCoordinates[0] + " longitude=" + queryCoordinates[1] + " mode=" + mode + " distance=" + QueryManager.maxDistsRecommender);
				return "?action=recommend&uid=" + SiiMobilityService.uid + "&uid2=" + SiiMobilityService.uid2 + "&appID=" + QueryManager.appID + "&profile=" + QueryManager.profile + "&version=" + QueryManager.version + "&latitude=" + queryCoordinates[0] + "&longitude=" + queryCoordinates[1] + "&mode=" + mode + "&aroundme=" + aroundMe + "&distance=" + QueryManager.maxDistsRecommender + "&lang=" + QueryManager.language;
			},
			
			createRecommendAGroupQuery: function(queryCoordinates, groupToRecommend, mode) {
				LogRecommender.write(dateFormat(new Date(), "[yyyy-mm-dd HH:MM:ss]") + "getGroupSuggestions " + " group=" + groupToRecommend + " latitude=" + queryCoordinates[0] + " longitude=" + queryCoordinates[1] + " mode=" + mode + " distance=" + QueryManager.maxDistsRecommender);
				return "?action=recommendForGroup&uid=" + SiiMobilityService.uid + "&uid2=" + SiiMobilityService.uid2 + "&appID=" + QueryManager.appID + "&profile=" + QueryManager.profile + "&version=" + QueryManager.version + "&latitude=" + queryCoordinates[0] + "&longitude=" + queryCoordinates[1] + "&mode=" + mode + "&group=" + groupToRecommend + "&distance=" + QueryManager.maxDistsRecommender + "&lang=" + QueryManager.language;
			},

			createDislikeGroupQuery: function(groupToDislike) {
				LogRecommender.write(dateFormat(new Date(), "[yyyy-mm-dd HH:MM:ss]") + "dislikeGroup " + " group=" + groupToDislike);
				return "?action=dislike&uid=" + SiiMobilityService.uid + "&group=" + groupToDislike + "&lang=" + QueryManager.language;
			},
			
			createDislikeSubCategoryQuery: function(subCategoryToDislike) {
				LogRecommender.write(dateFormat(new Date(), "[yyyy-mm-dd HH:MM:ss]") + "dislikeSubCategory " + " subcategory=" + subCategoryToDislike);
				return "?action=dislikeSubclass&uid=" + SiiMobilityService.uid + "&subclass=" + subCategoryToDislike + "&lang=" + QueryManager.language;
			},

			createRemoveDislikeQuery: function() {
				LogRecommender.write(dateFormat(new Date(), "[yyyy-mm-dd HH:MM:ss]") + "removeAllDislike");
				return "?action=removeDislike&uid=" + SiiMobilityService.uid + "&lang=" + QueryManager.language;
			},

			createLogViewedTweetQuery: function(tweetID, group){
				LogRecommender.write(dateFormat(new Date(), "[yyyy-mm-dd HH:MM:ss]") + "logViewedTweet");
				return "?action=logViewedTweet&uid=" + SiiMobilityService.uid + "&twitterId=" + tweetID + "&group=" + group + "&lang=" + QueryManager.language;
			},

			createLogPrincipalMenuChoices: function (buttonId, requestFrom) {
				return "notification/?uid=" + SiiMobilityService.uid + "&selection=" + buttonId + "&requestFrom=" + requestFrom;
			},
			
			createLogRemoveMessagePersonalAssistant: function(messageId){
				return "cancel-engagement?id=" + messageId;
			},

			increaseMaxDistTemporary: function() {
				if (QueryManager.backupMaxDists == null) {
					QueryManager.backupMaxDists = QueryManager.maxDists;
				}
				QueryManager.maxDists = QueryManager.maxDists * 2;
				if (QueryManager.maxDists > Parameters.limitDistance) {
					return false;
				}
				return true;
			},

			resetMaxDists: function() {
				if (QueryManager.backupMaxDists != null) {
					QueryManager.maxDists = QueryManager.backupMaxDists;
					QueryManager.backupMaxDists = null;
				}
			}
		}
		
		return service;
	}
})();