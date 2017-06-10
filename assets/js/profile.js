$(document).ready(function(){
//*****************************************************************************************************************
//***************************************the .ready(function(){}) starts here**************************************
//*****************************************************************************************************************

// SET USER
//user state is changed
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    console.log(user);
    var name = user.displayName;
    var email = user.email;
    $("#user-name").append(name);
    $("#user-email").append(email);
    $("#profile-greet").html("Welcome "+name+"!");

    if(user.photoURL){
    	$("#profile-img").html('<img id="user-photo" src="'+user.photoURL+'">')
    }

     $("#navContents").prepend('<p class="navbar-text">Signed in as '+user.email+'</p>');

  } else {
    // User is signed out.
    // ...
    var pathSplit = window.location.pathname.split('/')
    if (pathSplit[pathSplit.length-1] !== 'index.html'){
          window.location = "index.html"
    }
     $("#navContents").html('<button type="button" id="signInPage" class="btn btn-default navbar-btn navbar-right">Sign In</button>');
  }
  //email.html
});

//----------------------------------------------Static Buttons----------------------------------------------------

//delete account
$("#del-btn").on("click", function(){
	var user = firebase.auth().currentUser;
	console.log(user);
	user.delete().then(function() {
	  console.log("your account has been deleted");
	}, function(error) {
	  // An error happened.
	  console.log("could not delete account");
	});
});


$(document).on("click","#update-name", function(){
	var user    = firebase.auth().currentUser;
	var newName = $("#new-name").val();
	console.log(newName);

	user.updateProfile({
	  displayName: newName,
	}).then(function() {
	  // Update successful.
	  console.log(user.displayName);
	  $("#user-name").html("Name: "+user.displayName);
	}, function(error) {
	  // An error happened.
	});

	$("#new-name").val("");
});

$(document).on("click","#update-email", function(){
	var user = firebase.auth().currentUser;

	var newEmail = $("#new-email").val();
	console.log(newEmail);

	user.updateEmail(newEmail).then(function() {
	  // Update successful.
	  console.log(user.email);
	  $("#user-email").html("Email: "+user.email);
	}, function(error) {
	  // An error happened.
	});

	$("#new-email").val("");
});



//--------------------------------------------Static Buttons Over-------------------------------------------------

//*****************************************************************************************************************
//***************************************the .ready(function(){}) ends here****************************************
//*****************************************************************************************************************
});