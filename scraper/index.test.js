const Apify = require('apify');
const { Schema, model } = require('mongoose');

const RequestModel = model('Request', new Schema({
  url: {
    type: String,
    required: true,
    unique: true,
  },
  count: {
    type: Number,
    default: 0,
  },
}));

require('app-module-path').addPath(`${__dirname}/../`);
const setupDB = require('src/loaders/mongoose');

Apify.main(async () => {
  // await connection
  await setupDB();

  // Create a RequestQueue
  const now = Date.now();
  const requestQueue = await Apify.openRequestQueue(now.toString());
  // Define the starting URL
  const allow = /https:\/\/locations\.chipotle\.com.*/;
  await requestQueue.addRequest({ url: 'https://locations.chipotle.com/' });
  // Function called for each URL
  const handlePageFunction = async ({ request, $ }) => {
    console.log(request.url);
    await RequestModel.updateOne({
      url: request.url,
    }, {
      url: request.url,
      $inc: { count: 1 },
    }, { upsert: true });

    // Add all links from page to RequestQueue
    await Apify.utils.enqueueLinks({
      $,
      requestQueue,
      baseUrl: request.loadedUrl,
      pseudoUrls: [allow],
    });
  };
  // Create a CheerioCrawler
  const crawler = new Apify.CheerioCrawler({
    requestQueue,
    handlePageFunction,
  });
  // Run the crawler
  await crawler.run();

  const isEmpty = await requestQueue.isEmpty();

  console.log(`Request queue is empty? ${isEmpty}`);
});
