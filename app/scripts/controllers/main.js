'use strict';

/**
 * @ngdoc function
 * @name jetgrizzlyApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the jetgrizzlyApp
 */
// angular.module('jetgrizzlyApp')
//   .controller('MainCtrl', function ($scope) {
//     $scope.awesomeThings = [
//       'HTML5 Boilerplate',
//       'AngularJS',
//       'Karma'
//     ];
//   });

angular.module('jetgrizzlyApp')
  .controller('VideoQueueController', ['$scope', 'UserPresenceFactory', function ($scope, UserPresenceFactory) {
    //Declare variables
    $scope.totalUsers = 0;
    $scope.userQueue = [];
    $scope.myQueue = [];

    //Listen for new users to lobby (emitted from UserPresenceFactory)
    $scope.$on('onOnlineUser', function() {
      $scope.$apply(function() {
        $scope.totalUsers = UserPresenceFactory.getOnlineUserCount();
        $scope.userQueue = UserPresenceFactory.getUserQueue();
      });
    });

    $scope.addToQueue = function(item) {
      $scope.myQueue.push(item);
    };
  }])
  .factory('UserPresenceFactory', ['$rootScope', function($rootScope) {
    var onlineUsers = 0;
    var userQueue = {};

    //Create firebase references
    var listRef = new window.Firebase('https://blistering-heat-6745.firebaseio.com/presence/');
    var userRef = listRef.push(); 
    var presenceRef = new window.Firebase('https://blistering-heat-6745.firebaseio.com/.info/connected');

    //Add ourselves to the presence list when online
    presenceRef.on('value', function(snapshot) {
      if (snapshot.val()) {
        userRef.set({
          online: true,
          queue: [1,2,3]
        });
        // Remove ourselves when we disconnect.
        userRef.onDisconnect().remove();
      } 
    });

    // Get the user count and notify the application
    listRef.on('value', function(snapshot) {
      console.log(snapshot.val());
      onlineUsers = snapshot.numChildren();
      userQueue = snapshot.val();
      $rootScope.$broadcast('onOnlineUser');
    });

    var getOnlineUserCount = function() {
      return onlineUsers;
    };

    var getUserQueue = function() {
      var result = [];
      for (var user in userQueue) {
        result.push([user, userQueue[user]]);
      }
      return result;
    };

    return {
      getOnlineUserCount: getOnlineUserCount,
      getUserQueue: getUserQueue
    };
  }]);