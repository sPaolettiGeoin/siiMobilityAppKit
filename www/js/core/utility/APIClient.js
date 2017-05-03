(function(){
	'use strict';
	
	angular
		.module('siiMobilityApp')
		.factory('APIClient', APIClient)
	
	APIClient.$inject = ['SiiMobilityService', 'Parameters', 'NavigatorSearcher'];
	function APIClient(SiiMobilityService, Parameters, NavigatorSearcher) {
		var service = {
			apiUrl: "http://www.disit.org/ServiceMap/api/v1/",                    
			photoServerUrl: "http://www.disit.org/ServiceMap/api/v1/photo",
			
			fileTransfer: null,
			lockQuery: false,

			executeQuery: function(query, successCallback, errorCallback) {
				var service = this;
				
				if (query != null && successCallback != null) {
					if (!service.lockQuery) {
						console.log("dbg250");
						if (!SiiMobilityService.checkConnection()) {
							navigator.notification.alert(Globalization.alerts.connectionError.message, function () { }, Globalization.alerts.connectionError.title);
						}
						else if (SiiMobilityService.uid == null) {
							//Not yet fully loaded?
						}
						else {
							$.ajax({
								url: encodeURI(service.apiUrl + query),
								timeout: Parameters.timeoutGetQuery,
								method: "GET",
								dataType: "json",
								beforeSend: function () {
									service.lockQuery = true;
									Loading.show();
								},
								success: function (data) {
									service.lockQuery = false;
									successCallback(data);
								},
								error: function (error) {
									service.lockQuery = false;
									errorCallback(error);
								},
								complete: function () {
									Loading.hide();
								}
							});
						}
					} else {
						service.showOperationRunning();
					}
				} 
			},

			executeQueryWithoutAlert: function (query, successCallback, errorCallback) {
				var service = this;
				
				if (query != null && successCallback != null) {
					if (SiiMobilityService.checkConnection()) {
						console.log(service.apiUrl + query);
						//console.log("dbg800: " + successCallback);
						$.ajax({
							url: encodeURI(service.apiUrl + query),
							timeout: Parameters.timeoutGetQuery,
							method: "GET",
							dataType: "json",
							success: function (data) {
								successCallback(data);
							},
							error: function (error) {
								if (errorCallback != null) {
									errorCallback(error);
								}
							},
							beforeSend: function () {
								if (NavigatorSearcher.started) {
									Loading.show();
								}
							},
							complete: function () {
								if (NavigatorSearcher.started) {
									Loading.hide();
								}
							}
						});
					} 
				}
			},

			executeQueryText: function (query, successCallback, errorCallback) {
				var service = this;
				
				if (query != null && successCallback != null) {
					if (!service.lockQuery) {
						if (SiiMobilityService.checkConnection()) {
							console.log(service.apiUrl + query);
							$.ajax({
								url: encodeURI(service.apiUrl + query),
								timeout: Parameters.timeoutGetQuery,
								method: "GET",
								dataType: "text",
								beforeSend: function () {
									service.lockQuery = true;
									Loading.showSettingsLoading();
								},
								success: function (data) {
									service.lockQuery = false;
									successCallback(data);
								},
								error: function (error) {
									service.lockQuery = false;
									errorCallback(error);
								},
								complete: function () {
									Loading.hideSettingsLoading();
									
								}
							});
						} else {
							navigator.notification.alert(Globalization.alerts.connectionError.message, function () { }, Globalization.alerts.connectionError.title);
						}
					} else {
						service.showOperationRunning();
					}
				}
			},

			uploadPhoto: function (photoUrl, serviceUri, successCallback, errorCallback) {
				var service = this;
				
				service.fileTransfer = new FileTransfer();
				var options = new FileUploadOptions();
				

				var params = {};
				params.uid = SiiMobilityService.uid;
				params.serviceUri = serviceUri;
				options.params = params;
				if (photoUrl.substring(photoUrl.lastIndexOf(".") + 1) == "jpg") {
					options.mimeType = "image/jpeg";
				} else {
					options.mimeType = "image/" + photoUrl.substring(photoUrl.lastIndexOf(".") + 1);
				}
				var paramsWindows = "";
				
				options.fileKey = "file";
				options.fileName = photoUrl.substring(photoUrl.lastIndexOf("/") + 1);

				service.fileTransfer.upload(photoUrl, encodeURI(service.photoServerUrl), successCallback, errorCallback, options);
			},

			uploadPhotoFromWeb: function (query, formData, successCallback, errorCallback) {
				var service = this;
				
				if (SiiMobilityService.checkConnection()) {
					console.log(service.photoServerUrl);
					$.ajax({
						data: formData,
						processData: false,
						contentType: false,
						type: 'POST',
						url: encodeURI(service.photoServerUrl + query),
						timeout: Parameters.timeoutPostQuery,
						success: function (data) {
							successCallback(data);
						},
						error: function (error) {
							errorCallback(error);
						},
					});
				}
			},

			abortUploadingPhoto: function(){
				var service = this;
				
				if (service.fileTransfer != null) {
					service.fileTransfer.abort();
				}
			},

			showOperationRunning: function () {
				var service = this;
				
				if (typeof window.plugins != "undefined") {
					window.plugins.toast.showWithOptions(
								{
									message: Globalization.labels.service.operationRunning,
									duration: "long", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself. 
									position: "bottom",
									addPixelsY: -40  // added a negative value to move it up a bit (default 0) 
								},
								function () { }, // optional
								function () { }    // optional 
								);
				}
			}
		}
		
		return service;
	}
})();
