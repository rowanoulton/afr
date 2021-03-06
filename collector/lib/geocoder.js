/**
 * Dependencies
 */
var _        = require('underscore'),
    Suburb   = require('../models/suburb'),
    Region   = require('../models/region'),
    geo      = require('node-geocoder'),
    geocoder = geo.getGeocoder('google', 'http');

/**
 * Shared variables
 */
var retryTimeout = 500;

/**
 * @class Geocoder
 * @constructor
 * @param {Object} config
 *        @param {Number} config.regionId      The region ID
 *        @param {String} [config.regionName]  The region name. Used only for logging purposes
 */
function Geocoder (config) {
    this.regionId      = config.regionId;
    this.regionName    = config.regionName;
    this.suburbs       = [];
    this.totalSuburbs  = 0;
};

/**
 * Begin geocoding
 *
 * @method start
 */
Geocoder.prototype.start = function () {
    this.load(function () {
        this.iterate(this.suburbs.pop());
    }.bind(this));
};

/**
 * Load suburbs missing latitude/longitude information from the database
 *
 * @method load
 * @param  {Function} callback
 */
Geocoder.prototype.load = function (callback) {
    Suburb
        .find({
            $and: [
                { _region: this.regionId },
                { $or: [
                    { latitude: { $exists: false } },
                    { longitude: { $exists: false } }
                ]}
            ]
        })
        .populate('_region')
        .exec()
        .then(function (suburbs) {
            console.log('🌏  -> ' + (suburbs.length === 0 ? 'No' : suburbs.length) + ' suburb' + (suburbs.length === 1 ? '' : 's') + ' need geocoding' + (this.regionName ? ' in ' + this.regionName : ''));
            this.suburbs      = suburbs;
            this.totalSuburbs = this.suburbs.length;

            callback();
        }.bind(this), function (err) {
            throw err;
        });
};

/**
 * Recursive function to geocode a particular suburb. If an error is encountered, the iteration will pause for a moment
 * before trying again to work around rate limiting. If multiple results are returned by the geocoding API, the first
 * one will be used.
 *
 * The suburb will be updated with the returned coordinates and saved.
 *
 * @method iterate
 * @param  {Object} suburb A mongoose document
 */
Geocoder.prototype.iterate = function (suburb) {
    var address = [suburb.name, suburb.district, suburb._region.name].join(' '),
        continueOrFinish;

    console.log('🌏  -> Geocoding ' + address);

    /**
     * If there are more suburbs to recursively loop, pop and continue, otherwise finish process with a notification
     *
     * @method continueOrFinish
     */
    continueOrFinish = function () {
        if (this.suburbs.length) {
            // Recurse with the next suburb in the list
            this.iterate(this.suburbs.pop());
        } else {
            // We are finished
            // @todo: Do we need a callback here?
            console.log('🌏  -> Geocoding has finished resolving ' + this.totalSuburbs + ' address' + (this.totalSuburbs === 1 ? '' : 's'));
        }
    };

    geocoder.geocode(address, function (err, response) {
        if (err || response.length === 0) {
            if (response.length === 0 || !_.isNull(err.message.match(/ZERO_RESULTS/))) {
                console.log('🌏  -> No results found', err);

                // Instead of throwing the error, skip to the next
                // @todo Deal properly with zero-result geocode results
                continueOrFinish.call(this);
            } else {
                console.log('🌏  -> Encountered error, will try again in ' + (retryTimeout / 1000) + ' seconds', err);

                // Instead of throwing the error, retry later to work around rate limiting
                setTimeout(function () {
                    this.iterate(suburb);
                }.bind(this), retryTimeout);
            }
        } else {
            // Notify user that geocode service has returned successfully
            console.log('🌏  -> Geocoder returned ' + response.length + ' result' + (response.length === 1 ? '' : 's'));

            // Update the suburb to include the latitude and longitude returned
            suburb.latitude  = response[0].latitude;
            suburb.longitude = response[0].longitude;
            suburb.save();

            continueOrFinish.call(this);
        }
    }.bind(this));
};

/**
 * Export
 */
module.exports = Geocoder;
