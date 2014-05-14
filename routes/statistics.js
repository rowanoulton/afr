/**
 * Dependencies
 */
var _          = require('underscore'),
    moment     = require('moment'),
    Router     = require('express').Router,
    Statistics = require(__dirname + '/../models/stat');

/**
 * Statistics router
 */
router = new Router();

/**
 * Statistics endpoint
 */
router.get('/', function (req, res) {
    var query  = Statistics.find(),
        region = parseInt(req.query.region),
        suburb = parseInt(req.query.suburb) || null,
        key    = parseInt(req.query.key),
        type   = parseInt(req.query.type),
        date   = moment(req.query.day, 'YYYY-MM-DD', true),
        dateLessThan;

    if (_.isNaN(region)) {
        res.send({ error: 'A region must be specified' });
        return;
    }

    // Region
    // @todo Do we want overall stats for ALL THE REGIONS?
    query.where('_region', region);

    // Suburb
    // @note: If no suburb is specified, we default to null and return only overall statistics
    query.where('_suburb', suburb);

    // Key (volume, price, etc)
    if (!_.isNaN(key)) {
        query.where('key', key);
    }

    // Type (mean, median)
    if (!_.isNaN(type)) {
        query.where('type', type);
    }

    // Date is specified as a range from the start of the given day to the very end,
    // eg. May 1st 2014 00:00:00 to May 1st 2014 23:59:59
    if (date.isValid()) {
        dateLessThan = moment(date).add('days', 1);
        query.where('date').gte(date.toDate()).lt(dateLessThan.toDate());
    }

    query.exec(function (err, stats) {
        if (err) {
            res.send({ error: err.message });
            return;
        }

        res.send(stats);
    });
});

/**
 * Types list
 */
router.get('/types', function (req, res) {
    res.send(Statistics.getTypeNameMap());
});

/**
 * Keys list
 */
router.get('/keys', function (req, res) {
    res.send(Statistics.getKeyNameMap());
});

/**
 * Export
 */
module.exports = router;
