/**
 * Dependencies
 */
var _        = require('underscore'),
    mongoose = require('mongoose'),
    Schema   = mongoose.Schema,
    suburbSchema;

/**
 * Setup
 */
suburbSchema = new Schema({
    _id: Number,
    _region: { type: Number, ref: 'Region' },
    name: String,
    latitude: Number,
    longitude: Number,
    stats: [{ type: Schema.Types.ObjectId, ref: 'Stat'}]
});

/**
 * Indexes
 *
 * There should be only a single entry for each suburb, for each region.
 */
 suburbSchema.index({ _id: 1, _region: 1 }, { unique: true });

/**
* Statics
*/

/**
 * Update (or insert) a suburb into the database
 *
 * @method upsert
 * @param  {Object} config
 *         @param {Number}   config.id         The suburb ID
 *         @param {String}   config.name       The suburb name
 *         @param {Number}   config.region     The region ID the suburb belongs to
 *         @param {Function} [config.callback]
 */
suburbSchema.statics.upsert = function (config) {
    var Suburb = this;

    Suburb.update({ _id: config.id }, {
        name: config.name,
        _region: config.region
    }, { upsert: true }, function (err) {
        if (err) throw err;

        if (typeof config.callback === 'function') {
            config.callback();
        }
    }.bind(this));
};

/**
 * Sync suburbs with the given API
 *
 * This will load all suburbs for the given region
 *
 * @method sync
 * @param  {Object} config
 *         @param {Integer}   config.region A region ID to sync suburbs for
 *         @param {Interface} config.api    An instance of the trademe API interface
 *         @param {Function}  config.callback
 */
suburbSchema.statics.sync = function (config) {
    var api          = config.api,
        regionId     = config.region,
        callback     = config.callback,
        Suburb       = this,
        count        = 0,
        totalSuburbs = 0,
        handleResponse,
        handleRegion;

    handleResponse = function (regions) {
        _.each(regions, function (thisRegion) {
            // For each region (Northland, Auckland, Waikato, etc...)
            if (thisRegion.LocalityId === regionId) {
                // Find the region we are interested in
                _.each(thisRegion.Districts, function (thisDistrict) {
                    // For each district (Auckland City, Rodney, etc...)
                    totalSuburbs += thisDistrict.Suburbs.length;
                    _.each(thisDistrict.Suburbs, function (thisSuburb) {
                        // For each suburb (City Centre, Manukau, Ponsonby, Grey Lynn, etc...)
                        // Upsert the Suburb
                        Suburb.upsert({
                            id: thisSuburb.SuburbId,
                            name: thisSuburb.Name,
                            region: regionId,
                            callback: function () {
                                count++;

                                if (count === totalSuburbs) {
                                    callback();
                                }
                            }.bind(this)
                        });
                    }.bind(this));
                }.bind(this));
            }
        }.bind(this));
    };

    api.getLocalities(handleResponse.bind(this));
};

/**
 * Export
 */
module.exports = mongoose.model('Suburb', suburbSchema);
