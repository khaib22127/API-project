'use strict';
const { Model, json } = require('sequelize');


module.exports = (sequelize, DataTypes) => {
  class Review extends Model {


    // static async averageStars(stars) {
    //   const avgStarReview = await Review.findAll({
    //     attributes: [
    //       'stars',
    //       [sequelize.fn('AVG', sequelize.col('stars')), 'avgRating'],
    //     ]
    //   })
    // }

//     static getCurrentSpotReviewById(id) {
//       return Review.scope("currentSpotReview").findByPk(id);
//     }

//     static async getAvgStarReview(spotId) {
//       let average = await Review.findAll({
//         group: 'spotId',

//         attributes: [
//           'spotId',
//           [sequelize.fn('AVG', sequelize.col('stars')), 'Rating']
//         ]
//       })
// return await Review.findByPk(average.id)
//     }



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
