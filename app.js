/**
 * Module dependencies.
 */

var express = require('express'), routes = require('./routes'), user = require('./routes/user'), http = require('http'), path = require('path');

var fcmxmpp = require("./fcmxmpp");
var userdb = require("./usersdb");
var responseHelper = require("./responses");

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

app.get("/getAllUsers", function(request, response) {

	try {
		userdb.fetchAllUsers(function(error, document) {
			if (document) {
				responseHelper.success(response, document);
			} else {
				responseHelper.badrequest(response, error);
			}
		});
	} catch (error) {
		responseHelper.badrequest(response, error);
	}

});

app.post("/addUser", function(request, response) {

	try {
		var userName = request.body.userName;
		var fcmToken = request.body.fcmToken;

		if (userName && fcmToken) {

			userdb.insertNewUser(userName, fcmToken, function(error, document) {

				if (error) {
					responseHelper.badrequest(response, error);
				} else if (document) {
					responseHelper.success(response, document);
				} else {
					responseHelper.internalServerError(response, null);
				}

			});

		} else {
			throw new Error("Request Incomplete");
		}
	} catch (error) {
		responseHelper.badrequest(response, error);
	}

});

http.createServer(app).listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));

});
