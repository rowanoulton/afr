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

regionSchema.statics.upsert = function (config) {
    var Region = this;

    Region.update({ _id: config.id }, { name: config.name }, { upsert: true }, function (err) {
        if (err) throw err;

        if (typeof config.callback === 'function') {
            config.callback();
        }
    }.bind(this));
};

/**
 * Export
 */
module.exports = mongoose.model('Region', regionSchema);
