require('app-module-path').addPath(`${__dirname}/../`);
const setupDB = require('src/loaders/mongoose');
const LocationCrawler = require('./crawler');

async function main() {
  console.log('main');
  try {
    await setupDB();

    const startURL = 'https://locations.chipotle.com/';
    const regexFilter = /https:\/\/locations\.chipotle\.com.*/;

    const crawler = new LocationCrawler({ startURL, regexFilter });
    await crawler.run();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);
}

main();
