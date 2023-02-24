// Import the async-middleware module and requrie the logout command from the commands folder
const { wrap } = require('async-middleware');
const { logout } = require('./commands/logout');

// Export the router with a POST request containing an array of middlewares
module.exports = (router, middlewares = []) => {
  router.post('/logout', middlewares.map(middleware => wrap(middleware)), wrap(logout));

  return router;
};
