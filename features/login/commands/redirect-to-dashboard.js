const debug = require('debug')('express:login');
const { FETCH_INFO_ERROR_MESSAGE } = require('../constants');
const { getUserById } = require('../repository');

async function redirectToDashboard(req, res) {
  const { user } = req;
  let userInfo;

  try {
    userInfo = await getUserById(user && user.id);
  } catch (getUserError) {
    const messages = {
      errors: {
        databaseError: FETCH_INFO_ERROR_MESSAGE,
      },
    };
    return res.status(500).render('pages/login', { messages });
  }

  debug('login:redirectToDashboard');
  req.session.userInfo = { ...userInfo };
  console.log(req.session);

  // Check if the user has completed the onboarding process
  if (!userInfo.onboarding_completed) {
    return res.redirect('onboarding');
  } else {
    return res.redirect('/pages/conversations');
  }
}


module.exports = redirectToDashboard;
