"use strict";

/**
 * Client for the Wurm REST API, as specified at https://taufiqkh.github.io/wurmrest/
 */
const rest = require('rest');
const mime = require('rest/interceptor/mime');
const pathPrefix = require('rest/interceptor/pathPrefix');

const DEFAULT_HOST = "localhost";
const DEFAULT_PORT = 80;

const HTTP_OK = 200;

/**
 * Compose a function that will take the given error message and log an error with that message,
 * returning a Promise.reject with the error.
 * @param message Message to log.
 * @return {Function}
 */
function composeErr(message) {
  return function(e) {
    console.error(message);
    return Promise.reject(e);
  }
}

/**
 * Creates a standardised error object, with error and details keys. Error contains a message with
 * error information, while details contains any additional messages or objects that were passed
 * pack. If details is not provided it will default to an empty object.
 * @param message Message to assign to the error key
 * @param details Details provided.
 * @return {{error: *, details: {}}}
 */
function createError(message, details) {
  return {error: message, details: details ? details : {}};
}

/**
 * Validates responses of the given response type, checking the res status and the response contents
 * and then returning a Promise rejection or resolution.
 * @param responseType Name of API response, eg. status check, used for logging
 * @param response Rest response object
 * @returns {Promise} Function callable with func(contents), where contents is the
 * contents of the response. Contents is expected to be an object of the following form:
 * <pre>
 * {
 *  ok: [true|false]
 *  [, error: message]
 * }
 * </pre>
 */
function validateResponse(responseType, response) {
  console.log(responseType + ' returned');
  let errorMessage = null;
  let entity = response.entity;
  if (response.status.code !== HTTP_OK) {
    errorMessage = responseType + ' not ok, status code: ' + response.status.code;
  } else {
    if (!entity) {
      errorMessage = responseType + ' response entity is falsey';
    } else if (entity.error) {
      let message = (entity.message) ? entity.message : "[no message provided]";
      errorMessage = responseType + ' returned error: ' + entity.message;
    } else {
      console.log(responseType + ' returned without error');
      return Promise.resolve(entity);
    }
  }
  console.log(errorMessage);
  return Promise.reject(createError(errorMessage, response));
}

module.exports = (customOptions) => {
  let options = Object.assign({host: DEFAULT_HOST, port: DEFAULT_PORT}, customOptions);
  let baseUrl = 'http://' +
    options.host +
    options.port == 80 ? "" : ":" + options.port +
    '/';
  let client = rest
    .wrap(mime, {mime: 'application/json', accept: 'application/json'})
    .wrap(pathPrefix, baseUrl);
  const apiGet = function apiGet(path) {
    return client({path: path}).catch(
      composeErr('Unable to contact API provider at ' + baseUrl + path)
    );
  };

  return {
    options: options,

    /**
     * Checks whether or not the game server is currently running.
     */
    getStatus() {
      return apiGet('/server/status')
        .then(validateResponse.bind(this, 'getStatus'))
        .catch(function onGetStatusError(err) {
          let message = "Status check error, problem with response";
          console.log(message);
          return Promise.reject(createError(message, err));
        });
    }
  }
};