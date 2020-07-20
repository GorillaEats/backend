/* eslint-disable import/no-extraneous-dependencies */
const Crawler = require('crawler');
const Seenreq = require('seenreq');

const { extractUrlsFromCheerio, extractLocationDoc } = require('./util');

class LocationCrawler {
  constructor(context) {
    this.handleRequest = this.handleRequest.bind(this);

    this.seen = new Seenreq();
    this.context = context;
    this.crawler = new Crawler({
      jQuery: true,
      callback: this.handleRequest,
    });
  }

  async initialize() {
    await this.seen.initialize();
    await this.seen.exists(this.context.startURL);
    this.crawler.queue(this.context.startURL);
  }

  async dispose() {
    await this.seen.dispose();
  }

  async handleRequest(error, res, done) {
    if (error) {
      console.log(error);
    } else {
      const { $, request: { uri } } = res;
      const normalizedSign = this.seen.normalize(uri.href).sign;
      console.log(normalizedSign);

      const childUrls = extractUrlsFromCheerio($, uri.href)
        .filter((childUrl) => this.context.regexFilter.test(childUrl));

      const seenResults = await this.seen.exists(childUrls);

      childUrls.forEach((childUrl, index) => {
        if (!seenResults[index]) {
          this.crawler.queue(childUrl);
        }
      });
    }
    done();
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
