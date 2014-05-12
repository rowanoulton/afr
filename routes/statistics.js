/**
 * Dependencies
 */
var Router     = require('express').Router,
    Statistics = require(__dirname + '/../models/stat');

/**
 * Statistics endpoint
 */
router = new Router();

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
