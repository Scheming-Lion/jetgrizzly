'use strict';
/*jshint -W079 */
/**
 * @ngdoc overview
 * @name jetgrizzlyApp
 * @description
 * # jetgrizzlyApp
 *
 * Main module of the application.
 */

angular.module('jetgrizzlyApp', [
  'jetgrizzlyApp.Auth',
  'jetgrizzlyApp.chat',
  'jetgrizzlyApp.Account',
  'jetgrizzlyApp.Room',
  'ui.router',
  'ui.bootstrap',
  'firebase'
])
  .config(function($stateProvider,$urlRouterProvider){
  $urlRouterProvider.otherwise('/');
  $stateProvider.state('app',{
    abstract:true,
    templateUrl:'app/views/main.html',
    resolve: {
      user : function(SimpleLogin){
        return SimpleLogin.getUser();
      }
    },
    controller:function($scope,user, SimpleLogin, $firebase, $window, config){
      $scope.user = user;
      // var roomsRef = new $window.Firebase(config.firebase.url+'/rooms/');
      // var sync = $firebase(roomsRef);
      // $scope.rooms = sync.$asObject();
    }
  });
})
.factory('config',function(){
  return {
    firebase:{url:'https://room-test.firebaseio.com'}
  };
});
