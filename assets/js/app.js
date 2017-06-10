

var userID;
var userName;
var userCurrentLocation;
var userAvailabilty;
var userEmail;
var filterStatus = false;
var today = moment().format("MM/DD/YYYY");
var displayData;
var firebaseKey;
var createErr = false; 
var errMsg ="";
var slackMsg="";
var slackURL="https://hooks.slack.com/services/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";
var ckJoin = false;
var joinErr = false;


var users = [{
        ID: "student1",
        name: "kaylea",
        email: "kayleabox09@gmail.com"
    },
    {
        ID: "student2",
        name: "marya",
        email: "marya.crigler@att.net"
    },
    {
        ID: "student3",
        name: "jordan",
        email: "jbknight83@gmail.com"
    },
    {
        ID: "student4",
        name: "anthony",
        email: "apekearo@gmail.com"
    },
    {
        ID: "student5",
        name: "john",
        email: "jfbendfeldt@gmail.com"
    }
];


var stumpObject = {
    creator: "",
    availability: "",
    location: {},
    stumpees: "",
    date: moment().format("MM/DD/YYYY"),
    locationName:"",
    address:"",
    placeId:"",
    meetingType:"",
    stumpID : 1
};

//*******************************************************************************************************************
// Jordan Firebase push plus population of table




//*******************************************************************************************************************
//  Tony GeoLocation Area

// Note: This example requires that you consent to location sharing when
// prompted by your browser. If you see the error "The Geolocation service
// failed.", it means you probably did not give permission for the browser to
// locate you.
var map, infoWindow;
//this is where we will store the user geolocaion to base the nearby search on
var userPosition = {
    //saved temp lat and lng values in case user does not allow geolocation
    lat: 30.2672,
    lng: -97.7431
};


