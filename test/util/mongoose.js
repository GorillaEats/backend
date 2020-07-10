const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

require('./absolutePath');
const Models = require('src/models');
const seedData = require('test/util/seedData.json');

async function seedDB() {
  await Promise.all(Object.keys(Models).map((modelName) => {
    if (seedData[modelName]) {
      return Models[modelName].insertMany(seedData[modelName]);
    }
    return Promise.resolve();
  }));
}

async function setupMongodbConnection(options = {}) {
  const mongod = new MongoMemoryServer();
  const mongoUri = await mongod.getUri();
  await mongoose.connect(mongoUri, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  if (options.seed) {
    await seedDB();
  }

  return mongod;
}

async function closeMongodbConnection(mongod) {
  await mongod.stop();
}

module.exports = { setupMongodbConnection, closeMongodbConnection };
