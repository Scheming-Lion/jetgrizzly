var Firebase = require("firebase");
var http = require('http');
var youtubeData = 'http://gdata.youtube.com/feeds/api/videos/';
var youtubeQueryParams = '?v=2&alt=jsonc';

var config = {firebase:{url:'https://room-test.firebaseio.com'}};
var queueRef; //= new Firebase(config.firebase.url+'/queue/');
var videoRef; //= new Firebase(config.firebase.url+'/youTube/');

var getVideoData = function(video,cb){
  http.get(youtubeData + video + youtubeQueryParams,function(res){
    var ret = '';
    res.on('data', function(chunk) {
      console.log("Received body data:");
      ret += chunk.toString();
    });

    res.on('end', function() {
      console.log('ended receiving data!');
      console.log(ret);
      cb(JSON.parse(ret));
    });
  });
};

var stopped = true;
var roomID;

// LOOK HERE!!!!
var handleNextQueueItem = function(queueSnapshot){
  console.log('The value of the queue is');
  var queue = queueSnapshot.val();
  console.log(queue);
  if(queue === null){
    videoRef.set({currentVideo:'',startTime:Date.now(),isPlaying:false},function(){
      console.log('Set the current video to nothingness');
      // wait for next item in queue to continue looping.
      stopped = true;
    });
  }else{
    console.log('OK there is a video in the queue so lets use it.');
    var nextID = queueSnapshot.val().split('v=')[1];
    var nextName = queueSnapshot.name();
    videoRef.set({currentVideo:nextID,isPlaying:true,startTime:Date.now()},function(){
      var remove = new Firebase(config.firebase.url+'/rooms/'+roomID+'/queue/'+nextName);
      remove.remove(function(){
        console.log('removed top vid from queue');
        // wait for this to end to finish looping.
        stopped = false;
        module.exports.checkCurrentVideo();
      });
    });
  }
};

module.exports.updateQueueWatcher = function(id) {
  roomID = id;

  queueRef = new Firebase(config.firebase.url+'/rooms/'+id+'/queue/');
  videoRef = new Firebase(config.firebase.url+'/rooms/'+id+'/youTube/');
  
  // to handle case of empty queue and stopped player, listen for added children to queue
  queueRef.on('child_added', function(snap) {
    console.log('Child added',stopped);
    if(stopped){
      module.exports.checkCurrentVideo();
    }
  });
};

// checks to see if current video must be removed (finished playing)
module.exports.checkCurrentVideo = function(){

  console.log('videoRef: ' + videoRef);

  videoRef.once('value', function (snapshot) {

    // get the current video with its starting time
    var currentVideo = snapshot.val();

    // if there is no video currently playing, we don't do anything
    if (currentVideo !== null) {
      if(currentVideo.currentVideo === ""){
        console.log('Video is nothing now');
        queueRef.startAt().limit(1).once('child_added',handleNextQueueItem);
        return;
      }

      // get the video data
      getVideoData(currentVideo.currentVideo,function(res){
        var endTime = currentVideo.startTime+res.data.duration*1000;
        var remaining = endTime - Date.now();

        console.log('remaning: ' + remaining);

        if(remaining < 0){
          // handle the next item on the queue if any
          queueRef.startAt().limit(1).once('child_added',handleNextQueueItem);
        } else {
          // this video is fine. Wait and check again once the remaining time is done
          stopped = false;
          setTimeout(module.exports.checkCurrentVideo,remaining);
        }
      });
    }
  }, function (errorObject) {
    console.log('The read failed: ' + errorObject.code);
  });

};

// this is a function that calls itself to check for video status
// module.exports.checkCurrentVideo();