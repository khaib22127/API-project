'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}


module.exports = {
  up: async (queryInterface, Sequelize) => {
    options.tableName = 'Bookings';
    return queryInterface.bulkInsert(options, [
      {
        spotId: 1,
        userId: 1,
        startDate: "2021-11-19",
        endDate: "2021-11-20"
      },
      {
        spotId: 2,
        userId: 2,
        startDate: "2021-11-21",
        endDate: "2021-11-22"
      },
      {
        spotId: 3,
        userId: 3,
        startDate: "2021-11-13",
        endDate: "2021-11-24"
      },
      {
        spotId: 4,
        userId: 4,
        startDate: "2021-11-15",
        endDate: "2021-11-26"
      },
      {
        spotId: 5,
        userId: 5,
        startDate: "2021-11-17",
        endDate: "2021-11-28"
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    options.tableName = 'Bookings';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      id: { [Op.in]: [1, 2, 3, 4, 5] }
    }, {});
  }
};
