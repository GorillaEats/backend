/* eslint-disable import/no-extraneous-dependencies */
const Apify = require('apify');
const Microdata = require('microdata-node');
const mongoose = require('mongoose');

const { removeDuplicates, getRestaurantData, parseOpeningHours } = require('scraper/util');
const { Location } = require('src/models/index');
const logger = require('src/logger');

const MAX_DEPTH = 3;

const handleLocationMicrodata = async (restaurant, data, url, currentDate) => {
  const withoutDup = removeDuplicates(data);
  const { properties } = data;
  const address = properties.address[0].properties;
  const geo = properties.geo[0].properties;

  const doc = {
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
    lastScraperRun: currentDate,
    menuId: mongoose.Types.ObjectId(), // TODO should be restaurant default menu id
    name: properties.name[0],
    openingHours: parseOpeningHours(properties.openingHours),
    priceRange: properties.priceRange[0],
    restaurantId: restaurant.id,
    telephone: properties.telephone[0],
    url: properties.url ? properties.url[0] : url,
  };
  const filter = { address: doc.address };
  const options = { upsert: true };

  await Promise.all([
    Location.updateOne(filter, doc, options),
    Apify.pushData(withoutDup),
  ]);
};

async function createCrawler(restaurant) {
  const currentDate = Date.now();
  const { url, allow } = restaurant.spider;
  const requestQueue = await Apify.openRequestQueue(currentDate.toString());

  await requestQueue.addRequest({
    url: restaurant.spider.url,
    userData: {
      depth: 0,
    },
  });

  const handlePageFunction = async ({ request, $, body }) => {
    const data = Microdata.toJson(body, request.loadedUrl);
    const restaurantData = getRestaurantData(data);

    logger.debug(`handlePageFunction: ${request.loadedUrl}`);

    if (restaurantData) {
      await handleLocationMicrodata(restaurant, restaurantData, request.url, currentDate);
    } else if (request.userData.depth < MAX_DEPTH) {
      await Apify.utils.enqueueLinks({
        $,
        requestQueue,
        baseUrl: url,
        pseudoUrls: [new RegExp(allow)],
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
