/**
 * Dependencies
 */
var fs            = require('fs'),
    mongoose      = require('mongoose'),
    _             = require('underscore'),
    schedule      = require('node-schedule'),
    Suburb        = require('./models/suburb'),
    Region        = require('./models/region'),
    Statistics    = require('./models/stat'),
    Series        = require('./lib/series'),
    Trademe       = require('./lib/trademe/interface'),
    TrademeRegion = require('./lib/trademe/region'),
    Geocoder      = require('./lib/geocoder'),
    FileLogger    = require('./lib/file-logger');

/**
 * Setup
 */
var getConfiguration,
    recurrenceRule,
    syncRegion,
    syncSuburbs,
    syncGeocodes,
    syncStats,
    syncJob,
    config,
    job,
    api;

/**
 * Perform an upsert on a single region
 *
 * @method syncRegion
 * @param  {Object} regionConfig
 */
syncRegion = function (regionConfig) {
    Region.upsert({
        id: regionConfig.id,
        name: regionConfig.name,
        callback: syncSuburbs.bind(this)
    });
};

/**
 * Perform a sync on all suburbs of a single region
 *
 * @method syncSuburbs
 * @param  {Number} regionId
 */
syncSuburbs = function (regionId) {
    // Once the region has been upserted, sync suburbs for that region
    // by polling the API for locality information, then looping each
    // suburb for our given region and performing an upsert on each.
    Suburb.sync({
        api: api,
        region: regionId,
        callback: function (regionId) {
            var regionConfig = _.findWhere(config.regions, { id: regionId });

            // At this point, the region and all it's suburbs are
            // present in the db, we can begin to load, process and store
            // statistical data
            console.log('Suburbs synced for ' + regionConfig.name);
            syncGeocodes(regionId, regionConfig.name);
            syncStats(regionId);
        }.bind(this)
    });
};

/**
 * Begin a geocoding process for all suburbs of a given region
 *
 * @method syncGeocodes
 * @param  {Number} regionId
 * @param  {String} regionName
 */
syncGeocodes = function (regionId, regionName) {
    var geocoder = new Geocoder({
        regionId: regionId,
        regionName: regionName
    });

    // Begin geocoding process to confirm that all suburbs have
    // coordinate values
    geocoder.start();
};

/**
 * Load all listings for a given region and process them into statistics which are then stored in the database
 *
 * @method syncStats
 * @param  {Number} regionId
 */
syncStats = function (regionId) {
    var keys           = Statistics.getKeys(),
        statsProcessed = 0,
        // Starts at one to account for the overall series
        statsToProcess = 1,
        regionConfig,
        region;

    // Used to retrieve region name
    regionConfig = _.findWhere(config.regions, { id: regionId });

    // TrademeRegion handles the loading & sorting of rental listings
    region = new TrademeRegion({
        id: regionId,
        api: api
    });

    // Fetch the listings data, then process them into series
    region.fetch(function (collection) {
        var suburbs = collection.getSortedBySuburb(),
            // Log debug information about statistic processing to file to prevent pollution of console
            logger  = new FileLogger('stats'),
            handleSeriesCallback,
            overallSeries;

        console.log(collection.length + ' listings loaded for ' + regionConfig.name);

        /*
         * Callback for the completion of storing statistical series. Checks whether process has completed for the
         * current region
         *
         * @method handleSeriesCallback
         */
        handleSeriesCallback = function () {
            statsProcessed++;

            if (statsProcessed === statsToProcess) {
                // We are finished, notify user
                console.log('Statistics saved for ' + regionConfig.name);
            }
        };

        _.each(suburbs, function (suburb, suburbId) {
            var series = new Series(keys, suburb);

            // @todo: Should this be pre-calculated with an initial pass over the suburbs list
            statsToProcess++;

            // Parse series into database models and save them
            Statistics.fromSeries({
                region: regionId,
                suburb: suburbId,
                series: series,
                logger: logger,
                callback: handleSeriesCallback.bind(this)
            });
        }.bind(this));

        // Add an overall series for the region
        overallSeries = new Series(keys, collection.getAll());

        // Create and store statistical series for this overall series
        Statistics.fromSeries({
            region: regionId,
            series: overallSeries,
            logger: logger,
            callback: handleSeriesCallback.bind(this)
        });
    }.bind(this));
};

/**
 * Job to perform all necessary work (syncing of regions, suburbs, statistics)
 *
 * Job should be run at the beginning of each day
 *
 * @method syncJob
 */
syncJob = function () {
    console.log('Running job', new Date());
    config = getConfiguration();

    if (!_.isUndefined(config)) {
        if (mongoose.connection.readyState !== mongoose.Connection.STATES.connected) {
            // Connect to the database
            // @todo: Dev/Production settings
            mongoose.connect(config.database.connectionUri);
        }

        // Create the API interface instance
        // Note: This must be recreated each time incase the oauth details change
        api = new Trademe({
            oauth: config.api.oauth
        });

        // Create and fetch each region specified in configuration
        _.each(config.regions, syncRegion.bind(this));
    }
};

/**
 * Load configuration from JSON
 *
 * @method getConfiguration
 * @return {Object|Undefined} configObj
 *         If configuration was loaded and valid, it is returned as an object. Otherwise it
 *         is returned as undefined
 */
getConfiguration = function () {
    var configExists  = fs.existsSync('./config/config.json'),
        configRaw,
        configObj;

    // Confirm configuration exists
    if (!configExists) {
        // Explain that users will need to configure their own details as part of project setup
        console.log('🔧  -> No configuration found. Please copy and rename ./config/config.default.json and enter your details.');
        return;
    }

    // Retrieve configuration
    try {
        configRaw = fs.readFileSync('./config/config.json');
        configObj = JSON.parse(configRaw);
    } catch (err) {
        console.log('🔧  -> Error loading configuration: ./config/config.json', err);
        return;
    }

    // Confirm database connection specified
    if (_.isUndefined(configObj.database) || _.isUndefined(configObj.database.connectionUri)) {
        console.log('🔧  -> No database.connectionUri specified in the configuration');
        return;
    }

    // Confirm at least one region to sync
    if (!configObj.regions.length) {
        console.log('🔧  -> There are no regions specified in the configuration.');
        return;
    }

    console.log('🔧  -> Configuration loaded for ' + configObj.regions.length + ' region' + (configObj.regions.length === 1 ? '' : 's'));

    return configObj;
};

/**
 * @class Collector
 * @constructor
 */
function Collector () {};

/**
 * Schedule a job to run once at the beginning of every day and then immediately run the first job
 *
 * @method collect
 */
Collector.prototype.collect = function () {
    // Create a rule that runs the job at the very start of every day (@ 00:00:00)
    recurrenceRule        = new schedule.RecurrenceRule();
    recurrenceRule.hour   = 0;
    recurrenceRule.minute = 0;

    // Schedule the job
    job = schedule.scheduleJob(recurrenceRule, syncJob.bind(this));

    // Run the job immediately as well
    syncJob();
};

/**
 * Export
 */
module.exports = Collector;
