jest.setTimeout(30000);

require('../models/User');

const mongoose = require('mongoose');
const keys = require('../config/keys');

mongoose.Promise = global.Promise;
mongoose
  .connect(keys.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
  })
  .then((conn) => {
    console.log(`MongoDB connected at: ${conn.connection.host}`);
  })
  .catch((err) => {
    console.log(`MongoDB Error: ${err.message}`);
  });
