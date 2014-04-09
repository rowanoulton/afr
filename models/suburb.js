/**
 * Dependencies
 */
var mongoose = require('mongoose'),
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
 * Export
 */
module.exports = mongoose.model('Suburb', suburbSchema);
