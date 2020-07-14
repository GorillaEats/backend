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

module.exports = { removeDuplicates, getRestaurantData };
