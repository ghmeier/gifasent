gifCtrl.controller('groupFeedCtrl', function($scope, $rootScope, $window, $ionicModal, $firebase, feedItems, $ionicPopup, $state, $http, $ionicPlatform, $ionicScrollDelegate, $ionicNavBarDelegate) {
  $scope.username = $rootScope.userName;
  $scope.gif = {};
  $scope.number = 2;
  $scope.data = {
    item: ""
  };
  $scope.gif.message = "";

  $ionicModal.fromTemplateUrl('./templates/comments.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.openModal = function(gif) {
    $scope.selectGif = gif;
    $scope.modal.show();
  };

  $scope.send = function() {
    if($scope.data.item != "" || $scope.data.item !== "") {
        if (!$scope.selectGif.comments) {
            $scope.selectGif.comments = [];
        }

        var commentTime = getTime();

        safeApply($scope, $rootScope, function() {
           $scope.selectGif.comments.push({
               message: $scope.data.item,
               sender: $scope.username,
               time: commentTime
            });
         });

         var commentRef = new Firebase($rootScope.baseUrl + "gif/" + $scope.selectGif.id + "/comments");
         var send = [];
         for (id in $scope.selectGif.comments) {
            var cur = $scope.selectGif.comments[id];
            send.push({
               message: cur.message,
               sender: cur.sender,
               time: cur.time
            });
         }
         commentRef.transaction(function() {
             return send;
         });

        safeApply($scope,$rootScope,function(){$scope.data.item = '';});

        if (ionic.Platform.isAndroid() && $scope.feed['feed'].indexOf($rootScope.userName) < 0) {
          window.parsePlugin.logAnalytics("comment", "1");
          if (feed['admin'] !== '1') {
             window.parsePlugin.pushOnChannel("gifasent_" + $scope.feed['feed'], $rootScope.userName + " commented!", function() {}, function(e) {
                console.log(e);
             });
           }
         }

         if (ionic.Platform.isIOS()) {
            var newarray = ["gifasent_" + $scope.feed['feed'], $rootScope.userName + " commented!"];
            var jsarray = ["comment", "1"];
            window.parsePlugin.logAnalytics(jsarray);
            if (feed['admin'] !== '1') {
                window.parsePlugin.pushOnChannel(newarray, function() {}, function(e) {
                   console.log(e);
                });
            }
         }

      }
  };

  $scope.refreshComments = function(gif) {
    $scope.selectGif = gif;
    $scope.$broadcast('scroll.infiniteScrollComplete');
  };

  $scope.closeModal = function() {
    $scope.modal.hide();
  };

  $scope.loadGif = function() {
    loadGifData($scope, $rootScope, feedItems);
  };

  $scope.loadMore = function() {
    safeApply($scope,$rootScope,function(){$scope.number += 2;});

    $scope.$broadcast('scroll.infiniteScrollComplete');
  };

  $scope.loadGif();
  $scope.feedRef = new Firebase($rootScope.baseUrl + "feeds/" + $scope.feed.feed);
  $ionicPlatform.ready(function() {
    $scope.feedRef.on("value", function() {
      $scope.loadGif();
    });
  });

  $scope.star = function(gif) {
    if (gif.stars[$rootScope.userName] !== 1) {
      gif.total_stars++;
      safeApply($scope, $rootScope, function() {
        gif.stars[$rootScope.userName] = 1;
      });
      var gifRef = new Firebase($rootScope.baseUrl + "gif/" + gif.id);
      delete gif.$$hashKey;
      gifRef.set(gif);

      if (ionic.Platform.isAndroid()) {
        window.parsePlugin.logAnalytics("star", "1");
      }
      if (ionic.Platform.isIOS()) {
        var jsarray = ["star", "1"];
        window.parsePlugin.logAnalytics(jsarray);
      }

      if (gif.id.indexOf($rootScope.md5_hash) < 0) {
        var groupRef = new Firebase($rootScope.baseUrl + "groups/" + $scope.feed.feed + "/users");
        groupRef.once("value", function(snap) {
          for (name in snap.val()) {
            if (name !== $rootScope.userName) {
              var userRef = new Firebase($rootScope.baseUrl + "usernames/" + name);
              userRef.once("value", function(id) {
                var userId = id.val();
                var userDateRef = new Firebase($rootScope.baseUrl + "users/" + userId + "/stars");

                userDateRef.once('value', function(stars) {
                  userDateRef.set(stars.val() + 1);
                });
              });
            }
          }
        });
      }
    }
  }

  $scope.goBack = function() {
    $scope.feedRef.off();
    if ($rootScope.currentList == "convo" || $rootScope.currentList === "convo") {
      $state.transitionTo("conversation");
    } else {
      $state.transitionTo("adminConversation");
    }
  };

  $scope.unstar = function(gif) {
    if (gif.total_stars > 0 && gif.stars[$rootScope.userName] !== 0) {
      gif.total_stars--;
      safeApply($scope, $rootScope, function() {
        gif.stars[$rootScope.userName] = 0;
      });
      var gifRef = new Firebase($rootScope.baseUrl + "gif/" + gif.id);
      delete gif.$$hashKey;
      gifRef.set(gif);

      if (gif.id.indexOf($rootScope.md5_hash) < 0) {
        var groupRef = new Firebase($rootScope.baseUrl + "groups/" + $scope.feed.feed + "/users");
        groupRef.once("value", function(snap) {
          for (name in snap.val()) {
            if (name !== $rootScope.userName) {
              var userRef = new Firebase($rootScope.baseUrl + "usernames/" + name);
              userRef.once("value", function(id) {
                var userId = id.val();
                var userDateRef = new Firebase($rootScope.baseUrl + "users/" + userId + "/stars");

                userDateRef.once('value', function(stars) {
                  if (stars.val() > 0) {
                    userDateRef.set(stars.val() - 1);
                  }
                });
              });
            }
          }
        });
      }
    }
  }

  $scope.toggleStar = function(gif) {
    if (gif.total_stars > 0 && gif.stars[$rootScope.userName] === 1) {
      $scope.unstar(gif);
      gif.starred = false;
    } else {
      $scope.star(gif);
      gif.starred = true;
    }
  };

  $scope.toggleGif = function(gif) {
    if (gif.static) {
      gif.static = false;
    } else {
      gif.static = true;
    }
  }

  $scope.getGif = function() {
    if ($scope.feed['admin'] === '1') {
      return;
    }
    $rootScope.show();
    if ($scope.feed['name'] !== 'gifasent') {
      var newGif = {};
      newGif.message = $scope.gif.message;
      var ttttmessage = newGif.message;
      var regexp = new RegExp('#([^\\s]*)', 'g');
      newGif.message = ttttmessage.replace(regexp, '');
      $scope.gif.message = newGif.message;
      var hashSearch = "";
      if (ttttmessage.indexOf("#") !== -1) {
        var messageSplit = ttttmessage.split("#");
        newGif.message = messageSplit[0];
        if(messageSplit[1] != "" || messageSplit[1] != null) {
          if(messageSplit[1].indexOf(' ') < 0) {
            hashSearch = messageSplit[1];
          } else {
            var hashSplit = messageSplit[1].split(" ");
            for (i = 0; i < hashSplit.length; i++) {
                if(hashSplit[i] != "" && hashSplit[i] != null) {
                   if(i == 0) {
                        hashSearch += hashSplit[i];
                   } else {
                        hashSearch += "+" + hashSplit[i];
                   }
                   }
            }
          }
        }
      }

      $http.get("http://api.giphy.com/v1/gifs/random?tag="+hashSearch+"&api_key=<GIPHY_API_KEY>").
      success(function(data,staus,headers,config){
        setGif($scope,$rootScope,$window,$ionicScrollDelegate,data,status,headers,config,newGif);
      }).
      error(function(data, status, headers, config) {
        $scope.getGif();

      });
    }
  };

  $scope.notGifasent = function(name) {
    return name !== 'gifasent' && name !== 'just you';
  }

  $scope.share = function(item) {

    if (ionic.Platform.isAndroid()) {
      window.plugins.socialsharing.share("This just #gifed on gifasent: '" + item.text + "'", "Seen on @gifasent", null, item.url);
    }
    if (ionic.Platform.isIOS()) {
      window.plugins.socialsharing.share("This just #gifed on gifasent: '" + item.text + "'", "Seen on @gifasent", null, item.url);
    }
    if (ionic.Platform.isAndroid()) {
      window.parsePlugin.logAnalytics("share", "1");
    }
    if (ionic.Platform.isIOS()) {
      var jsarray = ["share", "1"];
      window.parsePlugin.logAnalytics(jsarray);
    }

  }

})