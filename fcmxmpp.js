var xmpp = require("node-xmpp");
var parser = require("xml2js").parseString;
var user = require("./usersdb");

var SENDERID = process.env.BUDDY_SENDER_ID;
var APIKEY = process.env.BUDDY_API_KEY;

var xmppClient = new xmpp.Client(
		{
			jid : SENDERID+"@gcm.googleapis.com",
			password : APIKEY,
			host : "fcm-xmpp.googleapis.com",
			port : "5236",
			legacySSL : true,
			preferredSaslMechanism : 'PLAIN'
		});

xmppClient.on('online', function() {
	console.log("online");
	//exports.sendMessage();
});

function sendAckMessage(fcmToken, messageId){
	
   
	var jsonpayload = JSON.stringify(
	{
		to: fcmToken,
	    message_id: messageId,
	    message_type:"ack"
	}		
	);	
	var stanza = "<message id=\"\"><gcm xmlns=\"google:mobile:data\">"+jsonpayload+"</gcm></message>";
	xmppClient.send(stanza);
}


xmppClient.on('stanza', function(stanza){
	
	console.log("FETCH ========>"+stanza);
	parseStanza(stanza, function(error, gcm){
	
		if(gcm){
			
			var type = gcm.message_type;
			switch(type){
			case "ack":
				break;
			case "nack":
				break;
			default:
				var data = gcm.data;
			    var senderFcmToken = gcm.from;
			    var msgId = gcm.message_id;			   
			    
			    sendAckMessage(senderFcmToken,msgId);	
			    
			    var receipientName = data.action_to;
			    var senderName = data.action_from;
			    var receipientMessage = data.action_message;
			    
			    console.log("ACK: "+senderFcmToken+","+msgId+",MSG: "+receipientName+","+senderName+","+receipientMessage);
			    
			    fetchTokenAndSend(receipientName,senderName, receipientMessage);			    
				break;
			}
			
		}else{
			
			console.log("data is null")
			
		}
		
	});
	
});





function parseStanza(stanza, callback){

	parser(stanza, function(err,result){
		
		var jsonData = JSON.stringify(result);
		
		console.log("=1==>"+jsonData);
		
		var jsonObject = JSON.parse(jsonData);
		var resultString = jsonObject.message.gcm;
		if(!resultString){
			resultString = jsonObject.message["data:gcm"][0]._;
		}else{
			resultString = jsonObject.message.gcm[0]._;
		}
		
		callback(err, (JSON.parse(resultString)));
		
	});
	
}




exports.sendMessage = function(fcmToken, sender, message){
	
	var date = Date.now();
	
	var jsonpayload = JSON.stringify(
	{
		message_id:"450754775622_"+date,
		to: fcmToken,
		notification:{
			title: sender,
			body: message
		},
		time_to_live: 600
	}		
	);
	
	var stanza = "<message id=\"\"><gcm xmlns=\"google:mobile:data\">"+jsonpayload+"</gcm></message>";
	xmppClient.send(stanza);
	
};

function fetchTokenAndSend(userName,senderName, message){
	
	function onUserFound(error, document){
		
		if(document){
			exports.sendMessage(document.user_deviceFcmToken,senderName,message);
		}else{
			console.log("Could Not find User.");		
		}		
	}
	user.searchUniqueUser(userName, onUserFound);	
};