angular.module('siiMobilityApp', ['ngCordova', 'ui.router']);

angular.module('siiMobilityApp')
.config(function($stateProvider) {
	$stateProvider
	.state('dynamicModules', {
        url: "dynamicModules",
        templateUrl: 'js/modules/healthCare/HealthCare.html',
		//template: 'pippppo',
        controller: function ($stateParams) {
            console.log("dbg999: " + JSON.stringify($stateParams));
			//$injector.invoke(['HealthCare', function(service){service.doWork();}]);
        }
    })
});