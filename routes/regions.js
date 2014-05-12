/**
 * Dependencies
 */
var Router = require('express').Router,
    Region = require(__dirname + '/../models/region'),
    Suburb = require(__dirname + '/../models/suburb');

/**
 * Regions endpoint
 */
router = new Router();

/**
 * Region list
 */
router.get('/', function (req, res) {
    Region.find({}, { name: 1 }, function (err, regions) {
        if (err) throw err;
        res.send(regions);
    });
});

/**
 * Suburb list
 */
router.get('/:id/suburbs', function (req, res) {
    Suburb.find({ _region: req.params.id }, { district: 1, name: 1, latitude: 1, longitude: 1 }, function (err, suburbs) {
        if (err) throw err;
        res.send(suburbs);
    });
});

/**
 * Export
 */
module.exports = router;
