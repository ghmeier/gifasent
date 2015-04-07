var gifCtrl = angular.module('gifasent.controllers', [])

.controller('help', function($scope, $ionicPopover) {
  $ionicPopover.fromTemplateUrl('help.html', {
    scope: $scope,
  }).then(function(popover) {
    $scope.popover = popover;
  });

  $scope.openPopover = function($event) {
    $scope.popover.show($event);
  };
  $scope.closePopover = function() {
    $scope.popover.hide();
  };
  //Cleanup the popover when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.popover.remove();
  });
  // Execute action on hide popover
  $scope.$on('popover.hidden', function() {
    // Execute action
  });
  // Execute action on remove popover
  $scope.$on('popover.removed', function() {
    // Execute action
  });
});

function escapeEmailAddress(email) {
  if (!email) return false
  email = email.toLowerCase();
  email = email.replace(/\./g, '^');
  return email.trim();
}

function loadFeed($scope, $rootScope, $filter, $window, $showAdmin) {

  $rootScope.conversationNotification = 0;
  $rootScope.officialFeedNotification = 0;

  var adminGroupNames = [];
  var adminNames = new Firebase($rootScope.baseUrl + "admin_groups/");
  adminNames.on("value", function(snapshot) {
    var data = snapshot.val();
    for (item in data) {
      adminGroupNames.push(item);
    }
  });

  $scope.recentList = [];
  var recentListNames = [];
  var recent_feeds = new Firebase($rootScope.baseUrl + "recent_feeds/" + $rootScope.userId);
  recent_feeds.on("value", function(snapshot) {
    var data = snapshot.val();
    for (item in data) {
      recent_feeds.child(item).once("value", function(snap) {
        var recentData = snap.val();
        recentListNames.push(recentData);

      });
    }
  });

  var groupRef = new Firebase($rootScope.baseUrl + "user_groups/" + $rootScope.userId);
  $scope.tabSlider = true;
  $rootScope.tabsSlider = $scope.tabSlider;

  groupRef.on("value", function(snapshot) {
    $rootScope.show("Please wait... Processing");
    $scope.list = [];
    var data = snapshot.val();

    for (item in data) {

      var groupsRef = new Firebase($rootScope.baseUrl + "groups/" + item);
      groupsRef.on("value", function(snap) {
        var feed = {};


        if (snap.val() != null && snap.val() != undefined) {
          feed.name = snap.val().name.replace($rootScope.userName, "");
          feed.feed = snap.val().feed;
          feed.admin = snap.val().admin;
          if (feed.admin == null) {
            feed.admin = "0";
          }
          feed.sendname = $rootScope.userName;
          feed.recname = [];
          var users = snap.child("users").val();
          for (name in users) {
            if (name !== $rootScope.userName) {
              feed.recname.push(name);
            }
          }
          safeApply($scope, $rootScope, function() {
            feed.notification = snap.child("users").val()[$rootScope.userName];
          });
          feed.notificationRef = new Firebase($rootScope.baseUrl + "groups/" + feed.feed + "/users/" + $rootScope.userName);
          feed.notificationRef.on("value", function(snap) {
            if (feed.notification !== snap.val().toString()) {
              if (snap.val().toString() === "1") {
                if (feed.admin === "1") {
                  $rootScope.officialFeedNotification++;
                } else {
                  $rootScope.conversationNotification++;
                }
              }
            }

            feed.notification = snap.val().toString();
          });
          feed.feed = snap.val().feed;
          feed.remove = false;
          var exists = false;
          var isAdminGroup = false;
          var isRecent = false;

          for (name in $scope.list) {
            exists = ($scope.list[name]['feed'] === feed.feed) || exists;
          }

          for (var i = 0; i < adminGroupNames.length; i++) {
            isAdminGroup = (adminGroupNames[i] === feed.feed) || isAdminGroup;
          }

          for (var i = 0; i < recentListNames.length; i++) {
            isRecent = (recentListNames[i] === feed.name) || isRecent;
          }

          if (!exists && isAdminGroup) {
            if ($showAdmin) {
              safeApply($scope, $rootScope, function() {
                $scope.list.push(feed);
              });
            }
            if (feed.notification === "1") {
              $rootScope.officialFeedNotification++;
            }
          } else if (!exists && !isAdminGroup) {
            if (!$showAdmin) {
              if (feed.name.indexOf("just you") > -1 && feed.notification === "1") {
                feed.name += " (instructions, click me!)";
              }
              safeApply($scope, $rootScope, function() {
                $scope.list.push(feed);
              });
            }
            if (isRecent) {
              var recExists = false;
              for (id in $scope.recentList) {
                recExists = $scope.recentList[id].name.trim() === feed.name.trim() || recExists;
              }
              if (!recExists) {
                safeApply($scope, $rootScope, function() {
                  $scope.recentList.push(feed);
                });
              }
            }
            if (feed.notification === "1") {
              $rootScope.conversationNotification++;
            }
          } else {
            feed.notificationRef.off();
          }
          safeApply($scope, $rootScope, function() {
            $scope.officialFeedNotification = $rootScope.officialFeedNotification;
          });
          safeApply($scope, $rootScope, function() {
            $scope.conversationNotification = $rootScope.conversationNotification;
          });
        } else if (snap.val() != null && snap.val() != undefined) {
          groupsRef.set(null);
        }
      });
    }
    if ($rootScope.list === null && (ionic.Platform.isAndroid() || ionic.Platform.isIOS())) {
      window.parsePlugin.initialize('5L8wEzmhQoGuwRNgVClwsHmg2IekTTH3l2YuGapM', 'y7q9BblKjZCTmJWp8o7Cs0gfoRVU5rRBdgyLsrCZ', function() {
        window.parsePlugin.getInstallationId(function(id) {
          $rootScope.installationID = id;
          for (item in data) {
            if ($rootScope.pushNotification === 1) {
              window.parsePlugin.subscribe("gifasent_" + item, function() {}, function(e) {
                console.log(e);
                $rootScope.hide();
              });
            } else {
              window.parsePlugin.unsubscribe("gifasent_" + item, function() {}, function(e) {
                console.log(e);
                $rootScope.hide();
              });
            }
          }
        }, function(e) {
          console.log(e);
          $rootScope.hide();
        });
      }, function(e) {
        console.log(e);
        $rootScope.hide();
      });
    }
    if (!$showAdmin) {
      $rootScope.list = $scope.list;
    }
    $rootScope.hide();
  });
}

