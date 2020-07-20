const { URL } = require('url');

const ACCEPTED_SCHEMAS = [
  'http://schema.org/CafeOrCoffeeShop',
  'http://schema.org/Bakery',
  'http://schema.org/BarOrPub',
  'http://schema.org/Brewery',
  'http://schema.org/Distillery',
  'http://schema.org/FastFoodRestaurant',
  'http://schema.org/IceCreamShop',
  'http://schema.org/Restaurant',
  'http://schema.org/Winery',
];
const WEEKDAYS_TO_OFFSET = {
  Su: 0,
  Mo: 1,
  Tu: 2,
  We: 3,
  Th: 4,
  Fr: 5,
  Sa: 6,
};

function getRestaurantData(raw) {
  if (raw && raw.items) {
    const { items } = raw;

    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      if (ACCEPTED_SCHEMAS.includes(item.type[0])) {
        return item;
      }
    }
  }
  return null;
}

function parseOpeningHours(hours) {
  const intervals = [];
  hours.forEach((hour) => {
    let weekdayCode;
    let startHours = 0;
    let startMinutes = 0;
    let endHours = 24;
    let endMinutes = 0;

    if (hour.includes('Closed')) {
      return null;
    } if (hour.includes('All Day')) {
      weekdayCode = hour.substring(0, 2);
    } else {
      weekdayCode = hour.substring(0, 2);
      startHours = parseInt(hour.substring(3, 5), 10);
      startMinutes = parseInt(hour.substring(6, 8), 10);
      endHours = parseInt(hour.substring(9, 11), 10);
      endMinutes = parseInt(hour.substring(12, 14), 10);
    }

    const offset = WEEKDAYS_TO_OFFSET[weekdayCode] * 24 * 60;
    const startValue = startHours * 60 + startMinutes + offset;
    let endValue = endHours * 60 + endMinutes + offset;

    // adjust end value if it occurs before or at same time as start value
    if (endValue <= startValue) {
      endValue += 24 * 60;
    }

    intervals.push({
      start: startValue,
      end: endValue,
    });

    intervals.sort((intervalA, intervalB) => intervalA.start - intervalB.end);

    return intervals;
  });

  return intervals;
}

function extractLocationDoc(data, restaurant) {
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
    lastScraperRun: Date.now(),
    menuId: restaurant.defaultMenuId,
    name: properties.name[0],
    openingHours: parseOpeningHours(properties.openingHours),
    priceRange: properties.priceRange[0],
    restaurantId: restaurant.id,
    telephone: properties.telephone[0],
    url: properties.url[0],
  };

  return doc;
}

function extractUrlsFromCheerio($, baseUrl) {
  return $('a')
    .map((i, el) => $(el).attr('href'))
    .get()
    .filter((href) => !!href)
    .map((href) => {
      const isHrefAbsolute = /^[a-z][a-z0-9+.-]*:/.test(href); // Grabbed this in 'is-absolute-url' package.
      if (!isHrefAbsolute && !baseUrl) {
        throw new Error(`An extracted URL: ${href} is relative and options.baseUrl is not set. `
              + 'Use options.baseUrl in utils.enqueueLinks() to automatically resolve relative URLs.');
      }
      return baseUrl
        ? (new URL(href, baseUrl)).href
        : href;
    });
}

module.exports = {
  getRestaurantData,
  parseOpeningHours,
  extractUrlsFromCheerio,
  extractLocationDoc,
};
