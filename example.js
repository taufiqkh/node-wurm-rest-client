"use strict";
/**
 * This file shows how the client may be used to call on the rest API.
 */
const wurmApi = require('./wurm_api');

var wurm = wurmApi({host: 'localhost', port: 8080});

wurm.getStatus()
  .then(function onStatus(status) {
    console.log("Status check as at " + status.timeStamp + ":");
    console.log("Game server is " + (status.running ? "" : "not") + " running.");
    console.log("API is " + (status.connected ? "" : "not") + " connected");
  })
  .catch(function onError(err) {
    console.log("Error during status check: " + err.message);
  });