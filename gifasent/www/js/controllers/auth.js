gifCtrl.controller('authCtrl', function($rootScope, $scope, $window, $state, $ionicPopup, $firebaseAuth, $timeout, $ionicPlatform) {

  $ionicPlatform.ready(function() {
    var email = $window.localStorage['email'];
    var password = $window.localStorage['password'];
    var userId = $window.localStorage['userId'];
    var rawData = $window.localStorage['data'];

    if ($window.localStorage['data'] == null) {
      var authRef = new Firebase($rootScope.baseUrl);
      var auth = $firebaseAuth(authRef);

      auth.$login('password', {
          email: email,
          password: password
        })
        .then(function(user) {
          $rootScope.userEmail = user.email;
          $rootScope.userId = user.id;
          var userRef = new Firebase($rootScope.baseUrl + "users/" + $rootScope.userId);
          userRef.once("value", function(snapshot) {
            data = snapshot.val();
            $rootScope.userName = data.username;
            $rootScope.gifNum = data['gifs_sent'];
            $rootScope.groupNum = data['groups_created'];
            $rootScope.md5_hash = data.md5_hash;
            $rootScope.pushNotification = data.pushNotification || 1;
            $rootScope.stars = data.stars || 0;
            var firebaseRef = new Firebase($rootScope.baseUrl);
            var userGroupRef = firebaseRef.child("user_groups").child($rootScope.userId);
            var userNameRef = firebaseRef.child("usernames").child($rootScope.userName);
            var gifgroupsRef = firebaseRef.child("groups");

            $window.localStorage.setItem('user', user.email);
            $window.localStorage.setItem('password', password);
            $window.localStorage.setItem('userId', $rootScope.userId);
            $window.localStorage.setItem('data', JSON.stringify(data));

            $scope.getFeedThenTransition();

          });


        }, function(error) {
          $state.go("signup");
        });

    } else {
      $rootScope.userEmail = email;
      $rootScope.userId = userId;

      var data = JSON.parse($window.localStorage['data']);
      if (!data) {
        $state.go("signup");
      }
      $rootScope.userName = data['username'];
      $rootScope.gifNum = data['gifs_sent'];
      $rootScope.groupNum = data['groups_created'];
      $rootScope.md5_hash = data.md5_hash;
      $rootScope.userId = userId;
      $rootScope.stars = data.stars || 0;
      $rootScope.pushNotification = data['pushNotification'];

      var firebaseRef = new Firebase($rootScope.baseUrl);
      var userGroupRef = firebaseRef.child("user_groups").child($rootScope.userId);
      var userNameRef = firebaseRef.child("usernames").child($rootScope.userName);
      var gifgroupsRef = firebaseRef.child("groups");

      $window.localStorage.setItem('user', email);
      $window.localStorage.setItem('password', password);
      $window.localStorage.setItem('data', JSON.stringify(data));
      $window.localStorage.setItem('userId', $rootScope.userId);

      $state.go('conversation');

    }

  });


  $scope.getFeedThenTransition = function() {
    $state.go('conversation');
  }

})