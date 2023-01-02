'use strict';
const { Model } = require('sequelize');


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
      Review.belongsTo(models.Spot, { foreignKey: 'spotId', });
      Review.belongsTo(models.User, { foreignKey: 'userId' });
      Review.hasMany(models.ReviewImage, { foreignKey: 'reviewId' });
      Review.belongsTo(models.SpotImage, { through: models.Spot, foreignKey: 'spotId' })
    }
  }
  Review.init({
    spotId: {
      type: DataTypes.INTEGER
    },
    userId: {
      type: DataTypes.INTEGER,
    },
    review: {
      type: DataTypes.STRING
    },
    stars: {
      type: DataTypes.INTEGER,

    }
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
