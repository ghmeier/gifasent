gifCtrl.controller('SignInCtrl', [
  '$scope', '$rootScope', '$firebaseAuth', '$window', '$ionicPopup', '$state',
  function($scope, $rootScope, $firebaseAuth, $window, $ionicPopup, $state) {
    // check session

    //$rootScope.checkSession();
    $scope.user = {
      email: "",
      password: "",
      username: "",
      groupNum: 0,
      gifNum: 0
    };

    $scope.toSignin = function() {
      $state.transitionTo("signin");
    }

    $scope.toSignup = function() {
      $state.transitionTo("signup");
    }

    $scope.validateUser = function() {
      $rootScope.show();
      var email = this.user.email;
      var password = this.user.password;
      var username = this.user.username;
      var groupNum = this.user.groupNum;
      var gifNum = this.user.gifNum;
      if (!email || !password) {
        $ionicPopup.alert({
          title: "Login Error",
          template: "Enter your email and password please :)"
        });
        $rootScope.hide();
        return false;
      }

      $rootScope.auth.$login('password', {
          email: email,
          password: password
        })
        .then(function(user) {
          $rootScope.hide();
          $rootScope.userEmail = user.email;
          $rootScope.userId = user.id;

          var userRef = new Firebase($rootScope.baseUrl + "users/" + $rootScope.userId);
          userRef.once("value", function(snapshot) {
            data = snapshot.val();
            safeApply($scope, $rootScope, function() {
              $rootScope.userName = data.username;
            });
            $rootScope.gifNum = data['gifs_sent'];
            $rootScope.groupNum = data['groups_created'];
            $rootScope.md5_hash = data.md5_hash;
            $rootScope.pushNotification = data.pushNotification || 1;
            $window.localStorage.setItem('data', JSON.stringify(data));
                      $rootScope.hide();
          $window.localStorage.setItem('email', user.email);
          $window.localStorage.setItem('password', password);
          $window.localStorage.setItem('userId', $rootScope.userId);

          $state.transitionTo('conversation');
          });

        }, function(error) {

          $rootScope.hide();
          if (error.code == 'INVALID_EMAIL') {
            $ionicPopup.alert({
              title: "Login Error",
              template: "Email given is invalid"
            });

          } else if (error.code == 'INVALID_PASSWORD') {
            $ionicPopup.alert({
              title: "Login Error",
              template: "Invalid username and password"
            });
          } else if (error.code == 'INVALID_USER') {
            $ionicPopup.alert({
              title: "Login Error",
              template: "Invalid username and password"
            });
          } else {
            $ionicPopup.alert({
              title: "Login Error",
              template: 'Unexpected error ' + error.code
            });
          }
        });
    }
  }
])