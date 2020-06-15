const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

async function setupMongodbConnection() {
  const mongod = new MongoMemoryServer();
  const mongoUri = await mongod.getUri();
  await mongoose.connect(mongoUri, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  return mongod;
}

async function closeMongodbConnection(mongod) {
  await mongod.stop();
}

module.exports = { setupMongodbConnection, closeMongodbConnection };
