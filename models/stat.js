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
    _region: { type: Number, ref: 'Region' },
    /* A number representing a type of data (eg. "price", "price_per_room") */
    key: Number,
    /* A number representing a type of statistic (eg. mean, median, volume) */
    type: Number,
    value: Number,
    date: { type: Date, default: Date.now }
});

/**
 * Indexes
 *
 * There should be only a single entry for:
 *     each type of statistic, for
 *     each key of data, for
 *     each suburb, for
 *     each region, for
 *     each day.
 */
statSchema.index({ _suburb: 1, _region: 1, date: 1, type: 1, key: 1 }, { unique: true });

/**
 * Export
 */
module.exports = mongoose.model('Stat', statSchema);
