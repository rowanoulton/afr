/**
 * Dependencies
 */
var Router = require('express').Router;

/**
 * Index router
 */
router = new Router();

/**
 * Index route
 */
router.get('/', function (req, res) {
    res.render('index', { a: 'rowan' });
});

/**
 * Export
 */
module.exports = router;
