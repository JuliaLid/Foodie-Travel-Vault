//Declare global variables

// var database = firebase.database();

//Initialize Firebase
// var config = {
//     apiKey: "AIzaSyCoyQsX5G0nDGZMT1fuYTk-PTQ1WSevBFw",
//     authDomain: "foodie-travel-vault.firebaseapp.com",
//     databaseURL: "https://foodie-travel-vault.firebaseio.com",
//     projectId: "foodie-travel-vault",
//     storageBucket: "foodie-travel-vault.appspot.com",
//     messagingSenderId: "458792787291"
//   };
//   firebase.initializeApp(config
 var input = document.getElementById('location');

 var autocomplete = new google.maps.places.Autocomplete(input, {types: ['(cities)']});
 google.maps.event.addListener(autocomplete, 'place_changed', function(){
         var place = autocomplete.getPlace();
         	console.log (place);

 	});	
 	
 	// var queryURL = 
 	// "https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?location=cottage grove, MN&term=Margaritas&limit=1" 

 	// $.ajax({
  //  		url: queryURL,
  //     	method: "GET"
  //   	}).done(function(response) {
  //   		console.log(response);
  //   	});


 $(document).ready(function() {

    function retrieveAndDisplayRecordsViaYelpAPI() {
     console.log("Entering retrieveAndDisplayRecordsViaYelpAPI");


       var settings = {
           "async": true,
           "crossDomain": true,
        	"url": "https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/matches/best?name=Las+Margaritas+Mexican+Restaurant&address1=Harkness&city=Cottage+Grove&state=MN&country=US",
        //***good "url": "https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?location=cottage grove, MN&term=Margaritas&limit=5",
           "method": "GET",
           "headers": {
            "authorization": "Bearer UVD6_jknwmi1GkRxFFkWh7HX-JV_TrlieWHvaSMfi69lmcN6MPUUxk5EGJNnUWmLD3TV5vtrZ25whGiC9gmJRUbhEW5lz3Y6hOXT5oAS-WqK7U5TA772Lt4tBqlaWnYx",
               "Cache-Control": "no-cache",
           }
       }
           $.ajax(settings).done(function (response) {
            console.log("begin response");
           console.log(response);
            console.log("end response");
       });

   }//end function retrieveAndDisplayRecordsViaYelpAPI()

 //Submit button click event 
    $("#search-button").on("click", function(event) {
        console.log("on click event for runTest");
       event.preventDefault();
       retrieveAndDisplayRecordsViaYelpAPI();
     });

});