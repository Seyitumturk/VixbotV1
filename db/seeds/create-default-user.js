const bcrypt = require('bcrypt');

// Create an async function that seeds the knex table 
exports.seed = async function seed(knex) {
  // Create a variable named hashedPass and assign it to the result of the bcrypt hash method 
  const hashedPass = await bcrypt.hash('secret', 5);

  // Insert a new object into the users table with the specified information 
  await knex('users').insert({
    // Admin name 
    name: 'admin admin',
    // Admin email
    email: 'admin@argon.com',
    // Admin hashed password
    password: hashedPass,
    // Timestamp for when the user was created 
    created_at: new Date(),
    // Timestamp for when the user was last updated 
    updated_at: new Date(),
    // Timestamp for when the user's email was verified 
    email_verified_at: new Date(),
  });
};
