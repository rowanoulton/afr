/**
 * Dependencies
 */
var fs            = require('fs'),
    mongoose      = require('mongoose'),
    _             = require('underscore'),
    Suburb        = require('./models/suburb'),
    Region        = require('./models/region'),
    Trademe       = require('./lib/trademe/interface'),
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

// Create and fetch each region specified in configuration
_.each(config.regions, function (regionConfig) {
    Region.upsert({
        id: regionConfig.id,
        name: regionConfig.name,
        callback: function () {
            // Once the region has been upserted, sync suburbs for that region
            // by polling the API for locality information, then looping each
            // suburb for our given region and performing an upsert on each.
            console.log(regionConfig.name + ' loaded, syncing suburbs...');
            Suburb.sync({
                api: api,
                region: regionConfig.id,
                callback: function () {
                    var geocoder = new Geocoder({
                        regionId: regionConfig.id
                    });

                    // At this point, the region and all it's suburbs are
                    // present in the db, we can begin to load, process and store
                    // statistical data
                    console.log('Suburbs synced for ' + regionConfig.name);

                    // Begin geocoding process to confirm that all suburbs have
                    // coordinate values
                    geocoder.start();
                }.bind(this)
            });
        }.bind(this)
    });
}.bind(this));
