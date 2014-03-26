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
    type: Number,
    value: Number,
    percentile: Number,
    date: { type: Date, default: Date.now }
});

/**
 * Export
 */
module.exports = mongoose.model('Stat', statSchema);
