require('../index');
const { Restaurant } = require('src/models/index');
const createCrawler = require('scraper/crawler');

async function main() {
  try {
    const restaurants = await Restaurant.find();

    await Promise.all(restaurants.map(async (restaurant) => {
      const crawler = await createCrawler(restaurant);
      await crawler.run();
    }));

    process.exit(0);
  } catch (err) {
    process.exit(1);
  }
}

main();
