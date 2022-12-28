'use strict';
const { Model } = require('sequelize');


module.exports = (sequelize, DataTypes) => {
  class Spot extends Model {

    static async getAllSpot(spotNumber) {
      let spots = await Spot.findAll();
      return spots
    }



    static associate(models) {
      Spot.hasMany(models.Booking, { foreignKey: 'spotId'});
      Spot.hasMany(models.SpotImage, { foreignKey: 'spotId' });
      Spot.hasMany(models.Review, {  foreignKey: 'spotId' });
      // Spot.belongsTo(models.User, { through: models.Booking })
      // Spot.hasMany(models.ReviewImage, { through: models.Review }, { foreignKey: 'spotId'})
    }
  }
  Spot.init({
    ownerId: DataTypes.INTEGER,
    address: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    country: DataTypes.STRING,
    lat: DataTypes.DECIMAL,
    lng: DataTypes.DECIMAL,
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    price: DataTypes.DECIMAL
  }, {
    sequelize,
    modelName: 'Spot',
  });
  return Spot;
};
