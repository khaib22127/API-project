'use strict';

const bcrypt = require('bcryptjs')

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}


module.exports = {
  up: async (queryInterface, Sequelize) => {
    options.tableName = 'Users';
    return queryInterface.bulkInsert(options, [
      {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@gmail.com',
        username: 'JohnSmith',
        hashedPassword: bcrypt.hashSync('secret password')
      },
      {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@demo.io',
        username: 'jane_doe',
        hashedPassword: bcrypt.hashSync('password2')
      },
      {
        firstName: 'Toni',
        lastName: 'Race',
        email: 'toni@demo.io',
        username: 'toni_race',
        hashedPassword: bcrypt.hashSync('password3')
      },
      {
        firstName: 'Tori',
        lastName: 'Rose',
        email: 'tori@demo.io',
        username: 'tori_rose',
        hashedPassword: bcrypt.hashSync('password4')
      },
      {
        firstName: 'Megan',
        lastName: 'Tan',
        email: 'megan@demo.io',
        username: 'megan_tan',
        hashedPassword: bcrypt.hashSync('password4')
      },
    ])
  },

  down: async (queryInterface, Sequelize) => {
    options.tableName = 'Users';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      firstName: { [Op.in]: ['John', 'Jane', 'Toni', 'Tori', 'Megan'] }
    }, {});
  }
};
