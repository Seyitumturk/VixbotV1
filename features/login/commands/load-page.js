// Require the debug module for logging error messages
const debug = require('debug')('express:login');

// Async function for loading the login page
async function loadPage(req, res) {
  // Log request and response objects using debug
  debug('login:loadPage', req, res);

  // Render the login page
  res.render('pages/login');
}

// Export function
module.exports = loadPage;
