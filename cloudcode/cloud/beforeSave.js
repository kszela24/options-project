var _ = require('underscore');
var Tally = Parse.Object.extend("Tally");
Parse.Cloud.useMasterKey();

Parse.Cloud.beforeSave("Twit", function(request, response) {
	var queryCheckTwits = new Parse.Query("Twit");
	queryCheckTwits.equalTo("twitID", request.object.get("twitID"));
	queryCheckTwits.first().then(function(existingObject) {
		if (existingObject) {
			response.error("Twit has already been saved.");
		} else {
			console.log("\n\nSaving Twit " + request.object.get("twitID"));
			response.success();
		}
	});
});