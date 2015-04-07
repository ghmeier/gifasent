gifCtrl.controller('changePasswordCtrl', function($q, $scope, $rootScope, $window, $state, $ionicModal, $firebase, $firebaseAuth, $ionicPopup, feedItems, $cordovaPush, $ionicPlatform, $filter) {

  $scope.password = {
    current: "",
    newpass: "",
    newpasscheck: ""
  };

  $scope.toProfile = function() {
    $state.transitionTo("profile");
  }

  $scope.updatePassword = function() {
    var email = $rootScope.userEmail;
    var current = this.password.current;
    var newpassword = this.password.newpass;
    var newpasswordcheck = this.password.newpasscheck;

    if (current == "" || current == null) {
      $ionicPopup.alert({
        title: "Error",
        template: "Enter your current password"
      });

    } else if (newpassword == "" || newpassword == null) {
      $ionicPopup.alert({
        title: "Error",
        template: "Enter your new password"
      });

    } else if (newpasswordcheck == "" || newpasswordcheck == null) {
      $ionicPopup.alert({
        title: "Error",
        template: "Please re-enter your new password"
      });

    } else if (newpassword != newpasswordcheck) {
      $ionicPopup.alert({
        title: "Error",
        template: "Your new passwords do not match each other"
      });
    } else {

      var authRef = new Firebase($rootScope.baseUrl);
      var auth = $firebaseAuth(authRef);
      auth.$changePassword(email, current, newpassword).then(function() {
        console.log("--" + error + "--");
        $ionicPopup.alert({
          title: "Success!",
          template: "You now have a new password!"
        });
      }).catch(function(error) {
        $ionicPopup.alert({
          title: "Error",
          template: "Make sure your current password is correct."
        });
      });
      console.log("end");
    }
  }
});