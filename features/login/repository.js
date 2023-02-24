const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const User = require('../../models/Users');


mongoose.connect("mongodb://localhost:27017/vbot", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function getUserForLoginData(email, password) {
  console.log('password:', password);
  console.log('email:', email);

  console.log('User:', User);


  const user = await User.findOne({ email });

  if (!user) {
    return null;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return null;
  }

  return {
    id: user._id,
    username: user.email,
    created_at: user.createdAt,
  };
}

async function getUser(query) {
  const user = await User.findOne(query);

  return user;
}

async function getUserById(id) {
  return getUser({ _id: id });
}

module.exports = {
  getUserForLoginData,
  getUserById,
};
