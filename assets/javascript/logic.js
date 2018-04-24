$(document).ready(function() {
//form disable until sign in
$("#submitTrain").prop('disabled', true);
$(".btnEdit").prop('disabled', true);
//background
$("body").backstretch("assets/images/train5.jpeg");

//word scramble
 var Messenger = function(el){
  'use strict';
  var m = this;

  m.init = function(){
    m.codeletters = "&#*+%?£@§$";
    m.message = 0;
    m.current_length = 0;
    m.fadeBuffer = false;
    m.messages = [
      'Current Train Schedule',
      'Arrivals & Departures'
    ];

    setTimeout(m.animateIn, 100);
  };

  m.generateRandomString = function(length){
    var random_text = '';
    while(random_text.length < length){
      random_text += m.codeletters.charAt(Math.floor(Math.random()*m.codeletters.length));
    }

    return random_text;
  };

  m.animateIn = function(){
    if(m.current_length < m.messages[m.message].length){
      m.current_length = m.current_length + 2;
      if(m.current_length > m.messages[m.message].length) {
        m.current_length = m.messages[m.message].length;
      }

      var message = m.generateRandomString(m.current_length);
      $(el).html(message);

      setTimeout(m.animateIn, 20);
    } else {
      setTimeout(m.animateFadeBuffer, 20);
    }
  };

  m.animateFadeBuffer = function(){
    if(m.fadeBuffer === false){
      m.fadeBuffer = [];
      for(var i = 0; i < m.messages[m.message].length; i++){
        m.fadeBuffer.push({c: (Math.floor(Math.random()*12))+1, l: m.messages[m.message].charAt(i)});
      }
    }

    var do_cycles = false;
    var message = '';

    for(var i = 0; i < m.fadeBuffer.length; i++){
      var fader = m.fadeBuffer[i];
      if(fader.c > 0){
        do_cycles = true;
        fader.c--;
        message += m.codeletters.charAt(Math.floor(Math.random()*m.codeletters.length));
      } else {
        message += fader.l;
      }
    }

    $(el).html(message);

    if(do_cycles === true){
      setTimeout(m.animateFadeBuffer, 50);
    } else {
      setTimeout(m.cycleText, 5000);
    }
  };

  m.cycleText = function(){
    m.message = m.message + 1;
    if(m.message >= m.messages.length){
      m.message = 0;
    }

    m.current_length = 0;
    m.fadeBuffer = false;
    $(el).html('');

    setTimeout(m.animateIn, 200);
  };

  m.init();
}
var messenger = new Messenger($('#messenger'));



//initialize firebase
var config = {
  apiKey: "AIzaSyAeAknL1yW7rAj6JhjNVDTCzV7t5OJVjHM",
  authDomain: "fir-railways.firebaseapp.com",
  databaseURL: "https://fir-railways.firebaseio.com",
  projectId: "fir-railways",
  storageBucket: "fir-railways.appspot.com",
  messagingSenderId: "370451683022"
};
firebase.initializeApp(config);
//signIn
var txtEmail = document.getElementById('txtEmail');
var txtPass = document.getElementById('txtPass');
var btnLogin = document.getElementById('btnLogin');
var btnSignup = document.getElementById('btnSignup');
var btnLogout = document.getElementById('btnLogout');

//login
btnLogin.addEventListener('click', e => {
  //get email and pass
  var email = txtEmail.value;
  var pass = txtPass.value;
  var auth = firebase.auth();
  //sign in
  var promise = auth.signInWithEmailAndPassword(email, pass);
  promise.catch(e => console.log(e.message));
  promise.catch(e => alert("Not signed up. Please sign up first!"));

})

//sign up
btnSignup.addEventListener('click', e => {
  var email = txtEmail.value;
  var pass = txtPass.value;
  var auth = firebase.auth();
  //sign in
  var promise = auth.createUserWithEmailAndPassword(email, pass);
  promise.then(value => {$("#submitTrain").prop('disabled', false);});
  promise.then(value => {$(".btnEdit").prop('disabled', false);})
  promise.catch(e => console.log(e.message));
})

//real time auth listener
firebase.auth().onAuthStateChanged(firebaseUser => {
  if(firebaseUser) {
    console.log(firebaseUser);
    $("#modal").modal('hide');
    $("#submitTrain").prop('disabled', false);
    $(".btnEdit").prop('disabled', false);
  } else {
    console.log("not logged in");
    $("#modal").modal('show');
    $(".btnEdit").prop('disabled', true);
  }
})
//logout
btnLogout.addEventListener('click', e => {
  firebase.auth().signOut();
  setTimeout(function(){
  $("#modal").modal('show');
}, 1000);
  $("#submitTrain").prop('disabled', true);
  $(".btnEdit").prop('disabled', true);

})
//show modal
btnShowModal.addEventListener('click', e => {
  setTimeout(function(){
  $("#modal").modal('show');
}, 500);
})

//starting variables
var database = firebase.database();
var time = moment().format();
//database ref
database.ref().on("child_added", function(childSnap) {
  //variables
  var name = childSnap.val().name;
  var destination = childSnap.val().destination;
  var firstTrain = childSnap.val().firstTrain;
  var frequency = childSnap.val().frequency;
  var next = childSnap.val().next;
  var min = childSnap.val().min;
  var timeRef = childSnap.val().time;

  //create new rows of data
  $("tbody").append("<tr><td>" + name + "</td>" + "<td>" + destination + "</td>" + "<td>" + frequency + "</td>" + "<td>" + next + "</td>" + "<td>" + min + "</td>" + "<td>" + '<div class="btn-group"><button class="btn btn-warning btnEdit">Edit</button><button class="btn btn-danger btnRemove">Remove</button></div>' + "</td></tr>");
});


//grab input values on submit
$("#submitTrain").on("click", function() {
  //make variables
  var trainName = $("#trainName").val().trim();
  var destinationInput = $("#destination").val().trim();
  var departureTime = $("#departureTime").val().trim();
  var frequency = $("#departureFreq").val().trim();
  //check that all inputs are filled
  if (trainName == "" || destinationInput == "" || departureTime == "" || departureFreq == "") {
    alert("Please Fill Out The Entire Form!");
    return false;
  }
  //math for Train Info:
  //first Train
  var departureTimeConverted = moment(departureTime, "hh:mm a").subtract(1, "years");
  console.log("first train time: " + departureTimeConverted);
  //current Time
  var currentTime = moment().format("hh:mm a");
  console.log("current time: " + moment(currentTime).format("hh:mm a"));
  //time difference btwn current time and 'firstTrain'
  var timeDifference = moment().diff(moment(departureTimeConverted), "minutes");
  console.log("time difference: " + timeDifference);
  //time remaining
  var remainder = timeDifference % frequency;
  console.log(remainder);
  //min until next arrival
  var minUntilArrival = frequency - remainder;
  console.log("minutes till next arrival: " + minUntilArrival);
  //next train time
  var nextTrain = moment().add(minUntilArrival, "minutes").format("hh:mm a");

  //new train object
  var newTrain = {
    name : trainName,
    destination : destinationInput,
    firstTrain : departureTime,
    frequency : frequency,
    min : minUntilArrival,
    next : nextTrain,
    time : currentTime,
  }
console.log(newTrain);
database.ref().push(newTrain);

//clear inputs
$("#trainName").val("");
$("#destination").val("");
$("#departureTime").val("");
$("#departureFreq").val("");

});


});
