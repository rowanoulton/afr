/**
 * Dependencies
 */
var _ = require('underscore');

/**
 * @class Region
 * @constructor
 * @param config {Object}
 *        @param {Number} config.id  ID of region to lookup in API
 *        @param {Object} config.api API class to use for making requests
 */
function Region (config) {
    this.id     = config.id;
    this.api    = config.api;
    this.listings  = [];
    this.pageNo = 1;
};

/**
 * Fetch entire set of listings for this region
 *
 * @method fetch
 * @param  {Function} callback Function to pass the full set of listings to
 */
Region.prototype.fetch = function (callback) {
    var requestCallback;

    /*
     * Recursive function for loading every page of listings available
     *
     * @method requestCallback
     * @param  {Object} data Response data from the API
     */
    requestCallback = function (data) {
        if (this._pageHasListings(data)) {
            // Add page of results if it contains listings
            this._addPage(data);
        }

        if (this._isLastPage(data)) {
            // Fetching has been completed, handover full set of data to original callback
            callback(this.listings);
        } else {
            // Proceed to request the next page and recurse
            this.pageNo++;
            this._fetchPage(requestCallback);
        }
    };

    // Begin fetching first page
    this.listings = [];
    this.pageNo   = 1;
    this._fetchPage(requestCallback);
};

/**
 * Fetch a single page via the API
 *
 * @private
 * @method _fetchPage
 * @param  {Function} callback
 */
Region.prototype._fetchPage = function (callback) {
    var requestParams = {
        region: this.id,
        page: this.pageNo
    };

    this.api.get(requestParams, callback.bind(this));
};

/**
 * Add a new page of listings to our existing collection.
 *
 * All non-unique items are excluded via underscores `union` function
 *
 * @private
 * @method _addPage
 * @param {Object} page
 */
Region.prototype._addPage = function (page) {
    this.listings = _.union(this.listings, page.List);
};

/**
 * Check whether a given page has any listings
 *
 * @private
 * @method  _pageHasListings
 * @param  {Object} page
 * @return {Boolean}
 */
Region.prototype._pageHasListings = function (page) {
    return (page.List.length > 0);
};

/**
 * Check whether a given page is the last in the series
 *
 * @private
 * @method _isLastPage
 * @param  {Object}  page
 * @return {Boolean}
 */
Region.prototype._isLastPage = function (page) {
    var estimatedRowsFetched = (this.pageNo * this.api.getPageSize()),
        totalRows            = page.TotalCount;

    return (estimatedRowsFetched >= totalRows);
};

/**
 * Export
 */
module.exports = Region;
