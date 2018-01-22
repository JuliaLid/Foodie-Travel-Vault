//Declare global variables
var input = document.getElementById('location');
var autocomplete = new google.maps.places.Autocomplete(input, {
    types: ['(cities)']
});
var globalCity;
var globalState;
var itemInfo;


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


$(document).ready(function () {
    //Submit button click event 
    $("#search-button").on("click", function (event) {
        event.preventDefault();
        // User can search for restaurant name in 2 ways: enter plain text without selecting a dropdown item or selecting a dropdown item. 
        // "If" handles the dropdown select --> card formation, else handles the text input only --> card formation
        // The global variable itemInfo gets a value assigned (selectItem function) when user selects a dropdown item. If it has a value, then save it to firebase. If not, do regular yelp search.
        if (itemInfo) {
            // Save itemInfo in firebase
            firebaseDataPrep(itemInfo);
            itemInfo = null;
            $("#restaurant-name").val("");
        } else {
            retrieveAndDisplayRecordsViaYelpAPI();
        }

    });

    //Google Maps API
    google.maps.event.addListener(autocomplete, 'place_changed', function () {
        var place = autocomplete.getPlace();
        var city = place.address_components[0].short_name;
        var state = place.address_components[2].short_name;
        var lat = place.geometry.location.lat();
        var lng = place.geometry.location.lng();
        globalCity = city;
        globalState = state;
    });

    // Yelp Autocomplete
    function yelpAutocomplete() {
        var restaurantText = $("#restaurant-name").val();

        // data request to yelp which uses the settings in buildSearchSettings function 
        var getData = function(request, response) {
            var settings = buildSearchSettings(request.term);

            //Initiating Ajax call to Yelp API
            $.ajax(settings).done(function (data) {
                response(data.businesses);
            });
        };

        // Things that happen when user selects an item in the dropdown list
        var selectItem = function(event, ui) {
            // Set the restaurant name as the restaurant input
            $("#restaurant-name").val(ui.item.name);
            // Store the item into global variable itemInfo
            itemInfo = ui.item;
            // Prevents clearing of data input on select 
            return false;
        }
        // jQuery library Autocomplete function (https://jqueryui.com/autocomplete/#multiple-remote)
        $("#restaurant-name").autocomplete({
            // Min length of input before autocomplete function starts
            minLength: 3,
            // Runs getData function on user input
            source: getData,
            // Runs selectItem function on user select 
            select: selectItem,
            // Unassigns value from global itemInfo variable whenever a dropdown appears (every dropdown initiates a yelp search). This allows user to search/look at multiple dropdowns before selection and have the final selected item get rendered to card
            search: function() {
                itemInfo = null;
            }
        })

            // Formats the businesses we retrieve from the Yelp API query into a dropdown list. The number of items in dropdown depends on the limit we set in buildSearchSettings
            .autocomplete("instance")._renderItem = function(ul, item) {
                return $("<li>")
                    .append("<div><img src=" + item.image_url.replace("o.jpg", "30s.jpg") + "></div><div><span>" + item.name + "</span><br>" + item.location.address1 + ", " + item.location.city + "</div>")
                    .addClass("dropdown")
                    .appendTo(ul);
            };
    };
    yelpAutocomplete();

    //jPList readiness checker
    $('#demo').jplist({
        itemsBox: '.list',
        itemPath: '.list-item',
        panelPath: '.jplist-panel'
    });

    //Function to push Yelp API return object's parameters to Firebase
    function saveToFireBase(name, addr1, addr2, phone, rating, photo, website) {
        var newChildRef = database.ref().push({
            dbRestaurantName: name,
            dbAddress1: addr1,
            dbAddress2: addr2,
            dbPhoneNumber: phone,
            dbRating: rating,
            dbPhoto: photo,
            dbWebsite: website,
        });
    }

    //Add an event listener to the database to pass parameters and evoke function to render Bootstrap cards when a new restaurant is added to thedatabase and on window load-load
    database.ref().on("child_added", function (snapshot) {
        //Assign database values to variables
        var sv = snapshot.val();
        console.log(snapshot);
        //console log the unique Firebase ID
        console.log(snapshot.key);

        //if sv has dbDate, then take date and display it
        //if the date does not exist (which it may not initially) then display an empty string.
        console.log(" Does date field exist? '" + sv.hasOwnProperty('dbDate').toString() + "'");
        var dateVar = "";
        if (sv.hasOwnProperty('dbDate')) {
            dateVar = sv.dbDate;
        }

        renderCards(snapshot.key,
            sv.dbPhoto,
            sv.dbRestaurantName,
            sv.dbAddress1,
            sv.dbAddress2,
            sv.dbPhoneNumber,
            sv.dbRating,
            dateVar
        )

        $(function () {
            $(".datepicker").datepicker();
        });
    });

    //Main function that calls Yelp API when a user enters a location and restaurant
    function retrieveAndDisplayRecordsViaYelpAPI() {
        //Grab user input
        var restaurantName = $("#restaurant-name").val().trim();
        //Empty user input values
        $("#restaurant-name").val("");

        var settings = buildSearchSettings(restaurantName);

        //Initiating Ajax call
        $.ajax(settings).done(function (response) {
            //JSON parameters based on the business search that returns an array
            var responseObject = response.businesses[0];
            firebaseDataPrep(responseObject);
        }); //end of AJAX
    } //end function retrieveAndDisplayRecordsViaYelpAPI()

    function firebaseDataPrep(responseObject) {
        var name = responseObject.name;
        var address1 = responseObject.location.display_address[0];
        var address2 = responseObject.location.display_address[1];
        var phoneNumber = responseObject.display_phone;
        var rating = responseObject.rating;
        var photo = responseObject.image_url;
        var website = responseObject.url;
        saveToFireBase(name, address1, address2, phoneNumber, rating, photo, website);
    }

    function buildSearchSettings(restaurantName) {
        return {
            "async": true,
            "crossDomain": true,
            "url": "https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?location=" + globalCity + "," + globalState + "&term=" + restaurantName + "&limit=8",
            "method": "GET",
            "headers": {
                "authorization": "Bearer UVD6_jknwmi1GkRxFFkWh7HX-JV_TrlieWHvaSMfi69lmcN6MPUUxk5EGJNnUWmLD3TV5vtrZ25whGiC9gmJRUbhEW5lz3Y6hOXT5oAS-WqK7U5TA772Lt4tBqlaWnYx",
                "Cache-Control": "no-cache",
            }
        };
    }

    //function to render cards using arguments passed in 
    function renderCards(id, photo, name, address1, address2, phoneNumber, rating, date) {
        // var webLink = $("<a>").attr({
        //     "id":"url",
        //     "href":website,
        //     "target":"_blank"
        // });
        //Restaurant image
        var displayImage = $("<img>").attr({
            "src": photo,
            "id": "image",
            "class": "card-img-top"
        });

        //Restaurant name
        var displayName = $("<h4>").attr({
            "id": "name",
            "class": "card-title"
        });
        displayName.text(name);

        // Address display
        var addressHeader = $("<h6>").text("Address");
        var displayAddress = $("<p>").attr({
            "id": "address",
            "class": "card-text"
        });
        displayAddress.html(address1 + '<br />' + address2);

        // Phone number display
        var phoneHeader = $("<h6>").text("Phone Number");
        var displayPhone = $("<p>").attr({
            "id": "phone",
            "class": "card-text"
        });
        displayPhone.text(phoneNumber);

        //Rating
        var ratingHeader = $("<h6>").text("Rating");
        var displayRating = $("<p>").attr({
            "class": "card-text rating"
        });

        displayRating.raty({
            readOnly: true,
            score: rating,
            path: "assets/images"
        })

        //Adding button
        var addDateButton = $("<button>").attr({
            "type": "button",
            "class": "add-date btn btn-primary btn-sm",
            "id": id
        });
        addDateButton.text("Add Date");

        var datePicker = $("<input>").attr({
            "class": "datepicker form-control-sm",
            "type": "text",
        });

        //adding date to date input field
        datePicker.val(date);

        var deleteRestaurant = $("<button>").attr({
            "id": "remove-restaurant",
            "type": "submit",
            "class": "fa fa-trash-o",
            "fid": id
        });

        //Putting together the card       
        var cardColumn = $("<div>").addClass("col-sm-3", displayName);
        var card = $("<div>").addClass("card h-100");
        var cardBlock = $("<div>").addClass("card-block");
        $(".row").prepend(cardColumn);
        card.append(displayImage).append(displayName).append(addressHeader).append(displayAddress).append(phoneHeader).append(displayPhone).append(ratingHeader).append(displayRating).append(datePicker).append(addDateButton).append(deleteRestaurant);
        card.prependTo(cardColumn);
    } //end of renderCards function

    $(".container").on("click", ".add-date", function (event) {
        //get the date from the date text field
        var indate = $(this).parent().children("input").val().trim();
        //get firebase id from the 'add-date' button that was clicked
        var firebaseId = $(this).attr("id");
        console.log("In add-date firebaseId is=" + firebaseId);

        //add the date info to the database
        database.ref().child(firebaseId).update(
            { dbDate: indate }
        );
    });

    //remove a restaurant
    $(".container").on("click", ".fa-trash-o", function (event) {
        event.preventDefault();
        var firebaseId = $(this).attr("fid");
        console.log("trash button clicked with firebase id=" + firebaseId);
        console.log("removing object with firebase id=" + firebaseId);
        var deleteResult = database.ref().child(firebaseId).remove(function (error) {
            console.log("During remove of " + firebaseId + " an error occurred " + error);
        });
        //refresh browser to reload database
        window.location.reload();
    });
});