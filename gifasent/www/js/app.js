// google sender id 333948039406
// server apiKey AIzaSyAqUlfO48aoA3DZrkKFbMIUROmcBMfxPaM
// giphy apiKey 124hpbJkl6DGOQ
angular.module('gifasent', ['ionic', 'firebase', 'gifasent.controllers', 'ngCordova'])

.run(function($ionicPlatform, $rootScope, $firebaseAuth, $firebase, $window, $ionicLoading, $state, $ionicPopup, $http, $cordovaPush) {
  $ionicPlatform.ready(function() {

    $rootScope.headers = {
      "X-Parse-Application-Id": "<PARSE_ID>",
      "X-Parse-REST-API-Key": "<PARSE_API_KEY>",
      "Content-Type": "application/json"
    };

    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }

    $rootScope.userEmail = null;
    //$rootScope.conversationNotification = false;
    //$rootScope.officialFeedNotification = false;
    $rootScope.userName = "";
    $rootScope.currentList = "";
    $rootScope.userId = null;
    $rootScope.tabsSlider = null;
    $rootScope.md5_hash = null;
    $rootScope.totalGifs = 0;
    $rootScope.groupsCreated = 0;
    $rootScope.groupNum = 0;
    $rootScope.score = 0;
    $rootScope.gifNum = 0;
    $rootScope.baseUrl = '<YOUR FIREBASE URL>';
    $rootScope.list = null;
    $rootScope.recentList = null;
    $rootScope.noData = true;
    var authRef = new Firebase($rootScope.baseUrl);
    $rootScope.auth = $firebaseAuth(authRef);
    $rootScope.installationId = null;


    $rootScope.show = function(text) {
      $rootScope.loading = $ionicLoading.show({
        content: text ? text : 'Loading..',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0,
        duration: 2000,
        template: '<img src="./img/API_Larger_Grey_Trans_BG_once.gif" width="20%"/><div class="list"><i class="icon ion-loading-c"></i></div>'
      });
    };

    $rootScope.hide = function() {
      $ionicLoading.hide();

    };

    $rootScope.notify = function(text) {
      $rootScope.show(text);
      $window.setTimeout(function() {
        $rootScope.hide();
      }, 1999);
    };

    $rootScope.logout = function() {
      $rootScope.auth.$logout();

    };

  });

})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('auth', {
      url: "/auth",
      templateUrl: "templates/splash.html",
      controller: "authCtrl"
    })
    .state('signin', {
      url: '/signin',
      templateUrl: 'templates/auth-signin.html',
      controller: 'SignInCtrl'
    })
    .state('signup', {
      url: '/signup',
      templateUrl: 'templates/auth-signup.html',
      controller: 'SignUpCtrl'
    })
    .state('conversation', {
      url: "/conversation",
      templateUrl: "templates/conversations.html",
      controller: 'myListCtrl'
    })
    .state('adminConversation', {
      url: "/adminConversation",
      templateUrl: "templates/admin-conversations.html",
      controller: 'myAdminListCtrl'
    })
    .state('profile', {
      url: "/profile",
      templateUrl: "templates/profile.html",
      controller: 'profileCtrl'
    })
    .state('changePassword', {
      url: "/changePassword",
      templateUrl: "templates/change-password.html",
      controller: 'changePasswordCtrl'
    })
    .state('group', {
      url: "/group",
      templateUrl: "templates/group.html",
      controller: 'groupFeedCtrl'
    })
    .state('newConv', {
      url: "/newConv",
      templateUrl: "templates/newItem.html",
      controller: 'newCtrl'
    })
    .state('newContact', {
      url: "/newContact",
      templateUrl: "templates/newContact.html",
      controller: "newContCtrl"
    })
  $urlRouterProvider.otherwise('/auth');
})

.service("feedItems", function() {
  var currentFeed;
  var userName;
  var feeds;
  var allFeeds;
  var gif;
  return {
    getCurFeed: function() {
      return currentFeed;
    },
    getUsername: function() {
      return userName;
    },
    getFeeds: function() {
      return feeds;
    },
    setFeeds: function(feed) {
      feeds = feed;
    },
    setCurFeed: function(feed) {
      currentFeed = feed;
    },
    setUserName: function(username) {
      userName = username;
    },
    setAllFeeds: function(list) {
      allFeeds = list;
    },
    getAllFeeds: function() {
      return allFeeds;
    },
    setGif: function(sgif) {
      gif = sgif;
    },
    getGif: function() {
      return gif;
    }
  };
})

.directive('imageonload', function($rootScope) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      element.bind('load', function() {
        $rootScope.hide();
      });
    }
  };
});