const User = require('../../../models/Users');
const bcrypt = require('bcrypt');

async function createUser(req, res) {
  const { username, email, password } = req.body;

  try {
    const hashedPass = await bcrypt.hash(password, 5);

    const user = new User({
      username,
      email,
      password: hashedPass,
      created_at: new Date(),
      updated_at: new Date(),
      email_verified_at: new Date(),
    });

    await user.save();

    req.session.messages = { success: 'You have successfully registered, you can now log in.' };
    res.redirect('/login');
  } catch (error) {
    const { code, message } = error;
    let databaseError = '';

    if (code === 11000) {
      databaseError = 'The email has already been taken.';
    } else {
      databaseError = `Something went wrong: ${message}`;
      console.log(error.stack);

    }

    req.session.messages = { databaseError };
    res.redirect('/register');
  }
}

module.exports = createUser;
