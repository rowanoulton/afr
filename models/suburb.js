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
    name: String,
    latitude: Number,
    longitude: Number,
    stats: [{ type: Schema.Types.ObjectId, ref: 'Stat'}]
});

/**
 * Export
 */
module.exports = mongoose.model('Suburb', suburbSchema);
