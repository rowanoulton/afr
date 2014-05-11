/**
 * Dependencies
 */
var fs       = require('fs'),
    express  = require('express'),
    mongoose = require('mongoose');

/**
 * Declarations
 */
var app = express(),
    getConfiguration,
    config;

/**
 * Load configuration from JSON
 *
 * @method getConfiguration
 * @return {Object|Undefined} configObj
 *         If configuration was loaded and valid, it is returned as an object. Otherwise it
 *         is returned as undefined
 */
getConfiguration = function () {
    var configExists = fs.existsSync('./config/config.json'),
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

    console.log('🔧  -> Configuration loaded.');

    return configObj;
};
