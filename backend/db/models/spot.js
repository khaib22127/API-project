'use strict';
const { Model } = require('sequelize');


module.exports = (sequelize, DataTypes) => {
  class Spot extends Model {

    static async getAllSpot(spotNumber) {
      let spots = await Spot.findAll();
      return spots
    }



    static associate(models) {
      Spot.hasMany(models.Review, {  foreignKey: 'spotId' });
      Spot.hasMany(models.Booking, { foreignKey: 'spotId'});
      Spot.hasMany(models.SpotImage, { foreignKey: 'spotId' });
      Spot.belongsToMany(models.User, { through: models.Booking, foreignKey: 'spotId' })
      // Spot.hasMany(models.ReviewImage, { through: models.Review }, { foreignKey: 'spotId'})
    }
  }
  Spot.init({
    ownerId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'User',
        through: { model: 'Booking' },
        key: 'id'
      }
    },
    address: {
      type: DataTypes.STRING,
    },
    city: {
      type: DataTypes.STRING,
    },
    state: {
      type: DataTypes.STRING,
    },
    country: {
      type: DataTypes.STRING,
    },
    lat: {
      type: DataTypes.DECIMAL,
    },
    lng: {
      type: DataTypes.DECIMAL,
    },
    name: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.STRING,
    },
    price: {
      type: DataTypes.DECIMAL,
    }
  }, {
    sequelize,
    modelName: 'Spot',
  });
  return Spot;
};
