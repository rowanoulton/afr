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
 * @param config {Object}
 *        @param {String}  config.token Oauth token for requests to the API
 */
function Interface (config) {
    this.token    = config.token;
    this.params   = {
        oauth_token: this.token
    };
};

/**
 * Request data from Trademe
 *
 * @method getListings
 * @param  {Object} config
 *         @param {Object}   config.params Request parameters
 *         @param {Function} config.callback The callback to pass the response to
 */
Interface.prototype.getListings = function (config) {
    var params        = config.params,
        callback      = config.callback,
        // Extend using an empty object as the destination. This is to prevent this.params being modified.
        // Also force pagination to 500 rows as this is the max for authenticated requests
        requestParams = _.extend({}, this.params, params, { rows: PAGESIZE });

    request.get({
        url: this.getUri(METHODS.listing),
        qs: requestParams,
        json: true
    }, function (err, response, data) {
        if (err) throw err;
        callback(data);
    });
};

Interface.prototype.getLocalities = function (callback) {
    request.get({
        url: this.getUri(METHODS.locale),
        qs: this.params,
        json: true
    }, function (err, response, data) {
        if (err) throw err;
        callback(data);
    });
};

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
    return pageSize;
};

/**
 * Export
 */
module.exports = Interface;
