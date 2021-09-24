# cas

  Central Authentication Service (CAS) V2 client for Node.js

  This module only handles the ticket validation step of the CAS login process. Planned features include functions to generate the login/logout URLs.

  Generally, to start the login process, send your users to: `https://cas_base_url/login?service=url_to_handle_ticket_validation`. In the University of Waterloo example below, this url would be: `https://cas.uwaterloo.ca/cas/login?service='my_service'`.

  hard fork of: https://github.com/fakechris/node-casv2

## Installation

via npm:

    $ npm install casv2

## Usage

Setup:

    var CAS = require('casv2');
    var cas = new CAS({base_url: 'https://cas.uwaterloo.ca/cas', service: 'my_service'});

Using it in a login route:

    exports.cas_login = function(req, res) {
      var ticket = req.param('ticket');
      if (ticket) {
        cas.validate(ticket, function(err, status, username) {
          if (err) {
            // Handle the error
            res.send({error: err});
          } else {
            // Log the user in
            res.send({status: status, username: username});
          }
        });
      } else {
        res.redirect('/');
      }
    };
