angular.module('siiMobilityApp', ['ngCordova', 'ui.router', 'oc.lazyLoad']);

angular.module('siiMobilityApp')
.config(function($stateProvider) {
	$stateProvider
	.state('dynamicModules', {
        url: "healthCare",
        templateUrl: 'ng-modules/healthCare/HealthCare.html',
		controller: "HealthCareCtrl"
    })
});