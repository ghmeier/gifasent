gifCtrl.controller('newContCtrl', function($rootScope, $scope, $state, $window, $ionicPopup, $firebase, $ionicPlatform, $ionicNavBarDelegate) {

  $scope.contacts = [];
  $scope.rawContacts = [];
  $scope.finalIndex = 0;
  $scope.contactName;

  $scope.inviteShare = function(number) {
    if (ionic.Platform.isAndroid()) {
      window.plugins.socialsharing.shareViaSMS("Check out gifasent on http://gifasent.co and start a conversation with me, " + $rootScope.userName + "! http://media.giphy.com/media/veeY9dQbn3t0k/200.gif", number, function(msg) {});
    }
    if (ionic.Platform.isIOS()) {
      //var shareArray = ["Check out gifasent on http://gifasent.co and start a conversation with me, "+$rootScope.userName+"! http://media.giphy.com/media/veeY9dQbn3t0k/200.gif","",number,"no"];
      window.plugins.socialsharing.shareViaSMS("Check out gifasent on http://gifasent.co and start a conversation with me, " + $rootScope.userName + "! http://media.giphy.com/media/veeY9dQbn3t0k/200.gif", number, function(msg) {});
    }
    if (ionic.Platform.isAndroid()) {
      window.parsePlugin.logAnalytics("invite", 1);
    }
    if (ionic.Platform.isIOS()) {
      var jsarray = ["invite", "1"];
      window.parsePlugin.logAnalytics(jsarray);
    }

  };

  $scope.invite = function(contact) {
    var index = $scope.contacts.indexOf(contact);
    safeApply($scope, $rootScope, function() {
      $scope.contacts.splice(index, 1);
    });
    $scope.inviteShare(contact.info);
  }

  $scope.filterContacts = function(contacts) {
    $scope.rawContacts = contacts;

    for (contact = $scope.finalIndex; contact < $scope.finalIndex + 25 && contact < contacts.length; contact++) {
      if (contacts[contact].phoneNumbers !== null) {
        var paredContact = {};
        paredContact.name = contacts[contact].name.formatted;
        paredContact.info = contacts[contact].phoneNumbers[0].value;

        safeApply($scope, $rootScope, function() {
          safeApply($scope, $rootScope, function() {
            $scope.contacts.push(paredContact);
          });
        });
      }

    }
    $scope.finalIndex += 25;
  };

  function onError(contactError) {
    console.log('onError!');
  };


  $scope.findContacts = function() {
    $scope.contacts = [];
    $scope.finalIndex = 0;
    $scope.rawContacts = [];
    var options = new ContactFindOptions();
    options.filter = this.contactName;
    options.multiple = true;
    options.desiredFields = [navigator.contacts.fieldType.id, navigator.contacts.fieldType.displayName, navigator.contacts.fieldType.emails, navigator.contacts.fieldType.phoneNumbers, navigator.contacts.fieldType.name];
    var fields = [navigator.contacts.fieldType.displayName];
    navigator.contacts.find(fields, $scope.filterContacts, onError, options);
  }
  $scope.findContacts();

  $scope.canLoad = function() {
    return $scope.finalIndex <= $scope.rawContacts.length;
  };


  $scope.toNewConv = function() {
    $state.transitionTo("newConv");
  }

  $scope.toNewContact = function() {

  };

  $scope.goBack = function() {
    if ($rootScope.currentList == "convo" || $rootScope.currentList === "convo") {
      $state.transitionTo("conversation");
    } else {
      $state.transitionTo("adminConversation");
    }
  }

  $scope.loadMore = function() {

    if ($scope.canLoad()) {
      $scope.filterContacts($scope.rawContacts);
    }
    $scope.$broadcast('scroll.infiniteScrollComplete');
  };

  $scope.data = {
    item: ""
  };

  $scope.close = function() {
    $ionicNavBarDelegate.back();
  };
})