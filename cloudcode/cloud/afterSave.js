var _ = require('underscore');
var Tally = Parse.Object.extend("Tally");
Parse.Cloud.useMasterKey();

Parse.Cloud.afterSave("Twit", function(request) {
	//Get most recent tally object so we can update it.
	var query = new Parse.Query("Tally");
	query.descending("createdAt");

	query.first().then(function(currentTally) {
		//Increment the polarity by the twit's polarity.
		currentTally.increment("polarityTwits", request.object.get("Polarity"));

		//Increment totalTwits and positive or negative twits accordingly.
		if (request.object.get("Polarity") > 0) {
			currentTally.increment("positiveTwits", 1);
			currentTally.increment("totalTwits", 1);
		} else if (request.object.get("Polarity") < 0) {
			currentTally.increment("negativeTwits", 1);
			currentTally.increment("totalTwits", 1);
		}

		//Increment bulls or bears accordingly.
		if (request.object.get("sentiment") == "Bullish") {
			currentTally.increment("bulls", 1);
		} else if (request.object.get("sentiment") == "Bearish") {
			currentTally.increment("bears", 1);
		}

		//Save the updated tally object.
		currentTally.save(null, {
			success: function(tally) {
				console.log("Tally update has succeeded.");
			},
			error: function(tally) {
				console.log("Tally update has failed.");
			}
		});
	});
});