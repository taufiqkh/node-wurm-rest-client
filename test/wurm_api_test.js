"use strict";
/**
 * Unit tests for Wurm client
 */
const sinon = require('sinon');
const expect = require('chai').expect;
const rest = require('rest');

const wurmApi = require('../wurm_api');

/**
 * Create a mock HTTP response with the given status code and data
 */
var createHttpResponse = function(statusCode, entity) {
  return {
    status: {
      code: statusCode
    },
    headers: {},
    entity
  };
};

var createOkResponse = createHttpResponse.bind(undefined, 200);

/**
 * Creates a rest stub as a promise. This stub is a function with wrap stubbed. Each call to wrap
 * will save the interceptor and config as the following object in the responseHolder's calls array:
 * <pre>
 *   {
 *    interceptor: <interceptor>,
 *    options: <options>
 *   }
 * </pre>
 * @param responseHolder
 * @return rest stub
 */
function createRestStub(responseHolder) {
  let stubRest = function(data) {
    return new Promise(function(resolve, reject) {
      if (responseHolder.validate && !responseHolder.validate(data)) {
        reject(data);
      }
      resolve(responseHolder.response);
    });
  };
  stubRest.wrap = function(interceptor, options) {
    responseHolder.calls.push({interceptor, options});
    return stubRest;
  };
  return stubRest;
}

describe('wurm', function() {
  before(function() {
    this.wrap = sinon.stub(rest, 'wrap');
    this.responseHolder = { calls: [] };
    this.wrap.returns(createRestStub(this.responseHolder));

    this.wurm = wurmApi('apiKey');
  });

  after(function() {
    rest.wrap.restore();
  });

  afterEach(function() {
    this.responseHolder.response = undefined;
    this.responseHolder.validate = undefined;
    this.responseHolder.calls = [];
  });

  describe('#getStatus', function() {
    /**
     * HTTP OK with status connected
     */
    it('OK status with running and connected', function() {
      this.responseHolder.response = createOkResponse(
        {running: true, connected: true, timeStamp: '2016-05-31T10:54:25.140Z'});
      return this.wurm.getStatus()
        .then(function(result) {
          expect(result).to.be.not.null;
        })
    });
  });
});