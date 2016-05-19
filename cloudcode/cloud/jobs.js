var _ = require('underscore');
var Tally = Parse.Object.extend("Tally");
var DailyAverage = Parse.Object.extend("DailyAverage");
Parse.Cloud.useMasterKey();

Parse.Cloud.job("deleteOldTwits", function(request, response){
	var ts = Math.round(new Date().getTime() / 1000);
	var tsYesterday = ts - (12 * 3600);
	var dateYesterday = new Date(tsYesterday*1000);

	var query = new Parse.Query("Twit");
	//Get the last 1000 twits in the last day.
	query.limit(1000);
	query.lessThan("createdAt", dateYesterday);
	query.find().then(function(results){
		var promise = Parse.Promise.as();
		_.each(results, function(result){
			promise = promise.then(function(){
				//Delete them.
				return result.destroy();
			});
		});
		return promise;
	}).then(function(){
		console.log("Deleted old twits.");
	});
});

Parse.Cloud.job("newTally", function(request, response) {
	var query = new Parse.Query("DailyAverage");
	query.descending("createdAt");
	query.first().then(function(currDailyAverage) {
		var tallyQuery = new Parse.Query("Tally");
		tallyQuery.descending("createdAt");
		tallyQuery.first().then(function(currTally) {
			//Accumulate data from current daily average and tally.
			var totalTallyPolarity = currTally.get("polarityTwits");
			var totalNumMessages = currTally.get("totalTwits");
			var totalNegativeTwits = currTally.get("negativeTwits");
			var totalPositiveTwits = currTally.get("positiveTwits");
			var totalBulls = currTally.get("bulls");
			var totalBears = currTally.get("bears");
			var currTotalNumMessages = currDailyAverage.get("totalTwits") + totalNumMessages;
			var currTotalPolarity = currDailyAverage.get("totalPolarity") + totalTallyPolarity;
			var currPositiveTwits = currDailyAverage.get("positiveTwits") + totalPositiveTwits;
			var currNegativeTwits = currDailyAverage.get("negativeTwits") + totalNegativeTwits;
			var currBulls = currDailyAverage.get("bulls") + totalBulls;
			var currBears = currDailyAverage.get("bears") + totalBears;
			var avgPolarity = 0;
			avgPolarity = currTotalPolarity / currTotalNumMessages;

			//Set current daily average values to accumulated data.
			currDailyAverage.set("totalTwits", currTotalNumMessages);
			currDailyAverage.set("totalPolarity", currTotalPolarity);
			currDailyAverage.set("avgPolarity", avgPolarity);
			currDailyAverage.set("positiveTwits", currPositiveTwits);
			currDailyAverage.set("negativeTwits", currNegativeTwits);
			currDailyAverage.set("bulls", currBulls);
			currDailyAverage.set("bears", currBears);
			
			//Save updated current daily average.
			currDailyAverage.save(null, {
				success: function() {
					//Create new tally object and set everything to 0.
					var newTally = new Tally();
					newTally.set("negativeTwits", 0);
					newTally.set("positiveTwits", 0);
					newTally.set("totalTwits", 0);
					newTally.set("polarityTwits", 0);
					newTally.set("bulls", 0);
					newTally.set("bears", 0);

					//Save new tally object.
					newTally.save(null, {
						success: function() {
							response.success();
						},
						error: function(error) {
							response.error();
						}
					});
				},
				error: function(error) {
					response.error();
				}
			});
		});
	});
});


Parse.Cloud.job("newDailyAverage", function(request, response) {
	var newDailyAverage = new DailyAverage();
	var now = new Date();
	var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	//Create new daily average object and set all values to 0.
	newDailyAverage.set("avgPolarity", 0);
	newDailyAverage.set("totalPolarity", 0);
	newDailyAverage.set("totalTwits", 1);
	newDailyAverage.set("positiveTwits", 1);
	newDailyAverage.set("negativeTwits", 1);
	newDailyAverage.set("bulls", 0);
	newDailyAverage.set("bears", 0);
	//Set the day to the current day and save.
	newDailyAverage.set("day", days[now.getDay()]);
	newDailyAverage.save(null, {
		success: function() {
			response.success();
		},
		error: function(error) {
			response.error();
		}
	});
});