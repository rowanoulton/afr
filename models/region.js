/**
 * Dependencies
 */
var mongoose = require('mongoose'),
    Schema   = mongoose.Schema,
    regionSchema;

/**
 * Setup
 */
regionSchema = new Schema({
    _id: Number,
    name: String,
    suburbs: [{ type: Schema.Types.ObjectId, ref: 'Suburb'}],
    stats: [{ type: Schema.Types.ObjectId, ref: 'Stat'}]
});

/**
* Statics
*/

/**
 * Update (or insert) a region into the database
 *
 * @method upsert
 * @param  {Object} config
 *         @param {Number}   config.id         The region ID
 *         @param {String}   config.name       The region name
 *         @param {Function} [config.callback] Callback is passed the ID of the upserted region
 */
regionSchema.statics.upsert = function (config) {
    var Region = this;

    Region.update({ _id: config.id }, { name: config.name }, { upsert: true }, function (err) {
        if (err) throw err;

        if (typeof config.callback === 'function') {
            config.callback(config.id);
        }
    }.bind(this));
};

/**
 * Export
 */
module.exports = mongoose.model('Region', regionSchema);
