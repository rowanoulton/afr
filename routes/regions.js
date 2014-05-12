/**
 * Dependencies
 */
var Router = require('express').Router,
    Region = require(__dirname + '/../models/region');

/**
 * Regions endpoint
 */
router = new Router();
router.get('/regions', function (req, res) {
    Region.find({}, { name: 1 }, function (err, regions) {
        if (err) throw err;
        res.send(regions);
    });
});

/**
 * Export
 */
module.exports = router;
