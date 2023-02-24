const Knex = require('knex');
const knexConfig = require('./knexfile');

const knex = Knex(knexConfig[process.env.NODE_ENV]);

module.exports = knex;




// const mongoose = require("mongoose");

// mongoose.connect(process.env.MONGO_DB_URL, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// });

// module.exports = mongoose;
