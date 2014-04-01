/**
 * Dependencies
 */
var mongoose = require('mongoose'),
    Schema   = mongoose.Schema,
    statSchema;

/**
 * Setup
 */
statSchema = new Schema({
    _suburb: { type: Number, ref: 'Suburb' },

    /* A number representing a type of data (eg. "price", "price_per_room") */
    key: Number,

    /* A number representing a type of statistic (eg. mean, median, volume) */
    type: Number,

    value: Number,
    date: { type: Date, default: Date.now }
});

/**
 * Export
 */
module.exports = mongoose.model('Stat', statSchema);