function loadGifData($scope, $rootScope, feedItems) {
  $scope.feed = feedItems.getCurFeed();
  safeApply($scope, $rootScope, function() {
    $scope.gifs = [];
  });

  var feedListRef = new Firebase($rootScope.baseUrl + "feeds/" + $scope.feed.feed);
  var feedGifList = [];
  feedListRef.once("value", function(snap) {
    $rootScope.show();
    feedGifList = snap.val();
    for (name in feedGifList) {
      var gifRef = new Firebase($rootScope.baseUrl + "gif/");
      var feedGifRef = gifRef.child(feedGifList[name]);
      feedGifRef.once("value", function(snapshot) {
        if (snapshot.val() !== null && snapshot.val() !== undefined) {
          var currentGif = snapshot.val() || {};
          currentGif.id = snapshot.name();
          if (snapshot.val() === null) {
            currentGif.stars = {};
            currentGif.stars[$rootScope.userName] = 0;
            currentGif.starred = false;
          } else {
            currentGif.stars = snapshot.val().stars || {};
            currentGif.starred = currentGif.stars[$rootScope.userName] === 1 || currentGif.stars[$rootScope.userName] === "1";
          }
          currentGif.sender = snapshot.val().sender || 'none';
          currentGif.time = snapshot.val().time || 'none';
          currentGif.surl = currentGif.url.replace(".gif", "_s.gif");
          currentGif.static = $scope.gifs.length > 0;

          var exists = false;

          for (gif in $scope.gifs) {
            exists = ($scope.gifs[gif].id === currentGif.id) || exists;
          }
          if (!exists) {
            safeApply($scope, $rootScope, function() {
              $scope.gifs.push(currentGif);
            });
            var commentRef = gifRef.child(currentGif.id).child("comments");
            commentRef.on("value", function(snapshot) {
              if (snapshot.val()) {
                safeApply($scope, $rootScope, function() {
                  currentGif.comments = snapshot.val();
                });
              } else {
                safeApply($scope, $rootScope, function() {
                  currentGif.comments = []
                });
              }
            });

          }
        }
      });
    }

    var groupRef = new Firebase($rootScope.baseUrl + "groups/" + $scope.feed.feed + "/users/" + $rootScope.userName).transaction(function(snap) {
      return "0";
    });
  });
  var gifId = "";

  //Display icon if other user has seen the message
  var convoFriend = new Firebase($rootScope.baseUrl + "groups/" + $scope.feed.feed + "/users/");
  convoFriend.on("value", function(snap) {
    var users = snap.val();
    for (name in users) {
      if (name !== $rootScope.userName) {
        convoFriend.child(name).on("value", function(snap2) {
          if (snap2.val() === "0") {
            safeApply($scope, $rootScope, function() {
              $scope.showSeen = true;
            });
          } else {
            safeApply($scope, $rootScope, function() {
              $scope.showSeen = false;
            });
          }
        });
      }
    }
  });
}

function safeApply($scope, $root, fn) {
  var phase = $root.$$phase;
  if (phase == '$apply' || phase == '$digest') {
    if (fn && (typeof(fn) === 'function')) {
      fn();
    }
  } else {
    $scope.$apply(fn);
  }
};

