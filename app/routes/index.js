/**
 * Dependencies
 */
var Router = require('express').Router,
    Region = require('../../collector/models/region');

/**
 * Index router
 */
router = new Router();

/**
 * Index route
 */
router.get('/', function (req, res) {
    Region.find({}, {name: 1}, function (err, regions) {
        res.render('index', { regions: regions });
    });
});

/**
 * Export
 */
module.exports = router;
