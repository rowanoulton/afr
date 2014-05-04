/**
 * Dependencies
 */
var winston = require('winston');

/**
 * @class FileLogger
 * @constructor
 * @param {String} [namespace] The namespace (filename) for where logs should be written. Defaults to "afr"
 */
function FileLogger (namespace) {
    this.namespace = namespace || 'afr';
    this.winston   = new (winston.Logger)({
        transports: [
            new (winston.transports.File)({
                filename: 'logs/' + this.namespace + '.log',
                maxsize: 268435456,
                json: false
            })
        ]
    });

    return this.winston;
};

/**
 * Export
 */
module.exports = FileLogger;
