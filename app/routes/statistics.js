/**
 * Dependencies
 */
var _          = require('underscore'),
    moment     = require('moment'),
    Router     = require('express').Router,
    Statistics = require(__dirname + '/../../collector/models/stat');

/**
 * Statistics router
 */
router = new Router();

/**
 * Statistics endpoint
 */
router.get('/', function (req, res) {
    var query  = Statistics.find().lean(),
        region = parseInt(req.query.region),
        suburb = parseInt(req.query.suburb) || null,
        key    = req.query.key,
        type   = req.query.type,
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
    if (!_.isUndefined(key)) {
        if (_.indexOf(Statistics.getKeys(), key) !== -1) {
            query.where('key', Statistics.getKeyNumber(key));
        } else {
            res.send({error: 'Key "' + key + '" is invalid'});
            return;
        }
    }

    // Type (mean, median)
    if (!_.isUndefined(type)) {
        if (_.indexOf(Statistics.getTypes(), type) !== -1) {
            query.where('type', Statistics.getTypeNumber(type)) ;
        } else {
            res.send({error: 'Type "' + type + '" is invalid'});
            return;
        }
    }

    // Date is specified as a range from the start of the given day to the very end,
    // eg. May 1st 2014 00:00:00 to May 1st 2014 23:59:59
    if (date.isValid()) {
        dateLessThan = moment(date).add('days', 1);
        query.where('date').gte(date.toDate()).lt(dateLessThan.toDate());
    }

    query.select({
        _id: 0,
        _suburb: 1,
        key: 1,
        type: 1,
        value: 1,
        date: 1
    });

    query.exec(function (err, stats) {
        if (err) {
            res.send({ error: err.message });
            return;
        }

        res.send(stats.map(function (stat) {
            // Replace ISOString date with YYYY-MM-DD formatted date
            stat.date = moment(stat.date).format('YYYY-MM-DD');

            // Replace key with key name
            stat.key = Statistics.getKeyName(stat.key);

            if (stat.key === 'volume') {
                // Volume does not officially have a type, so we must prune it from the returned object
                delete stat.type;
            } else {
                // Replace type with type name
                stat.type = Statistics.getTypeName(stat.type);
            }

            // Replace _suburb with suburb
            stat.suburb = stat._suburb;
            delete stat._suburb;
            return stat;
        }));
    });
});

/**
 * Types list
 */
router.get('/types', function (req, res) {
    res.send(Statistics.getTypes());
});

/**
 * Keys list
 */
router.get('/keys', function (req, res) {
    res.send(Statistics.getKeys());
});

/**
 * Export
 */
module.exports = router;
