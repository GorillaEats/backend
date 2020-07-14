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

function removeDuplicates() {

}

module.exports = { removeDuplicates, getRestaurantData };
