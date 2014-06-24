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
    res.render('index');
});

/**
 * Export
 */
module.exports = router;
