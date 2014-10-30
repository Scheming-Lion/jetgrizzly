/*jshint -W020 */
'use strict';
// does not do much now, but provide a template/page for user account information
(function(){

var module = angular.module('jetgrizzlyApp.Account',['ui.router']);

module.config(function($stateProvider) {
  $stateProvider.state('account', {
    url:'/account',
    parent:'app',
    templateUrl:'views/account/account.html',
    controller:'AccountController'
  });

});

module.controller('AccountController', function ($scope, user, updateData, $window) {
  var userEmail = user.email.replace(/@/g,'%40').replace(/\./g,''); //get rid of the .
  var ref = new $window.Firebase('https://scheming-lions.firebaseio.com/users/' + userEmail);
  $scope.user.firstName = ref.firstName || null;

  $scope.user = user;
  $scope.update = function(email, firstName, lastName, dinosaur, bday, muffin, ssn, bitcoin) {
    updateData.saveUserData(email, firstName, lastName, dinosaur, bday, muffin, ssn, bitcoin);
  };

});

module.factory('updateData', ['fbutil', '$timeout', '$window', '$rootScope', function (fbutil, $timeout, $window, $rootScope) {
  // methods that the controller is using
  var functions = {
    saveUserData: function(email, firstName, lastName, dinosaur, bday, muffin, ssn, bitcoin) {
      var userEmail = email.replace(/@/g,'%40').replace(/\./g,''); //get rid of the .
      var ref = new $window.Firebase('https://scheming-lions.firebaseio.com/users/' + userEmail);
      var userData= {
        firsName: firstName,
        lastName: lastName,
        dinosaur: dinosaur,
        bday: bday,
        muffin: muffin,
        ssn: ssn,
        bitcoin: bitcoin
      };
      console.log(userEmail);
      console.log(userData);

      ref.update(userData, function() {console.log('success');});
    }
  };
  return functions;
}]);

})();