//this function initiates the map to be displayed on the screen based on 
//user geoloction
function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: {
            lat: 30.2672,
            lng: -97.7431
        },
        zoom: 14
    });
    infoWindow = new google.maps.InfoWindow;

    // Try HTML5 geolocation.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            userPosition = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            infoWindow.setPosition(userPosition);
            infoWindow.setContent('<img src="assets/images/flying-bird.png" style="width:1.5em; height:1.5em;">' + ' Here you are!');
            infoWindow.open(map);
            map.setCenter(userPosition);


        }, function() {
            handleLocationError(true, infoWindow, map.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(userPosition);
    infoWindow.setContent(browserHasGeolocation ?
        'Error: The Geolocation service failed.' :
        'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(map);
}



//************************************************************************************
//    Firebase listener -- on load firebase query for data 
//
$(document).ready(function() {
//---------------------------------SET CREATOR TO CURRENT USER---------------------------------
    $(window).on("load", function() {
        if(firebase.auth().currentUser !== null){
            var user = firebase.auth().currentUser;
            stumpObject.creator = user.displayName;
            console.log(stumpObject.creator);
            addRemoveBtn(stumpObject.creator);
            //addRemoveStumpeeBtn(stumpObject.creator);
        }
    });
//---------------------------------GET ITEMS FROM FIREBASE------------------------------------
    database.ref().orderByChild("date").startAt(today).on("child_added", function(snapshot) {
        firebaseKey = snapshot.V.path.o[0];//this is the id for the element stored in the database
        displayData = snapshot.val();
        buildTable();

           		$.each(snapshot, function(){
           			var snapSid = parseInt(snapshot.val().stumpID) ;
           			if (snapSid > stumpObject.stumpID){ stumpObject.stumpID = snapSid};
           		});
           		stumpObject.stumpID = stumpObject.stumpID + 1;

     });



//************************************************************************************
//   Build Stump table data -- called by firebase queries
//
function buildTable(){
        var row = $('<tr data-value="'+firebaseKey+'">');
        console.log(row.attr("data-value")+" data-value on the tr");
        var checkbox = "<input type = 'checkbox' class = 'checkbox' value='unchecked' id ='" + parseInt(displayData.stumpID) + "'>";

        row.append('<td class="stumpMap" data-value="'+firebaseKey+'">' + displayData.creator +
         '</td> <td class="stumpMap"><div>'+ displayData.locationName+'</div></td> <td class="stumpMap">' + displayData.stumpees + '</td> <td>' + 
          displayData.date + '</td> <td class="stumpMap">' + displayData.availability + 
         '</td> <td>' + checkbox + '</td> <td></td></tr>');
        
        $("#stumps").append(row);
}

    //************************************************************************************
    //    Event Handlers - Marya
    //

    // -----  Static button event handlers Name, Availability, Date Picker ------  //


    //  User Availability buttons  //
    $(".avail-btn").on("click", function() {
        stumpObject.availability = $(this).val();
        console.log("Stump user availability is: " + stumpObject.availability);
    });


    // Date Picker input //
    console.log("Default date is: " + stumpObject.date) 
    $(function() {
        $('input[name="stumpDate"]').daterangepicker({
            singleDatePicker: true,
            showDropdowns: true
        }, 
        function(start) {
            stumpObject.date = moment(start).format("MM/DD/YYYY");
            console.log("Date picked is " + stumpObject.date)
        });
    });


    //  Filter button  //
    $('.glyphicon').parent().click(function(){
        if(jQuery(this).children('.glyphicon').hasClass('glyphicon-calendar')){
            jQuery(this).children('.glyphicon').removeClass('glyphicon-calendar').addClass('glyphicon-sort-by-attributes');
            filterStatus = true;
            console.log ("filter was off, turned it on. Current status is: " + filterStatus);
            $("#stumps").empty();
            database.ref().orderByChild("date").equalTo(stumpObject.date).on("child_added", function(snapshot) {
                    console.log("the filtered date is: " + stumpObject.date + "the creator is: " + snapshot.val().creator)
                    firebaseKey = snapshot.V.path.o[0];//this is the id for the element stored in the database
                    displayData = snapshot.val();
                    buildTable();
                });

            }
        else if(jQuery(this).children('.glyphicon').hasClass('glyphicon-sort-by-attributes')){
            jQuery(this).children('.glyphicon').removeClass('glyphicon-sort-by-attributes').addClass('glyphicon-calendar');
             filterStatus = false;
             console.log ("filter was on, turned it off. Current status is: " + filterStatus);
              $("#stumps").empty();
             database.ref().orderByChild("date").startAt(today).on("child_added", function(snapshot) {
                    firebaseKey = snapshot.V.path.o[0];//this is the id for the element stored in the database
                    displayData = snapshot.val();
                    buildTable();
                });
            }
    });

    //*********************************************************************************
    //KAYLEA
    //--------------------NEARBY PLACES SEARCH
    var chosenPlace;
    $('#places').on("click", function() {
        $("#placeInfo").empty();
        getPlaces();

        //gets places nearby the user that they can meet at and stores the location
        function getPlaces() {
            console.log(userPosition);

            map = new google.maps.Map(document.getElementById('map'), {
                center: userPosition,
                zoom: 12
            });

            infowindow = new google.maps.InfoWindow();
            var service = new google.maps.places.PlacesService(map);
            service.nearbySearch({
                location: userPosition,
                radius: 2500,
                type: ['cafe']
            }, callback);
            //scroll to map on mobile click
            $('html, body').animate({
                scrollTop: $("#apiStuff").offset().top
            }, 500);
        }

        function callback(results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                for (var i = 0; i < results.length; i++) {
                    //log the results to make sure it is getting objects back from google
                    console.log(results[i]);
                    //this gets us the lat and lng of the place
                    console.log("lng= " +results[i].geometry.viewport.b.b + "lat= " + results[i].geometry.viewport.f.b);
                    var placeLocation = results[i].geometry.viewport.f.b+","+results[i].geometry.viewport.b.b;
                    console.log(placeLocation);
                    createMarker(results[i], "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|ff6363");
                }
            }
        }

        function createMarker(place, icon) {
            var placeLoc = place.geometry.location;
            var marker = new google.maps.Marker({
                map: map,
                position: place.geometry.location,
                //ima change some colors!!!!!
                //https://stackoverflow.com/questions/7095574/google-maps-api-3-custom-marker-color-for-default-dot-marker
                //https://developers.google.com/maps/documentation/javascript/symbols
                icon: icon
            });

            //did some mousin' over stuff... now you can see the place name when you hover!
            google.maps.event.addListener(marker, "mouseover", function(event) {
                infoWindow.setContent(place.name);
                infoWindow.open(map, this);
            });

            google.maps.event.addListener(marker, 'click', function() {
                infowindow.setContent(place.name);
                infowindow.open(map, this);
                //this gets the lat and lng of the clicked on place and saves it to chosenPlace
                stumpObject.locationName = place.name;
                stumpObject.location = {
                  lat:place.geometry.viewport.f.b,
                  lng:place.geometry.viewport.b.b
                }
                stumpObject.placeId = place.place_id;
                stumpObject.address = place.vicinity;
                console.log("this is the chosen place! "+stumpObject.locationName +stumpObject.location + stumpObject.address + stumpObject.placeId);
                
                //  add basic data to places info section --- K, could you add website?

                map = new google.maps.Map(document.getElementById('map'), {
                center: stumpObject.location,
                zoom: 12
                });

                var request= {placeId : place.place_id};
                service = new google.maps.places.PlacesService(map);
                service.getDetails(request, callback);

                function callback(place, status) {
                    console.log(place);//this shows the place object returned, 
                    //will leave it in until we have finalized all of the information we want to pull from it
                    var placeInfo = $("#placeInfo");
                    placeInfo.css("visibility", "visible")
                    //this will need to be cleared when get places is selected after a stump is viewed already
                    placeInfo.html('<div id="placeName">Location: <span class="locationInfo">'+place.name+'</span></div>'+
                        '<div id="address">Address: <a href="'+place.url+'" id="googleMapUrl" target="_blank">'+place.formatted_address+'</a></div>'+
                        '<div id="website">Website: </div>');
                    if(place.website){
                        $("#website").append('<a href="'+place.website+'" target="_blank">'+place.website+'</a>');
                    }

                    $("#placeInfo").css("visibility", "visible"); 
                  
                  if (status == google.maps.places.PlacesServiceStatus.OK) {
                    createMarker(place, "assets/images/tree-stump-.png");
                  }
                }

            });
        }

    });
  //************************************************************************************
  // ----- Dynamic button event handlers   ------//
  //

// Validate data selections before creating a stump  //
    
    //  Join stump meetup location  //
    $(document).on("click", ".join-btn", function() {
        $("#errMsg").empty();
        ckJoin = false;
        var numRows = $('#stumps tr').length;
        for(i=0; i<numRows; i++){
            //loops through the table data to see if the selected user has a stump in there name  
            console.log($("#stumps tr:eq('"+i+"') .checkbox").attr('value'))
            if($("#stumps tr:eq('"+i+"') .checkbox").attr("value") === "checked"){
                ckJoin=true;
                //gets the access key that was stored when the stump was created and saves it in itemId
                var itemId = $("#stumps tr:eq('"+i+"')").attr("data-value");
                console.log("join this one! "+itemId);
                console.log(itemId); //checks data-value being saved to button
                //add user to object stumpees list
                var stumpees = "";
                database.ref(itemId).on("value", function(snapshot){
                    stumpees += snapshot.val().stumpees;
                    stumpees.split("<br>");
                    console.log("stumpees "+stumpees);
                    if(stumpees === undefined){
                        stumpees = stumpObject.creator+"<br>";
                    }
                    else{
                        if(stumpees.includes(stumpObject.creator)){
                            console.log("already in the stump");
                        }
                        else{stumpees +=stumpObject.creator+"<br>";}
                    }

                })

                stumpees.toString();
                database.ref(itemId).update({stumpees: stumpees});
                database.ref(itemId).on("value", function(snap)
                    {$("#stumps tr:eq('"+i+"') td:eq('2')").html(snap.val().stumpees);})
                $("#stumps tr:eq('"+i+"') td:eq('5')").html("<input type = 'checkbox' class = 'checkbox' value='unchecked'>");
            } 

        }
        if (!ckJoin){
                 errMsg = " Select a Stump to join | ";
                 $("#errMsg").html(errMsg);
                 ckJoin = false;
            };
    });


    //  Checkbox to select a stump  used in conjuction with the Join button  //
    $(document).on("click", ".checkbox", function() {
        if($(this).attr('value') === "unchecked"){
            $(this).attr('value','checked');
        }
        else if($(this).attr('value') === "checked"){
            $(this).attr('value','unchecked');
        }

     });


    // Validate data selections before creating a stump  //
    function validateStumpCreate(){
        $("#errMsg").empty();
        errMsg = ""
        if (stumpObject.creator == ""){
            errMsg = errMsg + " Sign In to select stump user | ";
            createErr = true; 
        };

        if(stumpObject.availability == ""){
             errMsg = errMsg + " Select availability | ";
            createErr = true;
        };
         if(stumpObject.locationName == ""){
             errMsg = errMsg + " Select a location | ";
            createErr = true;
        };
    };


    // Create Stump button  //
    $("#add-stump-btn").on("click", function(event) {
    event.preventDefault();

    validateStumpCreate();
    if (createErr) {
        $("#errMsg").html(errMsg);
        createErr = false;
    }
    else {
        $('.avail-btn').removeClass('selected-avail-btn');

        database.ref().push({
            creator: stumpObject.creator,
            availability: stumpObject.availability,
            location: stumpObject.location,
            stumpees: "",
            date: stumpObject.date,
            placeId: stumpObject.placeId,
            locationName : stumpObject.locationName,
            stumpID : stumpObject.stumpID
        });

        addRemoveBtn(stumpObject.creator);
        //addRemoveStumpeeBtn(stumpObject.creator);  
         //var payload={"text": "Hey yall someone just created an new stump, check it out! <https://alert-system.com/alerts/1234|Click here> for details!" }
         slackMsg = "Hey y'all, " + stumpObject.creator + " just created a stump for " + stumpObject.date + " at " + stumpObject.locationName + " . Check it out! <https://stumput.github.io/|Click here> for details!"
         var payload={"text": slackMsg}  
         $.post(slackURL,JSON.stringify(payload));
    }
});

    // Dynamically add Delete Stump buttons to each stump  //
    function addRemoveBtn(currentUser){
        var numRows = $('#stumps tr').length;
        for(i=0; i<numRows; i++){
            //removes all the removal buttons when a new user is selected
            $("#stumps tr:eq('"+i+"') td:eq('6')").html("")
            //loops through the table data to see if the selected user has a stump in there name    
            if($("#stumps tr:eq('"+i+"') td:eq('0')").text() === currentUser || $("#stumps tr:eq('"+i+"') td:eq('0')").text() == ""){
                //gets the access key that was stored when the stump was created and saves it in itemId
                var itemId = $("#stumps tr:eq('"+i+"')").attr("data-value");
                console.log(itemId); //checks data-value being saved to button
                //adds the object key as a data-value to the remove-btn so the unique element can be located in the database
                $("#stumps tr:eq('"+i+"') td:eq('6')").html('<button type="button" data-value="'+itemId+'" class="btn btn-danger remove-btn">X</button>');
                //found a solution to appending information to a specific column here: https://api.jquery.com/last-selector/
            }
        }
        addRemoveStumpeeBtn(stumpObject.creator);
    }


    //  Delete Stump buttons  //
    $(document).on("click", ".remove-btn", function(){
        //gets the data-value of the remove-btn and stores it in removeThisNode
        var removeThisNode = $(this).closest('tr').attr("data-value");
        console.log(removeThisNode); //check the data-value
        //uses the data-value of the remove-btn to remove the stumpObject stored at that location in the database
        database.ref(removeThisNode).remove();
        //removes the item from the html table
        $(this).closest('tr').remove();
        //https://stackoverflow.com/questions/23249130/delete-table-row-using-jquery
    });

    // Dynamically add Delete Stumpee user buttons to each stump  //
    function addRemoveStumpeeBtn(currentUser){
        console.log("remove me from the stump!");
        var numRows = $('#stumps tr').length;
        for(i=0; i<numRows; i++){
            //removes all the removal buttons when a new user is selected
            $("#stumps tr:eq('"+i+"')").attr("id",i);
            //loops through the table data to see if the selected user has a stump in there name
            var itemId = $("#stumps tr:eq('"+i+"')").attr("data-value");
            database.ref(itemId).on("value",function(snap){
                var stumpees = "";
                console.log(snap);
                if( snap.val().stumpees !== undefined){
                    stumpees+=snap.val().stumpees;
                    stumpees.split('<br>');
                    console.log(stumpees);

                    if(stumpees.includes(currentUser)){
                    //gets the access key that was stored when the stump was created and saves it in itemId
                    //adds the object key as a data-value to the remove-btn so the unique element can be located in the database
                    $("#stumps tr:eq('"+i+"') td:eq('6')").html('<button type="button" data-value="'+itemId+'" class="btn btn-warning remove-stumpee">X</button>');
                    }
                }
            });  
        }
    }

    // Delete Stumpee from the Stumpee array  //
    $(document).on("click", ".remove-stumpee", function(){
        //gets the data-value of the remove-btn and stores it in removeThisNode
        var removeThisNode = $(this).closest('tr').attr("data-value");
        var row = $(this).closest('tr').attr("id");
        var stumpees = "";
        //uses the data-value of the remove-btn to remove the stumpObject stored at that location in the database
        database.ref("/"+removeThisNode).on("value", function(snap){
            stumpees += snap.val().stumpees;
            var stumpeesArray = stumpees.split("<br>");
            var index = stumpeesArray.indexOf(stumpObject.creator);
            console.log(index);
            
            stumpeesArray.splice(index,1);
            stumpees = stumpeesArray.toString();

        });
        console.log(stumpees);
        //removes the item from the html table
        $('#stumps tr:eq("'+row+'") td:eq("2")').html(stumpees);
        $("#stumps tr:eq('"+row+"') td:eq('6')").html("");
        database.ref("/"+removeThisNode).update({stumpees:stumpees});
        //https://stackoverflow.com/questions/23249130/delete-table-row-using-jquery
    });
        //--------------------------------------------------------------------------------------------
        //********************************************************************************************
        //--------------------------------------------------------------------------------------------
        //changes the map to show the stump selected and adds details under the map
        $(document).on("click", ".stumpMap", function(){
            var object = $(this).closest('tr').attr('data-value');
            database.ref(object).on('value', function(snap){
                var request = {
                  placeId: snap.val().placeId
                };

                console.log(request);
                //scroll to map in mobile on click
                    $('html, body').animate({
                        scrollTop: $("#apiStuff").offset().top
                    }, 500);
                map = new google.maps.Map(document.getElementById('map'), {
                    center: snap.val().location,
                    zoom: 14
                });

                infowindow = new google.maps.InfoWindow();
                service = new google.maps.places.PlacesService(map);
                service.getDetails(request, callbackStump);

                function callbackStump(place, status) {
                    console.log(place);//this shows the place object returned, 
                    //will leave it in until we have finalized all of the information we want to pull from it
                    var placeInfo = $("#placeInfo");
                    placeInfo.css("visibility", "visible")
                    //this will need to be cleared when get places is selected after a stump is viewed already
                    placeInfo.html('<div id="placeName">Location: <span class="locationInfo">'+place.name+'</span></div>'+
                        '<div id="address">Address: <a href="'+place.url+'" id="googleMapUrl" target="_blank">'+place.formatted_address+'</a></div>'+
                        '<div id="stumpCreator">Creator: <span class="locationInfo">'+snap.val().creator+'</span></div>'+
                        '<div id="date">Date: <span class="locationInfo">'+snap.val().date+'</span><br>Time: <span class="locationInfo">' + snap.val().availability + '</span></div>' +
                        '<div id="website">Website: </div>');

                    if(place.website){
                        $("#website").append('<a href="'+place.website+'" target="_blank">'+place.website+'</a>');
                    }

                  if (status == google.maps.places.PlacesServiceStatus.OK) {
                    var placeLoc = place.geometry.location;
                    var marker = new google.maps.Marker({
                        map: map,
                        position: place.geometry.location,
                        icon: "assets/images/tree-stump-.png"
                    });
                  }
                }
            })
            
        });

        //--------------------------------------------------------------------------------------------
        //********************************************************************************************
        //--------------------------------------------------------------------------------------------


});