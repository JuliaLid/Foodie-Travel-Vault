//Declare global variables

var database = firebase.database();

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