angular.module('siiMobilityApp', ['ngCordova', 'ui.router', 'oc.lazyLoad']);

angular.module('siiMobilityApp')
.config(function($stateProvider) {
	$stateProvider
	.state('HealthCare', {
        url: "HealthCare",
        templateUrl: 'ng-modules/HealthCare/HealthCare.html'
    })
	.state('GuideStyle', {
        url: "GuideStyle",
        templateUrl: 'ng-modules/GuideStyle/content.html'
    })
});