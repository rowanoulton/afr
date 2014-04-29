/**
 * Dependencies
 */
var fs            = require('fs'),
    mongoose      = require('mongoose'),
    _             = require('underscore'),
    Suburb        = require('./models/suburb'),
    Region        = require('./models/region'),
    Statistics    = require('./models/stat'),
    Series        = require('./lib/series'),
    Trademe       = require('./lib/trademe/interface'),
    TrademeRegion = require('./lib/trademe/region'),
    Geocoder      = require('./lib/geocoder');

/**
 * Setup
 */
var connectionUri = 'mongodb://localhost/test',
    configExists  = fs.existsSync('./config/config.json'),
    configRaw,
    config,
    api;

// Confirm configuration exists
if (!configExists) {
    // Explain that users will need to configure their own details as part of project setup
    console.log('No configuration found. Please copy and rename ./config/config.default.json and enter your details.');
    process.exit(1);
}

// Retrieve configuration
try {
    configRaw = fs.readFileSync('./config/config.json');
    config    = JSON.parse(configRaw);
} catch (err) {
    console.log('Error loading configuration: ./config/config.json', err);
    process.exit(1);
}

if (!config.regions.length) {
    console.log('There are no regions specified in the configuration.');
    process.exit(1);
}

console.log('Configuration loaded for ' + config.regions.length + ' region' + (config.regions.length === 1 ? '' : 's'));

// Connect to the Mongo database
// @todo: Dev/Production settings
mongoose.connect(connectionUri);

// Create the API interface instance
api = new Trademe({
    token: config.api.token
});

var syncRegion,
    syncSuburbs,
    syncGeocodes,
    syncStats;

syncRegion = function (regionConfig) {
    Region.upsert({
        id: regionConfig.id,
        name: regionConfig.name,
        callback: syncSuburbs.bind(this)
    });
};

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
            syncGeocodes(regionId);
            syncStats(regionId);
        }.bind(this)
    });
};

syncGeocodes = function (regionId) {
    var geocoder = new Geocoder({
        regionId: regionId
    });

    // Begin geocoding process to confirm that all suburbs have
    // coordinate values
    geocoder.start();
};

syncStats = function (regionId) {
    var keys           = ['price', 'price_per_room'],
        statsProcessed = 0,
        statsToProcess = 0,
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
        var suburbs = collection.getSortedBySuburb();

        console.log(collection.length + ' listings loaded for ' + regionConfig.name);

        _.each(suburbs, function (suburb, suburbId) {
            var series = new Series(keys, suburb);

            // @todo: Should this be pre-calculated with an initial pass over the suburbs list
            statsToProcess++;

            // Parse series into database models and save them
            Statistics.fromSeries({
                region: regionId,
                suburb: suburbId,
                series: series,
                keys: keys,
                callback: function () {
                    statsProcessed++;

                    if (statsProcessed === statsToProcess) {
                        // We are finished, notify user
                        console.log('Statistics saved for ' + regionConfig.name);
                    }
                }.bind(this)
            });
        }.bind(this));
    }.bind(this));
};

// Create and fetch each region specified in configuration
_.each(config.regions, syncRegion.bind(this));
