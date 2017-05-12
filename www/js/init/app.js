angular.module('siiMobilityApp', ['ngCordova', 'ui.router']);

angular.module('siiMobilityApp')
.config(function($stateProvider) {
	$stateProvider
	.state('dynamicModules', {
        url: "dynamicModules",
        templateUrl: 'pippo/HealthCare.html'
		//template: 'pippp123po'
    })
});