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

//console.clear();
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

//starting variables
var database = firebase.database();
//var currentTime = moment().format('LTS');
var currentTime = moment();
console.log(currentTime);
var nextArrival = "";
var minUntilArrival = "";
//database ref
database.ref().on("child_added", function(childSnap) {
  //variables
  var name = childSnap.val().name;
  var destination = childSnap.val().destination;
  var firstTrain = childSnap.val().firstTrain;
  var frequency = childSnap.val().frequency;
  var next = childSnap.val().next;
  var min = childSnap.val().min;
  //create new rows of data
  $("tbody").append("<tr><td>" + name + "</td>" + "<td>" + destination + "</td>" + "<td>" + frequency + "</td>" + "<td>" + next + "</td>" + "<td>" + min + "</td></tr>");
});

database.ref().on("value", function(snapshot) {

});

//grab input values on submit
$("#submitTrain").on("click", function() {
  //make variables
  var trainName = $("#trainName").val().trim();
  var destinationInput = $("#destination").val().trim();
  var departureTime = $("#departureTime").val().trim();
  var departureFreq = $("#departureFreq").val().trim();
  //check that all inputs are filled
  if (trainName == "" || destinationInput == "" || departureTime == "" || departureFreq == "") {
    alert("no");
    return false;
  }
  //math for Train Info:
  //subtract 1 year from 1st train
  var departureTimeConverted = moment(departureTime, "hh:mm").subtract("1, years");
  //time difference btwn current time and 'firstTrain'
  var timeDifference = currentTime.diff(moment(departureTimeConverted), "minutes");
  var remainder = timeDifference % departureFreq;
  var minUntilArrival = departureFreq - remainder;
  var nextTrain = moment().add(minUntilArrival, "minutes").format("hh:mm");

  //new train object
  var newTrain = {
    name : trainName,
    destination : destinationInput,
    firstTrain : departureTime,
    frequency : departureFreq,
    min : minUntilArrival,
    next : nextTrain,
  }
console.log(newTrain);
database.ref().push(newTrain);

//clear inputs
$("#trainName").val("");
$("#destination").val("");
$("#departureTime").val("");
$("#departureFreq").val("");

//return false;
});
