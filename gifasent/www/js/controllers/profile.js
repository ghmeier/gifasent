gifCtrl.controller('profileCtrl', function($q, $scope, $rootScope, $window, $state, $ionicModal, $firebase, $ionicPopup, feedItems, $cordovaPush, $ionicPlatform, $filter,$ionicHistory) {

  $scope.stars = $rootScope.stars;
  $scope.totalGifs = $rootScope.totalGifs;
  $scope.score = $rootScope.score;
  $scope.groupsCreated = $rootScope.groupsCreated;
  $scope.pushNotification = {};
  $scope.loadDone = false;

  $scope.pushNotificationsChanged = function() {

    var pushNot = new Firebase($rootScope.baseUrl + "users/" + $rootScope.userId + "/pushNotification");

    if (!$scope.pushNotification.checked) {
      $rootScope.pushNotification = 0;
      pushNot.transaction(function() {
        return $rootScope.pushNotification;
      });
    } else {
      $rootScope.pushNotification = 1;
      pushNot.transaction(function() {
        return $rootScope.pushNotification;
      });
    }
    $rootScope.list = [];
    var userData = new Firebase($rootScope.baseUrl + "users/" + $rootScope.userId);
    userData.once("value", function(snap) {
      var data = snap.val();
      data.pushNotification = $rootScope.pushNotification;
      $window.localStorage.setItem('data', JSON.stringify(data));
    });

    if ($rootScope.list != null && (ionic.Platform.isAndroid() || ionic.Platform.isIOS())) {
      var data = $rootScope.list;
      window.parsePlugin.initialize('<PARSE_ID>', '<PARSE_API_KEY>', function() {
        window.parsePlugin.getInstallationId(function(id) {
          $rootScope.installationID = id;
          for (id in data) {
            var item = data[id].feed;
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

  };

  $scope.toConversations = function() {
    if ($rootScope.currentList == "convo" || $rootScope.currentList === "convo") {
      $state.transitionTo("conversation");
    } else {
      $state.transitionTo("adminConversation");
    }
  }

  $scope.logout = function() {
    $rootScope.userEmail = null;
    $rootScope.userName = "";
    $rootScope.userId = null;
    $window.localStorage.setItem('user', null);
    $window.localStorage.setItem('password', null);
    $window.localStorage.setItem('userId', null);
    $window.localStorage.setItem('data', null);
    $window.localStorage.setItem('email', null);
    $ionicHistory.clearCache();

    $state.transitionTo("signin");
  }

  $scope.changePassword = function() {
    $state.transitionTo("changePassword");
  }


  $ionicPlatform.ready(function() {
    $ionicPlatform.onHardwareBackButton(function() {
      if (window.location.hash === "#/conversation") {
        ionic.Platform.exitApp();
      }
    });

    //$window.localStorage.setItem('data',JSON.stringify(totalGifsSent));
    var starRef = new Firebase($rootScope.baseUrl + "users/" + $rootScope.userId);
    starRef.on("value", function(star) {
      var data = star.val();
      if (data.stars == null) data.stars = 0;
      safeApply($scope, $rootScope, function() {
        $scope.stars = data.stars
      });
      $window.localStorage.setItem('data', JSON.stringify(data));

      safeApply($scope, $rootScope, function() {
        $scope.totalGifs = data.gifs_sent
      });
      var score = ((data.stars) * 51) + ((data.gifs_sent) * 3);
      safeApply($scope, $rootScope, function() {
        $scope.score = score
      });
      safeApply($scope, $rootScope, function() {
        $scope.groupsCreated = data.groups_created
      });
      safeApply($scope, $rootScope, function() {
        $scope.pushNotification.checked = data['pushNotification'] === 1;
      });
      if (!$scope.loadDone) {
        $scope.loadDone = true;
      }

    });
  });

});