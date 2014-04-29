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
 *         @param {Integer}  config.region
 *         @param {Integer}  [config.suburb]
 *         @param {Series}   config.series
 *         @param {Array}    config.keys
 *         @param {Function} [config.callback]
 */
statSchema.statics.fromSeries = function (config) {
    var regionId     = config.region,
        suburbId     = config.suburb || null,
        series       = config.series,
        keys         = config.keys,
        callback     = config.callback,
        today        = new Date(),
        todayDb      = new Date(
            today.getUTCFullYear(),
            today.getUTCMonth(),
            (today.getUTCDay() - 1)),
        Statistic    = this,
        numOfStats   = (keys.length * types.length),
        numProcessed = 0;

    _.each(keys, function (key, keyIndex) {
        _.each(types, function (type, typeIndex) {
            var stat = new Statistic({
                _suburb: suburbId,
                _region: regionId,
                key: keyIndex,
                type: typeIndex,
                value: series.get(key, type),
                date: todayDb
            });

            stat.save(function (err) {
                if (err) {
                    // @todo: How should this be handled?
                    // @todo: Write err to console.log
                    console.log('An error was encountered saving ' + key +  '.' + type + ' for ' + (suburbId || 'overall') + ' ' + regionId + ' on ' + todayDb.toString());
                } else {
                    console.log(key +  '.' + type + ' for ' + (suburbId || 'overall') + ' [region:' + (regionId || 'overall')  + '] on ' + todayDb.toString());
                }

                numProcessed++;
                if (numProcessed === numOfStats && typeof callback === 'function') {
                    // If we have processed all our statistics, trigger the callback
                    callback();
                }
            }.bind(this));
        }.bind(this));
    }.bind(this));
};

/**
 * Export
 */
module.exports = mongoose.model('Statistic', statSchema);
