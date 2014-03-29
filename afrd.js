/**
 * Dependencies
 */
var fs      = require('fs'),
    _       = require('underscore'),
    Region  = require('./lib/trademe/region'),
    Trademe = require('./lib/trademe/trademe');

/**
 * Setup
 */
var configExists = fs.existsSync('./config/config.json'),
    regions      = [],
    configRaw,
    config,
    setupRegion;


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

/**
 * Create, load and store a single region
 *
 * @method setupRegion
 * @param  {Object} regionConfig
 */
setupRegion = function (regionConfig) {
    var api           = new Trademe({ token: config.api.token }),
        configuration = _.extend({}, regionConfig, { api: api }),
        region;

    region = new Region(configuration);
    region.fetch(function (data) {
        console.log('Loaded ' + data.length + ' listings for ' + configuration.name);
    }.bind(this));

    regions.push(region);
};

// Create and fetch each region specified in configuration
_.each(config.regions, setupRegion);
