'use strict';
const { Model, json } = require('sequelize');


module.exports = (sequelize, DataTypes) => {
  class Review extends Model {


    static getAvgStarReview() {
      let average = Review.findAll({
        group: 'spotId',

        attributes: [
          'spotId',
          [sequelize.fn('AVG', sequelize.col('stars')), 'Rating']
        ]
      })
      return average;
    }



    static associate(models) {
      Review.belongsTo(models.Spot, { foreignKey: 'spotId' });
      Review.belongsTo(models.User, { foreignKey: 'userId' });
      Review.hasMany(models.ReviewImage, { foreignKey: 'reviewId' });
      //   Review.belongsTo(models.SpotImage, { through: models.Spot })
    }
  }
  Review.init({
    spotId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    review: DataTypes.STRING,
    stars: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Review',
    scopes: {
      currentSpotReview: {
        attributes: {}
      }
    }
  });
  return Review;
};
