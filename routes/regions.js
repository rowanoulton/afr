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
    Region
    .find()
    .lean()
    .select({ name: 1 })
    .exec(function (err, regions) {
        if (err) {
            res.send({ error: err.message });
            return;
        }

        res.send(regions.map(function (region) {
            // Replace _id with id
            region.id = region._id;
            delete region._id;
            return region;
        }));
    });
});

/**
 * Suburb list
 */
router.get('/:id/suburbs', function (req, res) {
    Suburb
    .find()
    .lean()
    .where('_region').equals(req.params.id)
    .select({
        district: 1,
        name: 1,
        latitude: 1,
        longitude: 1
    })
    .exec(function (err, suburbs) {
        if (err) {
            res.send({ error: err.message });
            return;
        }

        res.send(suburbs.map(function (suburb) {
            // Replace _id with id
            suburb.id = suburb._id;
            delete suburb._id;
            return suburb;
        }));
    });
});

/**
 * Export
 */
module.exports = router;
