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
 * Export
 */
module.exports = mongoose.model('Suburb', suburbSchema);
