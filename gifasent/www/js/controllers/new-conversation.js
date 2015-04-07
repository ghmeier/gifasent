gifCtrl.controller('newCtrl', function($rootScope, $scope, $state, $window, $ionicPopup, $firebase, $ionicPlatform, $ionicNavBarDelegate, $filter) {

  $scope.finalIndex = 0;
  $scope.feeds = [];
  safeApply($scope, $rootScope, function() {
    $scope.feeds = $rootScope.list;
  });
  if (!$rootScope.list || $rootScope.list.length <= 0) {
    loadFeed($scope, $rootScope, $filter, $window, false);
  }

  $scope.getUser = function() {
    exists = true;

    if (!$scope.prepareTemp()) {
      return;
    }

    var name = this.data.item;
    if ($scope.convExists(name.toLowerCase())) {
      $rootScope.hide();
      $ionicPopup.alert({
        title: "Could not create",
        template: "You already have a conversation with " + name
      });
      return;
    }

    var firebaseRef = new Firebase($rootScope.baseUrl + "usernames/");
    firebaseRef.child(this.data.item.toLowerCase()).once('value', function(snap) {
      exists = snap.val() !== null;

      if (exists) {
        safeApply($scope, $rootScope, function() {
          $scope.tempFeed.rec.push(name.toLowerCase());
        });
        name = "";
      } else {
        $rootScope.hide();
        $ionicPopup.alert({
          title: "Could not create",
          template: name + " is not a gifasent user"
        });
        return;
      }
    })
    this.data.item = "";
  }

  $scope.prepareTemp = function() {
    if (!$scope.tempFeed) {
      $scope.tempFeed = {};
      $scope.tempFeed.name = "";
      $scope.tempFeed.rec = [];
      return true;
    }

    if ($scope.tempFeed.rec.length >= 4) {
      $rootScope.hide();
      $ionicPopup.alert({
        title: "Conversation Limit",
        template: "If four's a crowd, what's five? Sorry you've reached the max number of users in a conversation."
      });
      return false;
    }

    return true;

  }

  $scope.convExists = function(name) {
    if (name === "") {
      return true;
    }

    for (feedId in $scope.feeds) {
      var feed = $scope.feeds[feedId];
      if (feed && feed.recname && feed.recname.length < 2) {
        for (id in feed.recname) {
          if (feed.recname[id] === name) {
            $scope.tempFeed.existing = true;
            safeApply($scope, $rootScope, function() {
              $scope.feeds.splice(feedId, 1);
            });
            return false;
          }
        }
      }
    }
    var feed = $scope.tempFeed;
    if (feed && feed.rec) {
      for (id in feed.rec) {
        if (feed.rec[id] === name) {
          return true;
        }
      }
    }

    $scope.tempFeed.existing = false;
    return false;
  }

  $scope.addRandom = function() {
    if (!$scope.prepareTemp()) {
      return;
    }

    var firebaseRef = new Firebase($rootScope.baseUrl + "usernames/");
    var name = "";
    firebaseRef.once("value", function(snap) {
      var names = Object.keys(snap.val());
      while (name === "" || $scope.convExists(name)) {

        var num = Math.floor((Math.random() * names.length));
        name = names[num];

      }
      safeApply($scope, $rootScope, function() {
        $scope.tempFeed.rec.push(name.toLowerCase());
      });
    });

  };

  $scope.addUser = function(feed) {
    if (!$scope.prepareTemp()) {
      return;
    }

    var index = $scope.feeds.indexOf(feed);
    if ($scope.tempFeed.rec.indexOf(feed.recname[0]) != -1) {
      return;
    }
    //safeApply($scope,$rootScope,function(){$scope.feeds.splice(index,1);});
    $scope.tempFeed.rec.push(feed.recname[0]);
    $scope.tempFeed.existing = true;
  };

  $scope.removeUser = function(name) {

    var index = $scope.tempFeed.rec.indexOf(name);
    safeApply($scope, $rootScope, function() {
      $scope.tempFeed.rec.splice(index, 1);
    });
    //safeApply($scope,$rootScope,function(){$scope.feeds.push(feed);});

    for (id in $scope.tempFeed.rec) {
      var name = $scope.tempFeed.rec[id];
      $scope.convExists(name);
    }
  }

  $scope.toNewConv = function() {

  }

  $scope.toNewContact = function() {
    $state.transitionTo("newContact");
  }

  $scope.goBack = function() {
    if ($rootScope.currentList == "convo" || $rootScope.currentList === "convo") {
      $state.transitionTo("conversation");
    } else {
      $state.transitionTo("adminConversation");
    }
  }

  $scope.data = {
    item: ""
  };

  $scope.close = function() {
    $ionicNavBarDelegate.back();
  };

  $scope.start = function() {

    if ($scope.tempFeed.rec.length < 2) {
      if ($scope.tempFeed.existing) {
        $rootScope.hide();
        $ionicPopup.alert({
          title: "Could not create",
          template: "You already have a conversation with " + $scope.tempFeed.rec[0] + "."
        });
        //alert("You already have a conversation with " + item);
        return;
      }
    }

    var groupId = $rootScope.md5_hash + $rootScope.groupNum;
    var gifId = $rootScope.md5_hash + $rootScope.gifNum;
    var addedId = null;
    var authRef = new Firebase($rootScope.baseUrl);
    var userRef = authRef.child("users");
    var userIdRef = authRef.child("usernames");
    var feedRef = authRef.child("feeds");
    var gifRef = authRef.child("gif");
    var userGroupRef = authRef.child("user_groups");
    var groupsRef = authRef.child("groups");

    var addIds = [];
    var name = $rootScope.userName + " ";
    for (i in $scope.tempFeed.rec) {
      name += $scope.tempFeed.rec[i] + " ";
    }
    userGroupRef.child($rootScope.userId).child(groupId).transaction(function(val) {
      return groupId;
    });
    groupsRef.child(groupId).transaction(function(val) {
      return {
        feed: groupId,
        name: name
      };
    });
    groupsRef.child(groupId).child("users").child($rootScope.userName).transaction(function(val) {
      return 1;
    });
    feedRef.child(groupId).child("0").transaction(function(val) {
      return gifId;
    });
    gifRef.child(gifId).transaction(function(val) {
      return {
        text: "Hey...",
        total_stars: 0,
        url: "http://media3.giphy.com/media/VdIOjSRaMYxdS/200.gif",
        sender: $rootScope.userName,
        time: new Date().toLocaleTimeString()
      };
    });
    $rootScope.gifNum++;
    $rootScope.groupNum++;
    userRef.child($rootScope.userId).update({
      gifs_sent: $rootScope.gifNum,
      groups_created: $rootScope.groupNum
    });

    for (i in $scope.tempFeed.rec) {
      groupsRef.child(groupId).child("users").child($scope.tempFeed.rec[i]).transaction(function(val) {
        return 1;
      });
      userIdRef.child($scope.tempFeed.rec[i]).once("value", function(snapshot) {
        addIds.push(snapshot.val());
        userGroupRef.child(snapshot.val()).child(groupId).transaction(function(val) {
          return groupId;
        });

      });
    }

    $scope.tempFeed = null;
    window.parsePlugin.initialize('<PARSE_ID>', '<PARSE_API_KEY>',, function() {
      window.parsePlugin.getInstallationId(function(id) {
        $rootScope.installationID = id;
        window.parsePlugin.subscribe("gifasent_" + groupId, function() {
          if (ionic.Platform.isAndroid()) {
            window.parsePlugin.logAnalytics("newConversation", new Date().getHours());
          }
          if (ionic.Platform.isIOS()) {
            var jsarray = ["newConversation", new Date().getHours()];
            window.parsePlugin.logAnalytics(jsarray);
          }
        }, function(e) {
          console.log(e);
        });
      }, function(e) {
        console.log(e);
      });
    }, function(e) {
      console.log(e);
    });
  };

})