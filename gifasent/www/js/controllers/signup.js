gifCtrl.controller('SignUpCtrl', [
    '$scope', '$rootScope', '$firebaseAuth', '$window', '$state','$ionicPopup','$timeout',
    function ($scope, $rootScope, $firebaseAuth, $window,$state,$ionicPopup,$timeout){
      $scope.user = {
        email: "",
        password: "",
        username:"",
        groupNum:0,
        gifNum:0
      };

      $scope.toSignin = function(){
        $state.transitionTo("signin");
      }

      $scope.toSignup = function(){
        $state.transitionTo("signup");
      }

      $scope.createUser = function () {
        var email = this.user.email;
        var password = this.user.password;
        var username = this.user.username.toLowerCase();
        var firebaseRef = new Firebase($rootScope.baseUrl);
        var taken = false;
 
        if (!email || !password || !username) {
          $ionicPopup.alert({
       title: "Login Error",template:"Please fill out the fields, we know it's a lot. :)"})
          $rootScope.hide();
          return false;
        }

        firebaseRef.child("usernames").child(username).once("value",function(snapshot){
          taken = snapshot.val() != null;
        });

            
        //check for duplicate user.
        var usernameRef = new Firebase($rootScope.baseUrl+"usernames/");
        var available = false;
        usernameRef.child(username).once("value",function(snapshot){
          available = snapshot.val() == null;
          if (available){ 
            $rootScope.show('Please wait.. Registering');

            $rootScope.auth.$createUser(email, password, function (error, user) {
              if (!error) {
                $rootScope.hide();
                $rootScope.userEmail = user.email;
                var userRef = firebaseRef.child("users").child(user.id);
                var userGroupRef = firebaseRef.child("user_groups").child(user.id);
                var userNameRef = firebaseRef.child("usernames").child(username);
                var gifgroupsRef = firebaseRef.child("groups");

                userNameRef.set(user.id);
                var data = {id:user.id,username:username,email:user.email,gifs_sent:0,groups_created:0,md5_hash:user.md5_hash,pushNotification:1};
                userRef.update(data);
                $window.localStorage.setItem('data',JSON.stringify(data));
                
                //Get all admin groups currently being used
                var adminGroups = new Firebase($rootScope.baseUrl+"admin_groups");
                adminGroups.once("value",function(snap){
                    var allAdminGroups = snap.val();
                    for(adminGroup in allAdminGroups) {
                        userGroupRef.child(adminGroup).set(adminGroup);
                        gifgroupsRef.child(adminGroup).child("users").child(username).set("1");
                    }
                                 
                    
                }, function (errorObject) {
                    console.log("The read failed: " + errorObject.code);
                });

                var startFeed= { '0' : user.md5_hash+"gif0",
                                 '1' : user.md5_hash+"gif1",
                                 '2' : user.md5_hash+"gif2",
                                 '3' : user.md5_hash+"gif3",
                                 '4' : user.md5_hash+"gif4",
                                 '5' : user.md5_hash+"gif5",
                                 '6' : user.md5_hash+"gif6",
                                 '7' : user.md5_hash+"gif7",
                                 '8' : user.md5_hash+"gif8"
                               };
    
                var startGifs= {};

                startGifs[user.md5_hash+"gif8"]= {sender:"just you",time:getTime(),text:'Get out there and gif the world!',total_stars:1,url:"http://media.giphy.com/media/dQCmKY4IgywFy/200.gif"};
                startGifs[user.md5_hash+"gif8"].stars = {};
                startGifs[user.md5_hash+"gif8"].stars[username] = "0";    
                startGifs[user.md5_hash+"gif7"]= {sender:"just you",time:getTime(),text:'Like these gifs a lot? Try sharing one, by tapping where it says share on the top right',total_stars:1,url:"http://media.giphy.com/media/8kP16QVrk9u2Q/200.gif"};
                startGifs[user.md5_hash+"gif7"].stars = {};
                startGifs[user.md5_hash+"gif7"].stars[username] = "0";                
                startGifs[user.md5_hash+"gif6"]= {sender:"just you",time:getTime(),text:'You can add multiple people to a conversation, for group gifing! Removing a conversation is as easy as swiping left on the name, and tapping x',total_stars:1,url:"http://media.giphy.com/media/irPxRRzMTMFd6/200.gif"};
                startGifs[user.md5_hash+"gif6"].stars = {};
                startGifs[user.md5_hash+"gif6"].stars[username] = "0";
                startGifs[user.md5_hash+"gif5"]= {sender:"just you",time:getTime(),text:"Try tapping the plus icon on the previous screen, tap random conversation (or enter your friend's username), and 'start' to begin a conversation!",total_stars:1,url:"http://media.giphy.com/media/QNEhInJ8Da38A/200.gif"};
                startGifs[user.md5_hash+"gif5"].stars = {};
                startGifs[user.md5_hash+"gif5"].stars[username] = "0";
                startGifs[user.md5_hash+"gif4"]= {sender:"just you",time:getTime(),text:"Woah, we typed #big explosion, and this came up. (No need for multiple #'s, plus we also take your hashtag away to give your friends a surprise)",total_stars:1,url:"http://media.giphy.com/media/xWwlsKhzOtuTu/200.gif"};
                startGifs[user.md5_hash+"gif4"].stars = {};
                startGifs[user.md5_hash+"gif4"].stars[username] = "0";
                startGifs[user.md5_hash+"gif3"]= {sender:"just you",time:getTime(),text:"Type out a message and tap send! Pssst...anything typed after a # in your message will be added as a search for your gif.",total_stars:1,url:"http://media.giphy.com/media/dhCx7EyeGYD7O/giphy.gif"};
                startGifs[user.md5_hash+"gif3"].stars = {};
                startGifs[user.md5_hash+"gif3"].stars[username] = "0";
                startGifs[user.md5_hash+"gif2"]= {sender:"just you",time:getTime(),text:"Fun fact, you can also tap the star to show your love for a gif (tap it again to remove it). We'll keep the gifs you love around to savor the memories.",total_stars:1,url:"http://media.giphy.com/media/ToMjGpQnlnbsZny24iA/giphy.gif"};
                startGifs[user.md5_hash+"gif2"].stars = {};
                startGifs[user.md5_hash+"gif2"].stars[username] = "0";
                startGifs[user.md5_hash+"gif1"]= {sender:"just you",time:getTime(),text:"Tap this gif (it's paused) to see it play, also make sure you have a good internet connection or else you won't be able to see the brilliance of the gif!",total_stars:1,url:"http://media.giphy.com/media/C3tYgJwPxjLQk/200.gif"};
                startGifs[user.md5_hash+"gif1"].stars = {};
                startGifs[user.md5_hash+"gif1"].stars[username] = "0";
                startGifs[user.md5_hash+"gif0"]= {sender:"just you",time:getTime(),text:'Try scrolling and umm... we have a short memory, so we only remember a few gifs for you.',total_stars:1,url:"http://media.giphy.com/media/Wwh67YsWs9gY0/giphy.gif"};
                startGifs[user.md5_hash+"gif0"].stars = {};
                startGifs[user.md5_hash+"gif0"].stars[username] = "0";

                userGroupRef.child(user.md5_hash+username).set(user.md5_hash+username);
                firebaseRef.child("feeds").child(user.md5_hash+username).set(startFeed);
                firebaseRef.child("gif").update(startGifs);
                firebaseRef.child("groups").child(user.md5_hash+username).set({feed:user.md5_hash+username,name:'just you'});
                firebaseRef.child("groups").child(user.md5_hash+username).child('users').child(username).set("1");


                $rootScope.gifNum = 0;
                $rootScope.groupNum = 0;
                $rootScope.md5_hash = user.md5_hash;
                $rootScope.userId = user.id;
                $rootScope.userName = username;
                $rootScope.hide();

                $window.localStorage.setItem('email', user.email);
                $window.localStorage.setItem('password', password);
                $window.localStorage.setItem('userId', $rootScope.userId);
                loadFeed($scope,$rootScope,$timeout);
                $state.go("conversation");
              }else if(taken){
                //username taken alert
                $rootScope.hide();
                $ionicPopup.alert({
                 title: "Signup Error",template:"The username is already taken"});
              }else {
                $rootScope.hide();
                if (error.code == 'INVALID_EMAIL') {
                  $ionicPopup.alert({
                   title: "Signup Error",template:"Email given was invalid"});
                }
                else if (error.code == 'EMAIL_TAKEN') {
                 $ionicPopup.alert({
                   title: "Signup Error",template:"Email given was already used, try signing in!"});
               }
               else {
                $ionicPopup.alert({
                 title: "Signup Error",template:'Unable to connect'});
                }
              }
            });
          }else {
            $ionicPopup.alert({title:"Login Error",template:"Username already exists"});
            data.username = "";
          }
     });
      }
    }
  ])