/**
 * Dependencies
 */
var request = require('request'),
    _       = require('underscore');

/**
 * Shared variables
 */
var ENDPOINT = 'https://api.trademe.co.nz/v1/',
    PAGESIZE = 500,
    DATATYPE = 'json',
    METHODS  = {
        listing: 'Search/Property/Rental',
        locale: 'Localities'
    };

/**
 * @class Interface
 * @constructor
 * @param {Object} config
 *        @param {Object} config.oauth Oauth details for requests to the API
 *            @param {String} config.oauth.consumerKey
 *            @param {String} config.oauth.consumerSecret
 */
function Interface (config) {
    this.oauth = config.oauth;

    // Specify custom Oauth header which needs only consumer key & secret (not token)
    // as per http://developer.trademe.co.nz/api-overview/authorisation/
    this.headers = {
        'Authorization': 'OAuth oauth_consumer_key="' + this.oauth.consumerKey + '", oauth_signature_method="PLAINTEXT", oauth_signature="' + this.oauth.consumerSecret + '&"'
    };
};

/**
 * Request rental listings from Trademe
 *
 * @method getListings
 * @param  {Object} config
 *         @param {Object}   config.params   Request parameters
 *         @param {Function} config.callback The callback to pass the response to
 */
Interface.prototype.getListings = function (config) {
    var params        = config.params,
        callback      = config.callback,
        // Extend using an empty object as the destination. This is to prevent this.params being modified.
        // Also force pagination to 500 rows as this is the max for authenticated requests
        requestParams = _.extend({}, params, { rows: PAGESIZE });

    console.log('📄  -> Loaded page ' + requestParams.page + ' of listings for region #' + requestParams.region);

    request.get({
        url: this.getUri(METHODS.listing),
        qs: requestParams,
        headers: this.headers,
        json: true
    }, function (err, response, data) {
        if (err) throw err;
        callback(data);
    });
};

/**
 * Request localities data from Trademe
 *
 * @method getLocalities
 * @param  {Function} callback
 */
Interface.prototype.getLocalities = function (callback) {
    request.get({
        url: this.getUri(METHODS.locale),
        headers: this.headers,
        json: true
    }, function (err, response, data) {
        if (err) throw err;
        callback(data);
    });
};

/**
 * Get the full URI for a request to trademe, based on a given method
 *
 * Combines the endpoint, method and datatype
 *
 * @method getUri
 * @param  {String} method Pointer to the method in our METHODS constant, eg METHODS.locale
 * @return {String} uri    A full string URI (e.g. "https://api.trademe.co.nz/api/v1/Localities.json")
 */
Interface.prototype.getUri = function (method) {
    return ENDPOINT + method + '.' + DATATYPE;
}

/**
 * Return size of pages requested
 *
 * @method getPageSize
 * @return {Integer} pageSize
 */
Interface.prototype.getPageSize = function () {
    return PAGESIZE;
};

/**
 * Export
 */
module.exports = Interface;
