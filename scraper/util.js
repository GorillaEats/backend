const _ = require('lodash');

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

function isStrictObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

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

function removeDuplicates(obj) {
  if (Array.isArray(obj)) {
    const arr = [];
    for (let i = 0; i < obj.length; i += 1) {
      arr.push(removeDuplicates(obj[i]));
    }

    return _.uniqWith(arr, _.isEqual);
  } if (isStrictObject(obj)) {
    const newObj = {};
    const keys = Object.keys(obj);

    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      newObj[key] = removeDuplicates(obj[key]);
    }

    return newObj;
  }
  return obj;
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

module.exports = {
  removeDuplicates,
  getRestaurantData,
  parseOpeningHours,
};
