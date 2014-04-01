/**
 * Dependencies
 */
var _         = require('underscore'),
    Statistic = require('fast-stats').Stats;

/**
 * @class Series
 * @constructor
 * @param {Array} keys        An array of strings specifying the properties this series should calculate stats for
 * @param {Array} collection
 */
function Series (keys, collection) {
    this.keys       = keys;
    this.collection = collection;

    this._calculate();
};

/**
 * Get the value of a type of statistic for a certain data key
 *
 * For example, .get('price', 'median')
 *
 * @method get
 * @param  {String} key  The data key (eg. price, price_per_room). Must be one of the keys given to the constructor
 * @param  {String} type The type of statistic (only mean and median are currently supported)
 * @return {Integer}
 */
Series.prototype.get = function (key, type) {
    return this.stats[key][type];
};

/**
 * Translate collection into a series and calculates statistics for each specified data key
 *
 * @private
 * @method  _calculate
 */
Series.prototype._calculate = function () {
    this._fill();

    _.each(this.keys, function (key) {
        var keySeries = this.series[key];

        this.stats[key] = {
            mean: keySeries.amean(),
            median: keySeries.median()
        };
    }.bind(this));
};

/**
 * Translate collection data into statistic series objects, one per specified data key
 *
 * @private
 * @method  _fill
 */
Series.prototype._fill = function () {
    this._clear();
    this.length = this.collection.length;

    _.each(this.keys, function (key) {
        _.each(this.collection, function (listing) {
            // Ensure we always have a Statistics object to push data into
            this.series[key] = this.series[key] || new Statistic();
            this.series[key].push(listing.get(key));
        }.bind(this));
    }.bind(this));
};

/**
 * Clear all calculated data (series, statistics, length)
 *
 * @private
 * @method  _clear
 */
Series.prototype._clear = function () {
    this.series = {};
    this.stats  = {};
    this.length = 0;
};

/**
 * Export
 */
module.exports = Series;
