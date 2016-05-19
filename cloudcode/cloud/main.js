
var _ = require('underscore');
var Tally = Parse.Object.extend("Tally");
var DailyAverage = Parse.Object.extend("DailyAverage");
Parse.Cloud.useMasterKey();

require('cloud/beforeSave.js');
require('cloud/afterSave.js');
require('cloud/jobs.js');

Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});
