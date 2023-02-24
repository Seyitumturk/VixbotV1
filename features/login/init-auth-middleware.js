// Require passport and local strategy 
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

// Require repository for functions that are used in authentication
const { getUserForLoginData, getUserById } = require('./repository');

// This function initializes the authentication middleware
module.exports = function initAuthMiddleware(app) {

  // Set up the passport local strategy, which checks the username and password  
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      // Check the login data to get a user 
      const user = await getUserForLoginData(username, password);

      // Check if there is user found 
      if (!user) {
        // returns false if no user was found
        return done(null, false);
      }
      // Else return the user 
      return done(null, user);
    })
  );

  // PassserializeUser takes a user and returns its id 
  passport.serializeUser((user, done) => done(null, user.id));

  // PassdeserializeUser takes an user id and returns the user or throws an error
  passport.deserializeUser(async (id, done) => {
    const user = await getUserById(id);
    if (!user) {
      return done(`Could not deserialize user with id ${id}`);
    }
    return done(null, user);
  });

  // Intialize passport
  app.use(passport.initialize());
  // Intialize session
  app.use(passport.session());
};
