'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}


module.exports = {
  up: async (queryInterface, Sequelize) => {
    options.tableName = 'Reviews';
    return queryInterface.bulkInsert(options, [
      {
        spotId: 1,
        userId: 1,
        review: 'This was an awesome spot!',
        stars: 5
      },
      {
        spotId: 2,
        userId: 2,
        review: 'This was an awesome spot! 2',
        stars: 4
      },
      {
        spotId: 3,
        userId: 3,
        review: 'This was an awesome spot! 3',
        stars: 5
      },
      {
        spotId: 4,
        userId: 4,
        review: 'This was an awesome spot! 4',
        stars: 5
      },
      {
        spotId: 5,
        userId: 5,
        review: 'This was an awesome spot! 5',
        stars: 5
      },
      {
        spotId: 1,
        userId: 6,
        review: 'This was an awesome spot! 2',
        stars: 4
      },
    ])
  },

  down: async (queryInterface, Sequelize) => {
    options.tableName = 'Reviews';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      id: { [Op.in]: [1, 2, 3, 4, 5] }
    }, {});
  }
};
