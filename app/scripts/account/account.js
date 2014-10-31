/*jshint -W020 */
'use strict';
// does not do much now, but provide a template/page for user account information
(function(){

var module = angular.module('jetgrizzlyApp.Account',['ui.router','firebase']);

module.config(function($stateProvider) {
  $stateProvider.state('account', {
    url:'/account',
    parent:'app',
    templateUrl:'views/account/account.html',
    controller:'AccountController'
  });

});

module.controller('AccountController', function ($scope, $firebase, user, updateData, $window) {
  var userEmail = user.email.replace(/@/g,'%40').replace(/\./g,''); //get rid of the .
  var ref = new Firebase('https://scheming-lions.firebaseio.com/users/' + userEmail);
  var sync = $firebase(ref);
  $scope.data = sync.$asObject();



  $scope.user = user;

  $scope.user.firstName = ref.firstName || null;
  $scope.update = function(email, firstName, lastName, birthday, ssn) {
    updateData.saveUserData(email, firstName, lastName, birthday, ssn);
  };

});

module.factory('updateData', ['fbutil', '$timeout', '$window', '$rootScope', function (fbutil, $timeout, $window, $rootScope) {
  // methods that the controller is using
  var functions = {
    saveUserData: function(email, firstName, lastName, birthday, ssn) {
      var userEmail = email.replace(/@/g,'%40').replace(/\./g,''); //get rid of the .
      var ref = new $window.Firebase('https://scheming-lions.firebaseio.com/users/' + userEmail);
      var userData= {
        firstName: firstName,
        lastName: lastName,
        birthday: birthday,
        ssn: ssn,
      };

      ref.update(userData, function() {
        //provide user feed back for successful data update
      });
    }
  };
  return functions;
}]);

})();