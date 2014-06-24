/**
 * Dependencies
 */
var fs             = require('fs'),
    _              = require('underscore'),
    express        = require('express'),
    bodyParser     = require('body-parser'),
    methodOverride = require('method-override'),
    mongoose       = require('mongoose'),
    ejs            = require('ejs'),

    // Routes
    routes = {
        index: require(__dirname + '/app/routes/index'),
        regions: require(__dirname + '/app/routes/regions'),
        statistics: require(__dirname + '/app/routes/statistics')
    };

/**
 * Declarations
 */
var getConfiguration,
    config,
    app;

/**
 * Middleware setup
 */
app = express();
app.use(methodOverride());
app.use(bodyParser());
app.set('view engine', 'html');
app.engine('html', ejs.renderFile);
app.set('views', __dirname + '/app/views');

/**
 * Load configuration from JSON
 *
 * @method getConfiguration
 * @return {Object|Undefined} configObj
 *         If configuration was loaded and valid, it is returned as an object. Otherwise it
 *         is returned as undefined
 */
getConfiguration = function () {
    var configExists = fs.existsSync(__dirname + '/config/config.json'),
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
        configRaw = fs.readFileSync(__dirname + '/config/config.json');
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

config = getConfiguration();
if (!_.isUndefined(config)) {
    if (mongoose.connection.readyState !== mongoose.Connection.STATES.connected) {
        // Connect to the database
        mongoose.connect(config.database.connectionUri);
    }

    app.use(express.static(__dirname + '/public'));
    app.use('/', routes.index);
    app.use('/regions', routes.regions);
    app.use('/statistics', routes.statistics);
    app.listen(3000);
}
