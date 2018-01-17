//Declare global variables



//Initialize Firebase
var config = {
    apiKey: "AIzaSyCoyQsX5G0nDGZMT1fuYTk-PTQ1WSevBFw",
    authDomain: "foodie-travel-vault.firebaseapp.com",
    databaseURL: "https://foodie-travel-vault.firebaseio.com",
    projectId: "foodie-travel-vault",
    storageBucket: "foodie-travel-vault.appspot.com",
    messagingSenderId: "458792787291"
  };
  firebase.initializeApp(config);

 var database = firebase.database();

 var input = document.getElementById('location');

 var autocomplete = new google.maps.places.Autocomplete(input, {types: ['(cities)']});
 var globalCity = "";
 var globalState = "";

 //how do we use return to pass the values to the next function? 
 // should we make them global variables?


 $(document).ready(function() {


    google.maps.event.addListener(autocomplete, 'place_changed', function(){
             var place = autocomplete.getPlace();
              
             var city = place. address_components[0].short_name;
             
             var state = place. address_components[2].short_name;
                        
              globalCity=city;
              globalState=state;
          
        }); 

    function saveToFireBase(name, addr1, addr2, phone, rating, photo, website) {
        database.ref().push({
            dbRestaurantName:name,
            dbAddress1:addr1,
            dbAddress2:addr2,
            dbPhoneNumber:phone,
            dbRating:rating,
            dbPhoto:photo,
            dbWebsite:website

        })
    }


    database.ref().on("child_added",function(snapshot){

        //Assign database values to variables
        var sv = snapshot.val();
        console.log(sv);
        renderCards(sv.dbPhoto,
                sv.dbRestaurantName,
                sv.dbAddress1,
                sv.dbAddress2,
                sv.dbPhoneNumber,
                sv.dbRating
             )
    });

    function retrieveAndDisplayRecordsViaYelpAPI() {
     
    var restaurantName = $("#restaurant-name").val().trim();


   $("#restaurant-name").val("");
   $("#location").val("");

       var settings = {
           "async": true,
           "crossDomain": true,
         
        "url": "https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?location="+globalCity+","+globalState+"&term="+restaurantName+"&limit=1",
        
           "method": "GET",
           "headers": {
            "authorization": "Bearer UVD6_jknwmi1GkRxFFkWh7HX-JV_TrlieWHvaSMfi69lmcN6MPUUxk5EGJNnUWmLD3TV5vtrZ25whGiC9gmJRUbhEW5lz3Y6hOXT5oAS-WqK7U5TA772Lt4tBqlaWnYx",
               "Cache-Control": "no-cache",
           }
       }
           $.ajax(settings).done(function (response) {
         
            //JSON parameters based on the business search that returns an array
            var responseObject = response.businesses[0];
            var name = responseObject.name;
           
            var address1 = responseObject.location.display_address[0];
            var address2=responseObject.location.display_address[1];
         
            var phoneNumber = responseObject.display_phone;
       
            var rating = responseObject.rating + " stars";
            console.log(rating);

            var photo = responseObject.image_url;
          

            var website = responseObject.url;
           

            saveToFireBase(name,address1,address2,phoneNumber,rating,photo,website);

    });   //end of AJAX
      


   }//end function retrieveAndDisplayRecordsViaYelpAPI()


 function renderCards(photo,name,address1,address2,phoneNumber,rating){
 
        // var webLink = $("<a>").attr({
        //     "id":"url",
        //     "href":website,
        //     "target":"_blank"
        // });

        var displayImage = $("<img>").attr({
           "src": photo,
            "id":"image",
           "class":"card-img-top"
        });
     

          var displayName = $("<h4>").attr({
            "id":"name",
            "class":"card-title"
        });

          displayName.text(name);


           var addressHeader = $("<h6>").text("Address");

           var displayAddress = $("<p>").attr({
            "id":"address",
             "class":"card-text"
        });
           displayAddress.html(address1+'<br />' + address2);

            var phoneHeader = $("<h6>").text("Phone Number");

            var displayPhone = $("<p>").attr({
                "id":"phone",
                 "class":"card-text"
            });

            displayPhone.text(phoneNumber);

            var ratingHeader = $("<h6>").text("Rating");

            var displayRating = $("<p>").attr({
                "id":"rating",
                "class":"card-text"
            });

            displayRating.text(rating);

             var addDateButton = $("<button>").attr({
                "id":"add-date",
                "type":"button",
                 "class":"btn btn-primary btn-sm"
            });

             addDateButton.text("Add Date");

             // var restaurantCard = $("<div>").addClass("card mb-4");
       
            var cardColumn = $("<div>").addClass("col-sm-3");

            var card = $("<div>").addClass("card h-100");

            var cardBlock = $("<div>").addClass("card-block");

            $(".row").append(cardColumn);

            card.append(displayImage).append(displayName).append(displayName).append(addressHeader).append(displayAddress).append(phoneHeader).append(displayPhone).append(ratingHeader).append(displayRating).append(addDateButton);


            
           
            card.prependTo(cardColumn);
     }
         
 //Submit button click event 
    $("#search-button").on("click", function(event) {
       event.preventDefault();
       retrieveAndDisplayRecordsViaYelpAPI();
     });

});


