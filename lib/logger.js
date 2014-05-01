/**
 * Dependencies
 */
var winston = require('winston');

/**
 * @class Logger
 * @constructor
 * @param {String} [namespace] The namespace (filename) for where logs should be written. Defaults to "afr"
 */
function Logger (namespace) {
    this.namespace = namespace || 'afr';
    this.winston   = new (winston.Logger)({
        transports: [
            new (winston.transports.File)({
                filename: 'logs/' + namespace + '.log',
                maxsize: 268435456
            })
        ]
    });

    return this.winston;
};

/**
 * Export
 */
module.exports = Logger;
