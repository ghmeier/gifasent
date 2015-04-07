gifCtrl.controller('myListCtrl', function($q, $scope, $rootScope, $window, $state, $ionicModal, $firebase, $ionicPopup, feedItems, $cordovaPush, $ionicPlatform, $filter) {
  $scope.list = $rootScope.list;
  $scope.recentList = $rootScope.recentList;
  $scope.stars = $rootScope.stars;
  safeApply($scope,$rootScope,function(){$scope.userName = $rootScope.userName;});
  $scope.notificationRefs = [];
  $rootScope.currentList = "convo";

  $ionicPlatform.ready(function() {
    $ionicPlatform.onHardwareBackButton(function() {
      if (window.location.hash === "#/conversation") {
        ionic.Platform.exitApp();
      } else if (window.location.hash === "#/newConv" || window.location.hash === "#/newContact") {
        $state.transitionTo("conversation");
      }
    });
    loadFeed($scope, $rootScope, $filter, $window, false);

    var starRef = new Firebase($rootScope.baseUrl + "users/" + $rootScope.userId);
    starRef.on("value", function(star) {
      var data = star.val();
      safeApply($scope, $rootScope, function() {
        $scope.stars = data.stars
      });
      $window.localStorage.setItem('data', JSON.stringify(data));
    });
  });

  $ionicPlatform.on("resume", function() {
    loadFeed($scope, $rootScope, $filter, $window, false);
  });

  $scope.inviteShare = function() {
    if (ionic.Platform.isAndroid()) {
      window.plugins.socialsharing.shareViaSMS("Check out gifasent on http://gifasent.co and start a conversation with me, " + $rootScope.userName + "! http://media.giphy.com/media/veeY9dQbn3t0k/200.gif", null, function(msg) {});
    }
    if (ionic.Platform.isIOS()) {
      window.plugins.socialsharing.shareViaSMS("Check out gifasent on http://gifasent.co and start a conversation with me, " + $rootScope.userName + "! http://media.giphy.com/media/veeY9dQbn3t0k/200.gif", null, function(msg) {});
    }
    if (ionic.Platform.isAndroid()) {
      window.parsePlugin.logAnalytics("invite", 1);
    }
    if (ionic.Platform.isIOS()) {
      var jsarray = ["invite", 1];
      window.parsePlugin.logAnalytics(jsarray);
    }

  };


  $scope.toConversations = function() {
    $state.go("conversation");
  }

  $scope.toAdminConversations = function() {
    $rootScope.currentList = "official";
    $state.go("adminConversation");
  }

  $scope.toProfile = function() {
    $state.go("profile");
  }

  $scope.updateFeed = function() {
    loadFeed($scope, $rootScope, $filter, $window, false);
  }

  $scope.allowRemove = function(item) {
    if (item.admin === "1" || item.name === "gifasent" || item.name.indexOf('just you') > -1) {
      return;
    }
    for (name in $scope.list) {
      $scope.list[name].remove = false;
    }
    item.remove = true;
  };

  $scope.stopRemove = function(item) {
    for (name in $scope.list) {
      $scope.list[name].remove = false;
    }
    item.remove = false;
  }

  $scope.newTask = function() {
    $state.go('newConv');
  };

  $scope.action = function(item) {
    if (item.remove) {
      $scope.removeItem(item);
    } else {
      $rootScope.hide();
      feedItems.setCurFeed(item);
      if (item.notification === "1") {
        item.notification = "0";
        $rootScope.conversationNotification--;
        safeApply($scope, $rootScope, function() {
          $scope.conversationNotification = $rootScope.conversationNotification;
        });
      }
      var notificationRef = new Firebase($rootScope.baseUrl + "groups/" + item.feed + "/users/" + $rootScope.userName);
      notificationRef.set("0");
      $window.location.href = ('#/group');
    }
  }

  $scope.refreshFeeds = function() {
                   safeApply($scope, $rootScope, function() {$rootScope.conversationNotification = false;});
                   safeApply($scope, $rootScope, function() {$rootScope.officialFeedNotification = false;});

    var adminGroupNames = [];
    var adminNames = new Firebase($rootScope.baseUrl + "admin_groups/");
    adminNames.once("value", function(snapshot) {
      var data = snapshot.val();
      for (item in data) {
        adminGroupNames.push(item);
      }
    });


    $scope.recentList = [];
    var recentListNames = [];
    var recent_feeds = new Firebase($rootScope.baseUrl + "recent_feeds/" + $rootScope.userId);
    recent_feeds.once("value", function(snapshot) {
      var data = snapshot.val();
      for (item in data) {
        recent_feeds.child(item).on("value", function(snap) {
          var recentData = snap.val();
          recentListNames.push(recentData);

        });
      }
    });

    var groupRef = new Firebase($rootScope.baseUrl + "user_groups/" + $rootScope.userId);

    groupRef.once("value", function(snapshot) {
      var data = snapshot.val();

      for (item in data) {

        var groupsRef = new Firebase($rootScope.baseUrl + "groups/" + item);
        groupsRef.once("value", function(snap) {
          var feed = {};

          if (snap.val() != null && snap.val() != undefined) {
            //feed.name = snap.val().name.replace($rootScope.userName,"");
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
                feed.name += name;
                if (name < users.length - 1) {
                  feed.name += ",";
                }

              }
            }
            feed.name = snap.val().name.replace($rootScope.userName, "");

            safeApply($scope, $rootScope, function() {
              feed.notification = snap.child("users").val()[$rootScope.userName];
            });
            feed.notificationRef = new Firebase($rootScope.baseUrl + "groups/" + feed.feed + "/users/" + $rootScope.userName);
            feed.notificationRef.once("value", function(snap) {
              feed.notification = snap.val().toString();
            });
            feed.feed = snap.val().feed;
            feed.remove = false;
            $scope.noData = false;
            var exists = false;
            var isAdminGroup = false;
            var isRecent = false;

            for (name in $scope.list) {
              exists = ($scope.list[name]['feed'] === feed.feed) || exists;
            }

            for (var i = 0; i < adminGroupNames.length; i++) {
              isAdminGroup = (adminGroupNames[i] === feed.feed) || isAdminGroup
            }

            for (var i = 0; i < recentListNames.length; i++) {
              isRecent = (recentListNames[i] === feed.name) || isRecent;
            }

            if (isRecent) {
              safeApply($scope, $rootScope, function() {
                $scope.recentList.push(feed);
              });
            }
            if (!exists && !isAdminGroup) {
              safeApply($scope, $rootScope, function() {
                $scope.list.push(feed);
              });
            }
          } else if (snap.val() != null && snap.val() != undefined) {
            groupsRef.set(null);
          }
        });
      }

      if ($rootScope.list === null && (ionic.Platform.isAndroid() || ionic.Platform.isIOS())) {
        window.parsePlugin.initialize('<PARSE_ID>', '<PARSE_API_KEY>', function() {
          window.parsePlugin.getInstallationId(function(id) {

            $rootScope.installationID = id;
            if ($rootScope.pushNotification === 1) {
              for (item in data) {
                window.parsePlugin.subscribe("gifasent_" + item, function() {}, function(e) {
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

      $rootScope.list = $scope.list;
      $rootScope.recentList = $scope.recentList;
      $scope.$broadcast('scroll.refreshComplete');
    });
  }

  $scope.removeItem = function(feed) {

    if (feed.name === "gifasent" || feed.admin === '1') {
      return;
    }
    var confirmPopup = $ionicPopup.confirm({
      title: 'Delete Conversation',
      template: 'Are you sure you want to remove this conversation?'
    });
    confirmPopup.then(function(res) {
      if (res) {
        var authRef = new Firebase($rootScope.baseUrl);
        var userRef = authRef.child("users");
        var userIdRef = authRef.child("usernames");
        var feedsRef = authRef.child("feeds");
        var gifRef = authRef.child("gif");
        var userGroupRef = authRef.child("user_groups");
        var groupsRef = authRef.child("groups");
        userGroupRef.child($rootScope.userId).child(feed.feed).set(null);
        var users = [];
        groupsRef.child(feed.feed).child('users').once("value", function(snapshot) {
          for (item in snapshot.val()) {
            if (item !== $rootScope.userName) {
              users.push(item);
            }
          }

        });
        groupsRef.child(feed.feed).set(null);
        feedsRef.child(feed.feed).once("value", function(snapshot) {
          var gifId = snapshot.val().gif;
          gifRef.child(gifId).set(null);
          feedsRef.child(feed.feed).set(null);
        });


        for (item in users) {
          userIdRef.child(users[item]).once("value", function(snap) {
            userGroupRef.child(snap.val()).child(feed.feed).set(null);
          });
        }

      } else {
        return;
      }
    });
  }

})

gifCtrl.directive('scrollWatch', function($rootScope) {
  return function(scope, elem, attr) {
    var start = 0;
    var threshold = 150;

    elem.bind('scroll', function(e) {
      if (e.detail.scrollTop - start > threshold) {
        $rootScope.tabsSlider = true;
        //$scope.tabSlider = true;
        //alert("true");
        //console.log("true");
      } else {
        $rootScope.tabsSlider = false;
        //$scope.tabSlider = false;
        //alert("false");
        //console.log("false");
      }
      if ($rootScope.slideHeaderPrevious >= e.detail.scrollTop - start) {
        $rootScope.tabsSlider = false;
        //$scope.tabSlider = false;
        //alert("false");
        //console.log("false");
      }
      $rootScope.slideHeaderPrevious = e.detail.scrollTop - start;
      //$rootScope.$apply();
      //$scope.$apply();
      //alert("aplly");
      //console.log("apply");
    });
  };
});