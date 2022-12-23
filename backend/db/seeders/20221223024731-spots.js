'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    options.tableName = 'Spots';
    return queryInterface.bulkInsert(options, [
      {
        ownerId: 1,
        address: '123 Disney Lane',
        city: "San Francisco",
        state: "California",
        country: "United States of America",
        lat: 37.7645358,
        lng: -122.4730327,
        name: "App Academy",
        description: "Place where web developers are created",
        price: 123,

      },
      {
        ownerId: 2,
        address: '225 Fire Lane',
        city: "San Jose",
        state: "California",
        country: "United States of America",
        lat: 97.7667258,
        lng: -12.4730327,
        name: "Brew House",
        description: "A Place to hang out",
        price: 423,

      },
      {
        ownerId: 3,
        address: '1670 East Mississippi Ave',
        city: "Aurora",
        state: "Colorado",
        country: "United States of America",
        lat: 87.7645888,
        lng: -177.0030327,
        name: "AMF Lanes",
        description: "Bowling alley with food, drinks, games",
        price: 52,
      },
      {
        ownerId: 4,
        address: '1000 Dawnadele Ave',
        city: "Baton Rouge",
        state: "Lousiana",
        country: "United States of America",
        lat: 427.7645358,
        lng: 2.4730327,
        name: "Costco",
        description: "Wholesale, gas, food, warehouse, merchandise",
        price: 400,
      },
      {
        ownerId: 5,
        address: '555 Brighton Blvd',
        city: "Denver",
        state: "Colorado",
        country: "United States of America",
        lat: 257.7645358,
        lng: -75.4730327,
        name: "The Source Hotel",
        description: "A place to rent a room",
        price: 131,
      },
    ])
  },

  down: async (queryInterface, Sequelize) => {
    options.tableName = 'Spots';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      ownerId: { [Op.in]: [1, 2] }
    }, {});
  }
};
