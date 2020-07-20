/* eslint-disable import/no-extraneous-dependencies */
const Crawler = require('crawler');
const Seenreq = require('seenreq');
const Microdata = require('microdata-node');

const Location = require('src/models/location');

const {
  extractUrlsFromCheerio,
  extractLocationDoc,
  getRestaurantData,
} = require('./util');

class LocationCrawler {
  constructor(restaurant) {
    this.handleRequest = this.handleRequest.bind(this);

    this.seen = new Seenreq();
    this.restaurant = restaurant;
    this.crawler = new Crawler({
      jQuery: true,
      callback: this.handleRequest,
    });
  }

  async initialize() {
    await this.seen.initialize();
    await this.seen.exists(this.restaurant.spider.url);
    this.crawler.queue(this.restaurant.spider.url);
  }

  async dispose() {
    await this.seen.dispose();
  }

  async handleRequest(error, res, done) {
    if (error) {
      console.log(error);
    } else {
      const { $, request: { uri }, body } = res;
      console.log(uri.href);

      const data = Microdata.toJson(body, uri.href);
      const restaurantData = getRestaurantData(data);

      if (restaurantData) {
        const doc = extractLocationDoc(restaurantData, this.restaurant);
        const filter = { address: doc.address };
        const options = { upsert: true };

        await Location.updateOne(filter, doc, options);
        console.log(doc);
      } else {
        await this.enqueueLinks($, uri.href);
      }
    }
    done();
  }

  async enqueueLinks($, baseURL) {
    const childUrls = extractUrlsFromCheerio($, baseURL)
      .filter((childUrl) => (new RegExp(this.restaurant.spider.allow)).test(childUrl));

    const seenResults = await this.seen.exists(childUrls);

    childUrls.forEach((childUrl, index) => {
      if (!seenResults[index]) {
        this.crawler.queue(childUrl);
      }
    });
  }

  async run() {
    const that = this;
    await new Promise(((res) => {
      that.crawler.on('drain', async () => {
        await this.dispose();
        res();
      });

      that.initialize();
    }));
  }
}

module.exports = LocationCrawler;
