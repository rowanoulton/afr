/**
 * Dependencies
 */
var request = require('request'),
    _       = require('underscore');

/**
 * Shared variables
 */
var endpoint = 'https://api.trademe.co.nz/v1/Search/Property/Rental.json',
    pageSize = 500;

/**
 * @class Trademe
 * @constructor
 * @param config {Object}
 *        @param {String} config.token Oauth token for requests to the API
 */
function Trademe (config) {
    this.token  = config.token;
    this.params = {
        rows: pageSize,
        oauth_token: this.token
    };
};

/**
 * Request data from Trademe
 *
 * @method get
 * @param  {Object}   params   Query parameters
 * @param  {Function} callback The callback to pass the response to
 */
Trademe.prototype.get = function (params, callback) {
    // Extend using an empty object as the destination. This is to prevent this.params being modified.
    var requestParams = _.extend({}, this.params, params),
        requestCallback;

    /**
     * Handle response from Trademe. Throw error if encountered, otherwise pass data to callback
     *
     * @method requestCallback
     * @param  {Error}  err
     * @param  {Object} response
     * @param  {Object} data     [description]
     */
    requestCallback = function (err, response, data) {
        // @todo Handle non-200 responses
        if (err) throw err;

        callback(data);
    };

    request.get({
        url: endpoint,
        qs: requestParams,
        json: true
    }, requestCallback);
};

/**
 * Return size of pages requested
 *
 * @method getPageSize
 * @return {Integer} pageSize
 */
Trademe.prototype.getPageSize = function () {
    return this.params.rows;
};

/**
 * Export
 */
module.exports = Trademe;
