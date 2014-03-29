/**
 * Dependencies
 */
var _       = require('underscore'),
    Listing = require('./listing');

/**
 * @class ListingCollection
 * @constructor
 */
function ListingCollection () {
    this.clear();
};

/**
 * Clear internal collection
 *
 * @method clear
 */
ListingCollection.prototype.clear = function () {
    this.length     = 0;
    this.listings   = [];
    this.listingIds = [];
};

/**
 * Check whether a given listing already exists in the collection
 *
 * @method contains
 * @param  {Listing} listing
 * @return {Boolean}
 */
ListingCollection.prototype.contains = function (listing) {
    return _.contains(this.listingIds, listing.get('id'));
};

/**
 * Get an array of listings sorted by suburb ID
 *
 * @method getSortedBySuburb
 * @return {Array}
 */
ListingCollection.prototype.getSortedBySuburb = function () {
    var suburbs = [];

    _.each(this.listings, function (listing) {
        var suburbId = listing.get('suburb');

        // Ensure we create an array for the suburb if one doesn't exist already
        suburbs[suburbId] = suburbs[suburbId] || [];
        suburbs[suburbId].push(listing);
    }.bind(this));

    return suburbs;
};

/**
 * Add one or many listings to the collection
 *
 * @method add
 * @param {Array|Object} data
 */
ListingCollection.prototype.add = function (data) {
    var listing;

    if (_.isArray(data)) {
        _.each(data, function (listing) {
            this._add(listing);
        }.bind(this));
    } else if(_.isObject(data)) {
        // Create listing class for this entry
        listing = new Listing(data);
        if (listing.isValid() && !this.contains(listing)) {
            // Insert listing into collection if it is valid and hasn't been added already
            this._add(listing);
        }
    }
};

/**
 * Insert a single listing into the collection
 *
 * Also insert the listings ID into a separate array for lookups
 *
 * @private
 * @method  _add
 * @param {Listing} listing
 */
ListingCollection.prototype._add = function (listing) {
    this.listings.push(listing);

    // We keep a list of included IDs so that we can easily check whether a listing has been added to our
    // collection or not
    this.listingIds.push(listing.get('id'));
    this.length++;
};

/**
 * Export
 */
module.exports = ListingCollection;
