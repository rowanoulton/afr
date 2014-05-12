/**
 * Dependencies
 */
var Router = require('express').Router,
    Suburb = require(__dirname + '/../models/suburb');

/**
 * Suburbs endpoint
 */
router = new Router();
router.get('/region/:id/suburbs', function (req, res) {
    Suburb.find({ _region: req.params.id }, { district: 1, name: 1, latitude: 1, longitude: 1 }, function (err, suburbs) {
        if (err) throw err;
        res.send(suburbs);
    });
});

/**
 * Export
 */
module.exports = router;
