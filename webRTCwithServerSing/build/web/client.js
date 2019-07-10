/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var host = window.location.host.split(":");  
var connection = new WebSocket('ws://' + host[0] + ':6503'); 
var name = "";
var receiveChannel;
var loginInput = document.querySelector('#loginInput'); 
var loginBtn = document.querySelector('#loginBtn'); 

var otherUsernameInput = document.querySelector('#otherUsernameInput'); 
var connectToOtherUsernameBtn = document.querySelector('#connectToOtherUsernameBtn'); 
var msgInput = document.querySelector('#msgInput'); 
var sendMsgBtn = document.querySelector('#sendMsgBtn'); 
var connectedUser, myConnection, dataChannel;
var showMsg = document.querySelector('#showMsg');  
//when a user clicks the login button 
loginBtn.addEventListener("click", function() { 
   name = loginInput.value; 	
   if(name.length > 0) { 
      send({ 
         type: "login", 
         name: name 
      }); 
   } 
}); 
 
//handle messages from the server 
connection.onmessage = function (message) { 
   console.log("MESSAGE WEBSOCKET", message.data); 
   var data = JSON.parse(message.data); 
	
   switch(data.type) { 
      case "login": 
         onLogin(data.success); 
         break; 
      case "offer": 
         onOffer(data.offer, data.name); 
         break; 
      case "answer":
         onAnswer(data.answer); 
         break; 
      case "candidate": 
         onCandidate(data.candidate); 
         break; 
      default: 
         break; 
   } 
}; 
 
//when a user logs in 
function onLogin(success) { 

   if (success === false) { 
      alert("oops...try a different username"); 
   } else { 
      //creating our RTCPeerConnection object 
      var configuration = { 
         "iceServers": [{ "url": "stun:stun.1.google.com:19302" }]
//           "iceServers": [{ "url": "stun:stun.localhost:19302" }] 

      };
//      myConnection = new webkitRTCPeerConnection(configuration, {
      myConnection = new RTCPeerConnection(configuration, { 
//         optional: [{RtpDataChannels: true}] 
      }); 
//      myConnection = new RTCPeerConnection(configuration); 
		
      console.log("RTCPeerConnection object was created"); 
      console.log(myConnection); 
  
      //setup ice handling 
      //when the browser finds an ice candidate we send it to another peer 
      myConnection.onicecandidate = function (event) { 
        if (event.candidate) { 
            console.log("event Candidatte send to websocket: ",event);		

            send({ 
               type: "candidate", 
               candidate: event.candidate 
            });
         } 
      };
      
      myConnection.ondatachannel = receiveChannelCallback;
		
      openDataChannel();

		
   } 
};
  
connection.onopen = function () { 
   console.log("Connected"); 
}; 
 
connection.onerror = function (err) { 
   console.log("Got error", err); 
};

function receiveChannelCallback(event) {
  console.log('Receive Channel Callback');
  receiveChannel = event.channel;
  receiveChannel.onmessage = onReceiveMessageCallback;
  receiveChannel.onopen = onReceiveChannelStateChange;
//  receiveChannel.onclose = onReceiveChannelStateChange;
}

function onReceiveMessageCallback(event) {
  console.log('Received Message');
  console.log(event.data)
  showMsg.value = event.data;
}

function onReceiveChannelStateChange() {
  var readyState = receiveChannel.readyState;
  console.log('Receive channel state is: ', readyState);
}
  
// Alias for sending messages in JSON format 
function send(message) { 
   if (connectedUser) { 
      message.name = connectedUser; 
   }
   connection.send(JSON.stringify(message)); 
};

//setup a peer connection with another user 
//paso 1 crea offer
connectToOtherUsernameBtn.addEventListener("click", function () {
  
   var otherUsername = otherUsernameInput.value;
   connectedUser = otherUsername;
	
   if (otherUsername.length > 0) { 
      //make an offer 
      myConnection.createOffer(function (offer) { 
         console.log(); 
			
         send({ 
            type: "offer", 
            offer: offer 
         }); 
			
         myConnection.setLocalDescription(offer); 
      }, function (error) { 
         alert("An error has occurred."); 
      }); 
   } 
});
  
//when somebody wants to call us 
//paso2 recibo la offer
function onOffer(offer, name) { 
   connectedUser = name; 
   myConnection.setRemoteDescription(new RTCSessionDescription(offer));
	
   myConnection.createAnswer(function (answer) { 
      myConnection.setLocalDescription(answer); 
		
      send({ 
         type: "answer", 
         answer: answer 
      }); 
		
   }, function (error) { 
      alert("oops...error"); 
   }); 
}

//when another user answers to our offer 
//paso3 el usuario que envio la llamada recibela respuesta del otro usuario
// como answer
function onAnswer(answer) { 
   myConnection.setRemoteDescription(new RTCSessionDescription(answer)); 
}
//when we got ice candidate from another user 
function onCandidate(candidate) {

myConnection.addIceCandidate(new RTCIceCandidate(candidate)).then(

//        myConnection.addIceCandidate(candidate).then(
            onAddIceCandidateSuccess,
            onAddIceCandidateError);
       console.log('Remote ICE candidate: ', candidate);
       myConnection.onopen = onSendChannelStateChange;
//       myConnection.onclose = onSendChannelStateChange;
       
}

function onSendChannelStateChange() {
  var readyState = myConnection.readyState;
  console.log('Send channel state is: ', readyState);
//  if (readyState === 'open') {
//    dataChannelSend.disabled = false;
//    dataChannelSend.focus();
//    sendButton.disabled = false;
//    closeButton.disabled = false;
//  } else {
//    dataChannelSend.disabled = true;
//    sendButton.disabled = true;
//    closeButton.disabled = true;
//  }
}

function onAddIceCandidateSuccess(){
    console.log("AddIceCandidate success.");
}
function onAddIceCandidateError(event){
    console.log('Failed to add Ice Candidate: ', event);
}
//creating data channel 
function openDataChannel() { 
   console.log("Open Channel"); 
   var dataChannelOptions = { 
      reliable:true 
   }; 
	
   dataChannel = myConnection.createDataChannel("myDataChannel", dataChannelOptions);
	
   dataChannel.onerror = function (error) { 
      console.log("Error:", error); 
   };
	
   dataChannel.onmessage = function (event) {
      console.log("evento RTC onmessage");
      console.log(event.data); 
   };  
}
  
//when a user clicks the send message button 
sendMsgBtn.addEventListener("click", function (event) { 
   var val = msgInput.value; 
   console.log("send message: ",msgInput.value);
   console.log("State Channel " + dataChannel.readyState);
   dataChannel.send(val); 
});