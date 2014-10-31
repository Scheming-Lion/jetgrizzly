'use strict';

/**
 * @ngdoc function
 * @name jetgrizzlyApp.controller:VideoQueueController
 * @description
 * # VideoQueueController
 * Controller of the jetgrizzlyApp
 */
(function(){
angular.module('jetgrizzlyApp')
  .controller('VideoQueueController', ['$rootScope', '$scope', 'userPresence', '$window', 'config', '$firebase', function ($rootScope, $scope, userPresence, $window, config, $firebase) {
    // declare variables
    $scope.totalUsers = 0;
    var currentRoom = $scope.$parent.room;

    var currentRoom = $scope.$parent.currentRoom;
    
    var queueRef = new $window.Firebase(config.firebase.url+'/rooms/'+currentRoom+'/queue/');

    var sync = $firebase(queueRef);
    $scope.queue = sync.$asArray();

    var currentVideoRef = new $window.Firebase(config.firebase.url+'/youTube/');
    var syncCurrentVideo = $firebase(currentVideoRef);
    $scope.currentVideo = syncCurrentVideo.$asObject();

    // listen for new users to lobby (emitted from UserPresenceFactory)
    $scope.$on('onOnlineUser', function() {
      $scope.$apply(function() {
        $scope.totalUsers = userPresence.getOnlineUserCount();
      });
    });

    $scope.addToQueue = function(item) {
      var item = { item: item, voteCount: 0 };
      $scope.queue.$add(item).then(function(){
        $scope.item = '';
        $scope.queueForm.$setPristine();
      });
    };

    $scope.upvote = function(index){
      var tempCount = $scope.queue[index].voteCount;
      ++tempCount;
      $scope.queue[index].voteCount = tempCount;
      $scope.queue.$save(index);
    };

    $scope.downVote = function(index){
      var tempCount = $scope.queue[index].voteCount;
      --tempCount;
      $scope.queue[index].voteCount = tempCount;
      $scope.queue.$save(index);
      });
    };

  }]);

})();
