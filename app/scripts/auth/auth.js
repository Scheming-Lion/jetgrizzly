      'use strict';
/*jshint -W079 */
(function(){
var module = angular.module('jetgrizzlyApp.Auth', ['firebase.utils', 'ui.router', 'firebase']);
// var previousLocation = null;
// ui route method, tells which state is to which controller
module.config(function ($stateProvider) {
  $stateProvider.state('login', {
    url: '/login',
    parent: 'app',
    templateUrl: 'views/auth/login.html',
    controller: 'LoginController'
  });
  $stateProvider.state('register', {
    url: '/register',
    parent: 'app',
    templateUrl: 'views/auth/register.html',
    controller: 'RegisterController'
  });
  $stateProvider.state('logout', {
    url: '/logout',
    parent: 'app',
    controller: 'LogoutController'
  });
});
module.controller('LoginController', function ($scope, SimpleLogin, $state, $stateParams) {
  $scope.user = {};
  $scope.success = true;
  $scope.login = function() {
    SimpleLogin.login($scope.user.email, $scope.user.password)
      .then(function(user) {
        $scope.successfullyLoggedIn();
        $state.go('lobby', $stateParams, {
          reload: true
        });
      }, function(err) {
        // Add real user feedback here.
        $scope.failedToLogin();
        $scope.user.email = '';
        $scope.user.password = '';
      });
  };

  $scope.successfullyLoggedIn = function() {
    $scope.success = true;
  };

  $scope.failedToLogin = function() {
    $scope.success = false;
  };
});

module.controller('RegisterController', function ($scope, $state, SimpleLogin, $stateParams) {
  $scope.user = {};
  $scope.registerUser = function() {
    SimpleLogin.createAccount($scope.user.email, $scope.user.password)
      .then(function(user) {
        console.log($scope.user.email + ' registered!');

        $state.go('lobby', $stateParams, {
          reload: true
        });
      }, function(err) {
        // Provide real feedback to user
        console.log('Email already taken!');
      });
  };
});
module.controller('LogoutController', function (SimpleLogin, $state, $scope, $stateParams) {
  SimpleLogin.logout();
  console.log('Logged out!');
  $state.go('login', $stateParams, {
    reload: true
  });
});
module.factory('SimpleLogin', ['fbutil', '$timeout', '$window', '$firebaseSimpleLogin', '$rootScope', function (fbutil, $timeout, $window, $firebaseSimpleLogin, $rootScope) {
  var auth = $firebaseSimpleLogin(fbutil.ref2());
  // when there is a change of state, check to see if there is user
  // and assign that user or null
  var statusChange = function() {
    functions.getUser().then(function(user) {
      functions.user = user || null;
    });
  };
  // methods that the controller is using
  var functions = {
    user: null,
    logout: function() {
      // logout function of angularfire
      auth.$logout();
    },
    getUser: function() {
      // getCurrentUser function of angularfire
      return auth.$getCurrentUser();
    },
    login: function(email, password) {
      //login function of angularfire
      var id = auth.$login('password', {
        email: email,
        password: password,
        rememberMe: true
      });
      // id is returned as a promise object (convenient to use for tests)
      return id;
    },
    saveUserEmail: function(email) {
      // Just log the user's email
      // When the user updates the profile later,
      // we can check if email.firstName exists
      // to decide if the user should add their basic info
      // or not. This way, we're not just storing a bunch
      // of null values to begin with.
      var ref = new $window.Firebase('https://scheming-lions.firebaseio.com');
      var usersRef = ref.child('users');
      // var emptyProfileInfo = {
      //   email: {}
      // };
      // emptyProfileInfo
      var userDBEntry = {};
      var regXFilterForPeriod = /\./g;
      // Firebase will not take periods in the key
      var emailWithoutPeriod = email.replace(regXFilterForPeriod, '');
      userDBEntry[emailWithoutPeriod] = {
        'email': email
      };
      usersRef.set(userDBEntry);
    },
    createAccount: function(email, pass) {
      // save email for profile reference
      this. saveUserEmail(email);
      // createUser function of angularfire
      return auth.$createUser(email, pass)
        .then(function() {
          return functions.login(email, pass);
        });
    }
  };
  // listens for a click of login or logout and then checks if user exists
  $rootScope.$on('firebaseSimpleLogin:login', statusChange);
  $rootScope.$on('firebaseSimpleLogin:logout', statusChange);
  statusChange();
  return functions;
}]);
})();


