// eslint-disable-next-line import/no-extraneous-dependencies
const Apify = require('apify');

async function createCrawler(restaurant) {
  const { url, allow } = restaurant.spider;
  const requestQueue = await Apify.openRequestQueue();

  await requestQueue.addRequest({ url: restaurant.spider.url });

  const handlePageFunction = async ({ request, $ }) => {
    await Apify.utils.enqueueLinks({
      $,
      requestQueue,
      baseUrl: url,
      pseudoUrls: [new RegExp(allow)],
      limit: 5,
    });
  };

  return new Apify.CheerioCrawler({
    requestQueue,
    handlePageFunction,
  });
}

module.exports = createCrawler;
