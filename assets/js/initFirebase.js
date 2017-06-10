//initializes database
var googleApi = {

    key: "AIzaSyBUln0pM_BnfEb_h86rcctPuC5hECblXgY",
    queryUrl: "https://maps.googleapis.com/maps/api/js?key=" + this.key + "&callback=initMap"

};

var config = {
    apiKey: "AIzaSyD-ftcKUoOvdhzaeaXypzqjyzKrsoZMGr8",
    authDomain: "stump-ddd23.firebaseapp.com",
    databaseURL: "https://stump-ddd23.firebaseio.com",
    projectId: "stump-ddd23",
    storageBucket: "stump-ddd23.appspot.com",
    messagingSenderId: "140581118335"
};

firebase.initializeApp(config);

var database = firebase.database();


// Shared Buttons

$(document).ready(function() {

  //initilize popovers
  $(function () {
    $('[data-toggle="popover"]').popover()
  });

$(document).on("click", "#signOut", function(){
  var signedOut = false;
  firebase.auth().signOut().then(function(){
  }).catch(function(error) {
    // An error happened.
    signedOut=false;
    console.log("error signing out!");
  });
});

$(document).on("click", "#signInPage", function(){
  window.location = "index.html";
});

$(".update-btn").on("click", function(){
	console.log("update your profile");
	window.location = "profile.html";
});
//browse
$(".browse-btn").on("click", function(){
	console.log("browsing");
	window.location = "stumpPage.html";
});

});