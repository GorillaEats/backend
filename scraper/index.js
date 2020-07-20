require('app-module-path').addPath(`${__dirname}/../`);
const setupDB = require('src/loaders/mongoose');
const { Restaurant } = require('src/models');
const LocationCrawler = require('./crawler');

async function main() {
  console.log('main');
  try {
    await setupDB();

    const restaurants = await Restaurant.find();

    await Promise.all(restaurants.map(async (restaurant) => {
      const crawler = new LocationCrawler(restaurant);
      await crawler.run();
    }));
  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);
}

main();
