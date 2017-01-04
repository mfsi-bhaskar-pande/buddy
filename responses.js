var RESPONSECODE_UNEXPECTEDUSER = 1004;


function getMessage(error, result, responseCode) {
	var response = {};
	response.responseCode= (responseCode)?responseCode:0;
	if (error)
		response.error = error.toString();
	if (result)
		response.result = (typeof result !== "string") ? JSON.stringify(result) : result;
	return JSON.stringify(response);
};

/** Helper function to set server response to return HTTP 500 */
exports.internalServerError = function (response, error) {	
	if (response) {
		response.writeHead(500, {
			"Content-Type" : "application/json"
		});
		var msg = error ? getMessage(error) : "{error: Internal Server Error}";
		response.end(msg);
	}
};

/** Helper function to set server response to return HTTP 400 */
exports.badrequest = function(response, error){	
	if (response) {
		response.writeHead(400, {
			"Content-Type" : "application/json"
		});
		var msg = error ? getMessage(error) : "{error: Bad Request}";
		response.end(msg);
	}	
};

/** Helper function to set server response to return HTTP 404 */
exports.resNotFound = function(response, error){	
	if (response) {
		response.writeHead(404, {
			"Content-Type" : "application/json"
		});
		var msg = error ? getMessage(error) : "{error: Resource Not Found}";
		response.end(msg);
	}	
};

/** Helper function to set server response to return HTTP 200 */
exports.success = function(response, result) {
	if (response) {
		response.writeHead(200, {
			"Content-Type" : "application/json"
		});
		var msg = result ? getMessage(null, result) : "{result: Success}";
		response.end(msg);
	}
};

exports.unexpectedUser = function(response){
	if(response){
		response.writeHead(200, {
			"Content-Type" : "application/json"
		});
		var result = {
				message: "Unexpected User"
		};
		var msg = getMessage(null, result, RESPONSECODE_UNEXPECTEDUSER);
		response.end(msg);
	}	
};
