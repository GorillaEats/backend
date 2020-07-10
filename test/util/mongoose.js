const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

require('./absolutePath');
const Models = require('src/models');
const seedData = require('test/util/seedData.json');

class TestDB {
  async seedDB() {
    const modelNames = Object.keys(Models);
    const data = {};
    await Promise.all(modelNames.map(async (modelName) => {
      if (seedData[modelName]) {
        const Model = Models[modelName];
        await Model.insertMany(seedData[modelName]);
        data[modelName] = await Model.find({});
      } else {
        data[modelName] = [];
      }
    }));

    this.data = data;
  }

  async setupMongodbConnection(options = {}) {
    const mongod = new MongoMemoryServer();
    const mongoUri = await mongod.getUri();
    await mongoose.connect(mongoUri, {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    if (options.seed) {
      await this.seedDB();
    }

    this.mongod = mongod;
  }

  async closeMongodbConnection() {
    await this.mongod.stop();
  }
}

module.exports = TestDB;
