/**
 * Dependencies
 */
var _        = require('underscore'),
    mongoose = require('mongoose'),
    Schema   = mongoose.Schema,
    statSchema;

/**
 * Variables
 */
var types = ['mean', 'median'],
    errorHandler;

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
 * Statics
 */

/**
 * Create database records for statistics for a given series, suburb and region
 *
 * @method fromSeries
 * @param {Object} config
 *         @param {Integer} config.region
 *         @param {Integer} [config.suburb]
 *         @param {Series}  series
 *         @param {String}  key
 */
statSchema.statics.fromSeries = function (config) {
    var regionId  = config.region,
        suburbId  = config.suburb || null,
        series    = config.series,
        key       = config.key,
        today     = new Date(),
        todayDb   = new Date(
            today.getUTCFullYear(),
            today.getUTCMonth(),
            (today.getUTCDay() - 1)),
        Statistic = this;

    _.each(types, function (type) {
        var stat = new Statistic({
            _suburb: suburbId,
            _region: regionId,
            key: key,
            type: type,
            value: series.get(key, type),
            date: todayDb
        });

        stat.save(function (err) {
            if (err) {
                // @todo: How should this be handled?
                console.log('An error was encountered saving ' + key +  '.' + type + ' for ' + (suburbId || 'overall') + ' ' + regionId + ' on ' + todayDb.toString(), err);
            }
        });
    }.bind(this));
};

/**
 * Export
 */
module.exports = mongoose.model('Stat', statSchema);
