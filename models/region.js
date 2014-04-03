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
    latitude: Number,
    longitude: Number,
    suburbs: [{ type: Schema.Types.ObjectId, ref: 'Suburb'}],
    stats: [{ type: Schema.Types.ObjectId, ref: 'Stat'}]
});

/**
 * Export
 */
module.exports = mongoose.model('Region', regionSchema);
