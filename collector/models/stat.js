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
var globalKeys  = ['price', 'price_per_room', 'volume'],
    globalTypes = ['mean', 'median'],
    errorHandler,
    globalTypeMap,
    globalTypeNameMap,
    globalKeyMap,
    globalKeyNameMap;

// We use number aliases to represent keys and types in our database to save on storage size. These variables contain
// the maps from key/type names to their respective number aliases.
globalKeyMap = {
    price: 0,
    price_per_room: 1,
    // Volume is a special type, and is not a member of globalKeys as it has to be handled specially
    volume: 2
};

globalTypeMap = {
    mean: 0,
    median: 1
};

/**
 * Setup
 */
statSchema = new Schema({
    _suburb: { type: Number, ref: 'Suburb' },
    _region: { type: Number, ref: 'Region' },
    /* A number representing a type of data (eg. "price", "price_per_room", "volume") */
    key: Number,
    /* A number representing a type of statistic (eg. mean, median) */
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
 * Get an array of key names for the types of data we calculate statistics for (e.g. "price", "price_per_room")
 *
 * This excludes volume, as we handle volume as a special case
 *
 * @method getKeys
 * @return {Array}
 */
statSchema.statics.getKeys = function () {
    return globalKeys;
};

/**
 * Get the name of a key from a given key number. Key numbers are aliases used in the database. See top of file.
 *
 * Method will lazy-load a reverse map of key numbers to names on the first pass
 *
 * @method getKeyName
 * @param  {Number} keyNumber
 * @return {String}
 */
statSchema.statics.getKeyName = function (keyNumber) {
    var keyNameMap = this.getKeyNameMap();

    return keyNameMap[keyNumber];
};

/**
 * Get a map of keys to names. Keys are a type of data
 *
 * Lazy loads an object map as needed
 *
 * @method getKeyNameMap
 * @return {Object}
 */
statSchema.statics.getKeyNameMap = function () {
    if (!globalKeyNameMap) {
        globalKeyNameMap = {};

        _.each(globalKeyMap, function (key, name) {
            globalKeyNameMap[key] = name;
        });
    }

    return globalKeyNameMap;
};

/**
 * Get the key number alias for a given key. Key numbers are aliases used in the database. See top of file.
 *
 * @method getKeyNumber
 * @param  {String} keyName
 * @return {Number}
 */
statSchema.statics.getKeyNumber = function (keyName) {
    return globalKeyMap[keyName];
};

/**
 * Get an array of names for the types of stats we calculate (e.g. "mean", "median")
 *
 * @method getTypes
 * @return {Array}
 */
statSchema.statics.getTypes = function () {
    return globalTypes;
};

/**
 * Get the name of a type from a given type number. Type numbers are aliases used in the database. See top of file.
 *
 * Method will lazy-load a reverse map of type numbers to names on the first pass
 *
 * @method getTypeName
 * @param  {Number} typeNumber
 * @return {String}
 */
statSchema.statics.getTypeName = function (typeNumber) {
    var typeNameMap = this.getTypeNameMap();

    return globalTypeNameMap[typeNumber];
};

/**
 * Get a map of types to names. Types are a type of statistic
 *
 * Lazy loads an object map as needed
 *
 * @method getTypeNameMap
 * @return {Object}
 */
statSchema.statics.getTypeNameMap = function () {
    if (!globalTypeNameMap) {
        globalTypeNameMap = {};

        _.each(this.getTypes(), function (name, type) {
            globalTypeNameMap[type] = name;
        });
    }

    return globalTypeNameMap;
};

/**
 * Get the type number alias for a given type. Type numbers are aliases used in the database. See top of file.
 *
 * @method getTypeNumber
 * @param  {String} typeName
 * @return {Number}
 */
statSchema.statics.getTypeNumber = function (typeName) {
    return globalTypeMap[typeName];
};

/**
 * Get a local-timezone date for today where hours, minutes and seconds are zero
 *
 * For example, on the 7th of May 2014, this function would return a date of 2014-05-07T00:00:00Z
 *
 * @method getDatabaseDate
 * @return {Date}
 */
statSchema.statics.getDatabaseDate = function () {
    var today = new Date();

    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
};

/**
 * Create database records for statistics for a given series, suburb and region
 *
 * @method fromSeries
 * @param {Object} config
 *         @param {Integer}  config.region
 *         @param {Integer}  [config.suburb]
 *         @param {Series}   config.series
 *         @param {Function} [config.callback]
 */
statSchema.statics.fromSeries = function (config) {
    var Statistic    = this,
        regionId     = config.region,
        suburbId     = config.suburb || null,
        series       = config.series,
        callback     = config.callback,
        logger       = config.logger,
        keys         = this.getKeys(),
        types        = this.getTypes(),
        todayDb      = this.getDatabaseDate(),
        numProcessed = 0,
        numOfStats,
        handleSaveCallback;

    // Prune volume from list of keys as it is handled specially
    delete keys[_.indexOf(keys, 'volume')];

    // Now that volume has been removed, calculate the total number of statistics to be processed
    numOfStats = (keys.length * types.length) + 1;

    /*
     * Callback for persisting statistics to database. Handles error logging and invocation of callback on completion
     *
     * @private
     * @method handleSaveCallback
     * @param  {Error} err
     * @param  {Statistic} stat
     */
    handleSaveCallback = function (err, stat) {
        if (err) {
            // @todo: How should this be handled?
            logger.info('Encountered an error while saving a statistic', err);
        } else {
            logger.info('Statistic saved', stat._region, stat._suburb, this.getKeyName(stat.key), this.getTypeName(stat.type), stat.value);
        }

        numProcessed++;
        if (numProcessed === numOfStats && typeof callback === 'function') {
            // If we have processed all our statistics, trigger the callback
            callback();
        }
    };

    // Create a record for the volume of listings — this is a special case, and must be added seperately to the other
    // types of statistics which are handled more generically below
    Statistic.create({
        _suburb: suburbId,
        _region: regionId,
        key: this.getKeyNumber('volume'),
        // This stat isn't actually a mean, but we must set it to ensure uniqueness (prevent duplicate entries of this
        // statistic for the same day)
        type: this.getTypeNumber('mean'),
        value: series.length,
        date: todayDb
    }, handleSaveCallback.bind(this));

    // Iterate over keys and types and store statistics for each. This includes everything except volume
    _.each(keys, function (keyName) {
        _.each(types, function (typeName) {
            Statistic.create({
                _suburb: suburbId,
                _region: regionId,
                key: this.getKeyNumber(keyName),
                type: this.getTypeNumber(typeName),
                value: series.get(keyName, typeName),
                date: todayDb
            }, handleSaveCallback.bind(this));
        }.bind(this));
    }.bind(this));
};

/**
 * Export
 */
module.exports = mongoose.model('Statistic', statSchema);
