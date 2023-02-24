const User = require('../../models/Users');

async function getUser(id) {
  const user = await User.findById(id).select('email name');
  return user;
}

async function updateUserInfo({ name, email, id }) {
  const user = await User.findByIdAndUpdate(id, {
    name,
    email,
    updated_at: new Date(),
  }, { new: true, select: 'email name' });
  return user;
}

module.exports = {
  getUser,
  updateUserInfo,
};
