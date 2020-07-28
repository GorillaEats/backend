/* eslint-disable import/no-extraneous-dependencies */
const Crawler = require('crawler');
const Seenreq = require('seenreq');
const Microdata = require('microdata-node');
const robotsParser = require('robots-parser');

const Location = require('src/models/location');
const logger = require('src/logger');

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
    this.robots = robotsParser(`${this.restaurant.spider.url}robots.txt`);

    await this.seen.initialize();
    await this.seen.exists(this.restaurant.spider.url);
    this.crawler.queue({
      uri: this.restaurant.spider.url,
      userData: {
        depth: 0,
      },
    });
  }

  async dispose() {
    await this.seen.dispose();
  }

  async handleRequest(error, res, done) {
    if (error) {
      logger.error(error);
    } else {
      const {
        $, request: { uri }, body, options: { userData },
      } = res;
      logger.debug(uri.href);

      const data = Microdata.toJson(body, uri.href);
      const restaurantData = getRestaurantData(data);

      if (restaurantData) {
        const doc = extractLocationDoc(restaurantData, this.restaurant);
        const filter = { address: doc.address };
        const options = {
          upsert: true,
          setDefaultsOnInsert: true,
        };

        await Location.updateOne(filter, doc, options);
      } else {
        await this.enqueueLinks($, uri.href, userData);
      }
    }
    done();
  }

  async enqueueLinks($, baseURL, userData) {
    const childUrls = extractUrlsFromCheerio($, baseURL)
      .filter((childUrl) => (new RegExp(this.restaurant.spider.allow)).test(childUrl));

    const seenResults = await this.seen.exists(childUrls);

    if (this.restaurant.spider.maxDepth >= userData.depth + 1) {
      childUrls.forEach((childUrl, index) => {
        if (this.robots && this.robots.isDisallowed(childUrl)) {
          return;
        }

        if (!seenResults[index]) {
          this.crawler.queue({
            uri: childUrl,
            userData: {
              depth: userData.depth + 1,
            },
          });
        }
      });
    }
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
