var mongoose = require("mongoose");

var mongoURL = "mongodb://localhost/buddy";
mongoose.connect(mongoURL);

var db = mongoose.connection;

var userSchema = mongoose.Schema({
	user_name : {type: String, index: {unique: true}},
	user_deviceFcmToken : {type: String, index: {unique: true}}
});
var UserModel;


db.on("error", function() {
	console.log("ERROR CONNECTING TO: "+mongoURL);
	console.log("ERROR OPENING CONNECTION");
});



db.on("open", function(){
	
	UserModel =  mongoose.model("Users",userSchema);
	
});

exports.searchUniqueUser = function(userName, callback){
	
	var match = {
			user_name : userName
	};
	UserModel.findOne(match, null, function(error, document){
		
		callback(error, document);		
		
	});
	
};

exports.fetchAllUsers = function(callback){
	
	var selection = "user_name";
	
	UserModel.find(null, selection, function(error, document){
		callback(error, document);
	});
	
	
};

exports.insertNewUser = function(userName, fcmToken, callback){
	
	exports.searchUniqueUser(userName, function(error, document){
		if(error){
			callback(error, null);			
		}else if(document){
			//var docError = new Error("User Already Exists");
			//callback(docError, null);			
			var instance = {
					user_name: document.userName,
					user_deviceFcmToken: fcmToken
			};
			new UserModel(instance).save(function(error, document){
				callback(error, document);
			});			
			
		}else{
			var instance = {
					user_name: userName,
					user_deviceFcmToken: fcmToken
			};
			new UserModel(instance).save(function(error, document){
				callback(error, document);
			});
		}
	});
	
};

