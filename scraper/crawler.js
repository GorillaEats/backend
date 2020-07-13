/* eslint-disable import/no-extraneous-dependencies */
const Apify = require('apify');
const Microdata = require('microdata-node');

const { Location } = require('src/models/index');

const MAX_DEPTH = 0;

async function createCrawler(restaurant) {
  const { url, allow } = restaurant.spider;
  const requestQueue = await Apify.openRequestQueue();

  await requestQueue.addRequest({
    url: 'https://locations.chipotle.com/tx/college-station/815-university-dr', // restaurant.spider.url,
    userData: {
      depth: 0,
    },
  });

  const handleLocationMicrodata = async (data) => {

  };

  const handlePageFunction = async ({ request, $, body }) => {
    const data = Microdata.toJson(body, request.loadedUrl);

    await Apify.pushData(data);
    await handleLocationMicrodata(data);

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
