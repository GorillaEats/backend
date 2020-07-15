/* eslint-disable import/no-extraneous-dependencies */
const Apify = require('apify');
const Microdata = require('microdata-node');
const mongoose = require('mongoose');

const { removeDuplicates, getRestaurantData, parseOpeningHours } = require('scraper/util');
const { Location } = require('src/models/index');

const MAX_DEPTH = 0;

const handleLocationMicrodata = async (restaurant, data, url) => {
  const withoutDup = removeDuplicates(data);
  const { properties } = data;
  const address = properties.address[0].properties;
  const geo = properties.geo[0].properties;

  const location = new Location({
    address: {
      addressLocality: address.addressLocality[0],
      streetAddress: address.streetAddress[0],
      addressRegion: address.addressRegion[0],
      postalCode: address.postalCode[0],
      addressCountry: address.addressCountry[0],
    },
    geo: {
      type: 'Point',
      coordinates: [
        geo.longitude[0],
        geo.latitude[0],
      ],
    },
    lastScraperRun: Date.now(),
    menuId: mongoose.Types.ObjectId(),
    name: properties.name[0],
    openingHours: parseOpeningHours(properties.openingHours),
    priceRange: properties.priceRange[0],
    restaurantId: restaurant.id,
    telephone: properties.telephone[0],
    url: properties.url ? properties.url[0] : url,
  });

  await Promise.all([
    location.save(),
    Apify.pushData(withoutDup),
  ]);
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
      await handleLocationMicrodata(restaurant, restaurantData, request.url);
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
