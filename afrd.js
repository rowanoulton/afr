/**
 * Dependencies
 */
var fs      = require('fs'),
    _       = require('underscore'),
    Region  = require('./lib/region'),
    Trademe = require('./lib/trademe/trademe');

/**
 * Setup
 */
var configExists = fs.existsSync('./config/config.json'),
    regions      = [],
    configRaw,
    config,
    regionConfigRaw,
    regionConfig;


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

// Retrieve region configuration
try {
    regionConfigRaw = fs.readFileSync('./config/regions.json');
    regionConfig    = JSON.parse(regionConfigRaw);
} catch (err) {
    console.log('Error loading region configuration: ./config/regions.json', err);
    process.exit(1);
}

_.each(regionConfig, function (currentRegionConfig) {
    var thisApi          = new Trademe({ token: config.api.token }),
        thisRegionConfig = _.extend({}, currentRegionConfig, { api: thisApi }),
        thisRegion;

    thisRegion = new Region(thisRegionConfig);
    thisRegion.fetch(function (data) {
        console.log('Loaded ' + data.length + ' listings for ' + thisRegionConfig.name);
    }.bind(this));

    regions.push(thisRegion);
});
