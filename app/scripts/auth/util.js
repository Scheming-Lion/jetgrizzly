'use strict';
// This module separates the making of a new firebase instance
// for the auth.js for easier testing. This will allow the making of fake
// firease instances while spying on auth.js. It can be injected into other modules
// and used for the same purpose of easier testing.
angular.module('firebase.utils', ['firebase', 'jetgrizzlyApp'])
.factory('fbutil', function(config, $window, $firebase){
  var ref;
  var firebaseRef = function(link) {
  	if (link) {
    	ref = new $window.Firebase(config.firebase.url + link);
    	return ref;
    } else {
    	ref = new $window.Firebase(config.firebase.url);
  		return ref;
  	}
  };
	return {
		ref2: firebaseRef
	};
});
