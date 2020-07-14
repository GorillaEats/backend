/* eslint-disable import/no-extraneous-dependencies */
const Apify = require('apify');
const Microdata = require('microdata-node');

const { removeDuplicates, getRestaurantData } = require('scraper/util');
const { Location } = require('src/models/index');

const MAX_DEPTH = 0;

const handleLocationMicrodata = async (data, url) => {
  const withoutDup = removeDuplicates(data);

  console.log(JSON.stringify(withoutDup, null, 2));
  console.log(url);
  await Apify.pushData(withoutDup);
};

async function createCrawler(restaurant) {
  const { url, allow } = restaurant.spider;
  const requestQueue = await Apify.openRequestQueue(Date.now().toString());

  await requestQueue.addRequest({
    url: 'https://locations.chipotle.com/tx/college-station/815-university-dr', // restaurant.spider.url,
    userData: {
      depth: 0,
    },
  });

  const handlePageFunction = async ({ request, $, body }) => {
    const data = Microdata.toJson(body, request.loadedUrl);
    const restaurantData = getRestaurantData(data);

    if (restaurantData) {
      await handleLocationMicrodata(restaurantData, request.url);
    }

    if (request.userData.depth < MAX_DEPTH) {
      await Apify.utils.enqueueLinks({
        $,
        requestQueue,
        baseUrl: url,
        pseudoUrls: [new RegExp(allow)],
        limit: 5,
        transformRequestFunction: (oldReq) => {
          const newReq = oldReq;
          newReq.userData.depth = request.userData.depth + 1;
          return newReq;
        },
      });
    }
  };

  return new Apify.CheerioCrawler({
    requestQueue,
    handlePageFunction,
  });
}

module.exports = createCrawler;
