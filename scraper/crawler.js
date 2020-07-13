// eslint-disable-next-line import/no-extraneous-dependencies
const Apify = require('apify');

const { Location } = require('src/models/index');

const MAX_DEPTH = 4;

async function createCrawler(restaurant) {
  const { url, allow } = restaurant.spider;
  const requestQueue = await Apify.openRequestQueue();

  await requestQueue.addRequest({
    url: restaurant.spider.url,
    userData: {
      depth: 0,
    },
  });

  const handlePageFunction = async ({ request, $ }) => {
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