function setGif($scope, $rootScope, $window, $ionicScrollDelegate, data, status, headers, config, newGif) {

  var recentListNames = [];
  var numOfRecents = 0;
  recentListNames.push(($scope.feed.name));
  var recent_feeds = new Firebase($rootScope.baseUrl + "recent_feeds/" + $rootScope.userId);
  recent_feeds.on("value", function(snapshot) {
    var data = snapshot.val();

    for (item in data) {
      recent_feeds.child(item).on("value", function(snap) {
        var recentData = snap.val();
        if (recentData != null || recentData !== null) {
          if (recentData != $scope.feed.name || recentData !== $scope.feed.name) {
            recentListNames.push(recentData);
          }
        }
      });
      numOfRecents++;
    }
  });

  for (var i = 0; i < numOfRecents + 1; i++) {
    var recentNum = (i + 1);
    if (i < 5) {
      if (recentListNames[i]) {
        recent_feeds.child(recentNum).set(recentListNames[i]);
      }
    }
  }

  if (data.data['image_original_url'] === null || data.data["image_original_url"] == undefined || data.data["image_original_url"] === '') {
    $rootScope.hide();
    $rootScope.show();
    $scope.getGif();
    return;
  }
  $rootScope.show("Sending");
  newGif.url = data.data['image_original_url'];
  newGif.url = newGif.url.replace("/giphy.gif", "/200.gif");
  newGif.imgWidth = data.data['image_width'];
  newGif.imgHeight = data.data['image_height'];
  newGif.stars = {};
  newGif.stars[$rootScope.userName] = 0;
  newGif.sender = $rootScope.userName;
  newGif.time = getTime();

  if (newGif.message === null) {
    newGif.message = '';
  }

  newGif.gifId = $rootScope.md5_hash + $rootScope.gifNum;
  $rootScope.gifNum++;

  var feedRef = new Firebase($rootScope.baseUrl + "feeds/" + $scope.feed.feed);
  var gifIds = [];
  var toRemove = [];
  var unstarred = 0;
  for (name in $scope.gifs) {
    if ($scope.gifs[name].total_stars !== "0" && $scope.gifs[name].total_stars > 0) {
      gifIds.push($scope.gifs[name].id);
    } else if (unstarred < ($scope.feed.recname.length * 5) - 1 || unstarred < 4) {
      gifIds.push($scope.gifs[name].id);
      unstarred++;
    } else {
      toRemove.push($scope.gifs[name].id);
    }
  }

  gifIds.unshift(newGif.gifId);

  feedRef.transaction(function(val) {
    return gifIds;
  });

  var gifRef = new Firebase($rootScope.baseUrl + "gif/");
  gifRef.child(newGif.gifId).transaction(function(val) {
    return {
      url: newGif.url,
      text: newGif.message,
      total_stars: 0,
      stars: newGif.stars,
      sender: newGif.sender,
      time: newGif.time,
      comments: ""
    };
  });

  var userRef = new Firebase($rootScope.baseUrl + "users/" + $rootScope.userId);
  userRef.update({
    gifs_sent: $rootScope.gifNum,
    groups_created: $rootScope.groupNum
  });
  userRef.once("value", function(snapshot) {
    data = snapshot.val();
    $window.localStorage.setItem('data', JSON.stringify(data));
  });
  var groupsRef = new Firebase($rootScope.baseUrl + "groups/" + $scope.feed.feed + "/users/");

  groupsRef.once("value", function(snap) {
    var users = snap.val();
    for (name in users) {
      if (name !== $rootScope.userName) {
        groupsRef.child(name).set("1");
      } else {
        groupsRef.child(name).set("0");
      }
    }

    for (id in toRemove) {
      gifRef.child(toRemove[id]).transaction(function(val) {
        return null;
      });
    }

    safeApply($scope, $rootScope, function() {
      $scope.gif.message = '';
      $scope.gif.text = "";
    });


    $ionicScrollDelegate.scrollTop();
    if (ionic.Platform.isAndroid() && $scope.feed['feed'].indexOf($rootScope.userName) < 0) {
      window.parsePlugin.pushOnChannel("gifasent_" + $scope.feed['feed'], $rootScope.userName + " gifed you!", function() {
        window.parsePlugin.logAnalytics("send", "1");
      }, function(e) {
        console.log(e);
      });
    }

    if (ionic.Platform.isIOS()) {
      var newarray = ["gifasent_" + $scope.feed['feed'], $rootScope.userName + " gifed you!"];
      var jsarraytwo = ["send", String(1)];
      window.parsePlugin.logAnalytics(jsarraytwo);

      window.parsePlugin.pushOnChannel(newarray, function() {}, function(e) {
        console.log(e);
      });
    }

  });
};

function getTime(){

  var time = new Date().toLocaleTimeString();
  var timeArray = (time).split(" ");
  var exactTimeArray = timeArray[0].split(":");
  time = exactTimeArray[0] + ":" + exactTimeArray[1] + " " + timeArray[1];
  return time;
}