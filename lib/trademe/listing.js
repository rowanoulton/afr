/**
 * @class Listing
 * @constructor
 * @param data {Object} Data from the API
 */
function Listing (data) {
    this.data       = data;
    this.properties = this._getRelevantInformation();
    this.valid      = this._isValid();
};

/**
 * Get a property
 *
 * @method get
 * @param  {String} key The key of the requested property
 * @return {Mixed}  value
 */
Listing.prototype.get = function (key) {
    return this.properties[key];
};

/**
 * Return boolean flag as to whether listing is valid for use
 *
 * @method isValid
 * @return {Boolean}
 */
Listing.prototype.isValid = function () {
    return this.valid;
};

/**
 * Perform check against listing properties to determine if it has the requisite information to be included in
 * our statistics
 *
 * Listings must have at least a price and number of bedrooms specified
 *
 * @private
 * @method _isValid
 * @return {Boolean}
 */
Listing.prototype._isValid = function () {
    return (typeof this.get('price') !== 'undefined' && typeof this.get('bedrooms') !== 'undefined');
};

/**
 * Filter api data and return only the information we are interested in
 *
 * @private
 * @method _getRelevantInformation
 * @return {Object}
 */
Listing.prototype._getRelevantInformation = function () {
    return {
        id: this.data.ListingId,
        suburb: this.data.SuburbId,
        bedrooms: this.data.Bedrooms,
        price: this.data.RentPerWeek,
        price_per_room: (this.data.RentPerWeek / this.data.Bedrooms)
    };
};

/**
 * Export
 */
module.exports = Listing;
