const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/https");
const logger = require("firebase-functions/logger");

setGlobalOptions({ maxInstances: 10 });

exports.hello = onRequest((req, res) => {
  logger.info("Hello endpoint called!");

  res.json({
    success: true,
    message: "Firebase backend works!"
  });
});