/**
 * Module dependencies
 */

const https = require('https');
const url = require('url');
const xml = require('xml2js');



 module.exports = class CAS {
  /*
  * Initialize CAS with the given `options`.
  *
  * @param {Object} options
  * @api public
  */
  constructor(options) {
    options = options || {};

    if (!options.base_url) {
      throw new Error('Required CAS option `base_url` missing.');
    } 

    if (!options.service) {
      throw new Error('Required CAS option `service` missing.');
    }

    var cas_url = url.parse(options.base_url);
    if (cas_url.protocol != 'https:') {
      throw new Error('Only https CAS servers are supported.');
    } else if (!cas_url.hostname) {
      throw new Error('Option `base_url` must be a valid url like: https://example.com/cas');    
    } else {
      this.hostname = cas_url.host;
      this.port = cas_url.port || 443;
      this.base_path = cas_url.pathname;
    }  
    
    this.service = options.service;
  }

  /**
   * Attempt to validate a given ticket with the CAS server.
   * `callback` is called with (err, auth_status, username)
   *
   * @param {String} ticket
   * @param {Function} callback 
   * @param {rejectUnauthorized} rejectUnauthorized
   * @api public
   */

  validate(ticket, callback, rejectUnauthorized) {
    if (typeof rejectUnauthorized === 'undefined') { rejectUnauthorized = true; }
    var req = https.get({
      host: this.hostname,
      port: this.port,
      rejectUnauthorized: rejectUnauthorized,
      path: url.format({
        pathname: this.base_path+'/serviceValidate',
        query: {ticket: ticket, service: this.service}
      })
    }, function(res) {
      // Handle server errors
      res.on('error', function(e) {
        callback(e);
      });

      // Read result
      res.setEncoding('utf8');
      var response = '';
      res.on('data', function(chunk) {
        response += chunk;
      });

      res.on('end', function() {
        xml.parseString(response, function(err, result) {
          if (!err) {
            if (result['cas:serviceResponse']['cas:authenticationSuccess']) {
              callback(undefined, true, result['cas:serviceResponse']['cas:authenticationSuccess'][0]['cas:user'][0]);
              return;
            } else if (result['cas:serviceResponse']['cas:authenticationFailure']) {
              callback(undefined, false);
              return;
            }
          }
        });

        // Format was not correct, error
        callback({message: 'Bad response format.'});
      });
    });
  }
};
