// Require async-middleware and the route commands
const { wrap } = require('async-middleware');
const verifyRequestBody = require('./commands/verify-request-body');
const login = require('./commands/login');
const redirectToDashboard = require('./commands/redirect-to-dashboard');
const loadPage = require('./commands/load-page');

// Export the router with routes for login
module.exports = router => {
  // POST login route 
  router.post('/login',
    // Wrap the verifyRequestBody, login, and redirectToDashboard commands in the async-middleware wrap
    wrap(verifyRequestBody), 
    wrap(login), 
    wrap(redirectToDashboard)
  );

  // GET login route 
  router.get('/login',
    // Wrap the loadPage command in the async-middleware wrap
    wrap(loadPage)
  );

  return router;
};
