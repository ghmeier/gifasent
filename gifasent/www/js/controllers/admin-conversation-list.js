gifCtrl.controller('myAdminListCtrl', function($q, $scope, $rootScope, $window, $state, $ionicModal, $firebase, $ionicPopup, feedItems, $cordovaPush, $ionicPlatform, $filter) {
  $scope.list = $rootScope.list;
  $scope.stars = $rootScope.stars;
  $scope.userName = $rootScope.userName;
  $scope.noData = $rootScope.noData;
  $scope.feedLoaded = $rootScope.feedLoaded;
  $scope.notificationRefs = [];
  $rootScope.currentList = "official";

  $ionicPlatform.ready(function() {
    loadFeed($scope, $rootScope, $filter, $window, true);
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
    loadFeed($scope, $rootScope, $filter, $window, true);
  });


  $scope.toConversations = function() {
    $rootScope.currentList = "convo";
    $state.transitionTo("conversation");
  }

  $scope.toAdminConversations = function() {
    $state.transitionTo("adminConversation");
  }

  $scope.toProfile = function() {
    $state.transitionTo("profile");
  }

  $scope.updateFeed = function() {
    loadFeed($scope, $rootScope, $filter, $window, true);
  }

  $scope.allowRemove = function(item) {
    if (item.admin === "1" || item.name === "gifasent" || item.name === 'just you') {
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
    $window.location.href = ('#/newConv'); //newTemplate.show();
  };

  $scope.action = function(item) {
    if (item.remove) {
      $scope.removeItem(item);
    } else {
      $rootScope.hide();
      feedItems.setCurFeed(item);

      if (item.notification === "1") {
        item.notification = 0;
        $rootScope.officialFeedNotification--;
        safeApply($scope, $rootScope, function() {
          $scope.officialFeedNotification = $rootScope.officialFeedNotification;
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

    var groupRef = new Firebase($rootScope.baseUrl + "user_groups/" + $rootScope.userId);

    groupRef.once("value", function(snapshot) {
      var data = snapshot.val();

      for (item in data) {

        var groupsRef = new Firebase($rootScope.baseUrl + "groups/" + item);
        groupsRef.once("value", function(snap) {
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
            feed.notificationRef.once("value", function(snap) {
              feed.notification = snap.val().toString();
            });
            feed.feed = snap.val().feed;
            feed.remove = false;
            $scope.noData = false;
            var exists = false;
            var isAdminGroup = false;

            for (name in $scope.list) {
              exists = ($scope.list[name]['feed'] === feed.feed) || exists;
            }

            for (var i = 0; i < adminGroupNames.length; i++) {
              isAdminGroup = (adminGroupNames[i] === feed.feed) || isAdminGroup
            }

            if (!exists && isAdminGroup) {
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
            for (item in data) {
              window.parsePlugin.subscribe("gifasent_" + item, function() {}, function(e) {
                console.log(e);
                $rootScope.hide();
              });
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
      $scope.$broadcast('scroll.refreshComplete');
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