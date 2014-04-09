/**
 * Dependencies
 */
var request = require('request'),
    _       = require('underscore');

/**
 * Shared variables
 */
var endpoint = 'https://api.trademe.co.nz/v1/',
    pageSize = 500;

/**
 * @class Interface
 * @constructor
 * @param config {Object}
 *        @param {String}  config.token Oauth token for requests to the API
 *        @param {String}  method       The API Method to call
 *        @param {Boolean} [paginate]   Whether the method needs to be paginated. Defaults to true
 */
function Interface (config) {
    this.token    = config.token;
    this.method   = config.method;
    this.paginate = (_.isUndefined(config.paginate) ? true : config.paginate);
    this.params   = {
        oauth_token: this.token
    };

    // Pagination is optional. If enabled, add a paramater to specify the page size
    if (this.paginate) {
        this.params.rows = pageSize;
    }
};

/**
 * Request data from Trademe
 *
 * @method get
 * @param  {Object}   params   Query parameters
 * @param  {Function} callback The callback to pass the response to
 */
Interface.prototype.get = function (params, callback) {
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
        url: endpoint + this.method,
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
Interface.prototype.getPageSize = function () {
    return pageSize;
};

/**
 * Export
 */
module.exports = Interface;
