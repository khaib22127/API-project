// backend/routes/api/spots.js
const express = require('express')

const { Op } = require("sequelize");
const { Spot, Review, SpotImage, User, sequelize } = require('../../db/models');
const router = express.Router();
const { check } = require('express-validator');
const { userValidationErrors } = require('../../utils/validation');




// Get all spots
// GET /api/spots
router.get('/', async (req, res, next) => {

    let starRating = await Review.findAll({
        group: 'spotId',

        attributes: [
            'spotId',
            [sequelize.fn('AVG', sequelize.col('stars')), 'Rating']
        ]
    })



    let spots = await Spot.findAll({

        include: [
            {
                model: Review,
            },
            {
                model: SpotImage
            },
        ],
    });


    let allSpots = [];


    spots.forEach(spot => {
        allSpots.push(spot.toJSON())
    });



    allSpots.forEach(spot => {
        spot.Reviews.forEach(star => {
            for (let id of starRating) {

                if (star.spotId === id.spotId) {
                    spot.avgRating = id.dataValues.Rating
                }
                delete spot.spotId

            }

        });


        spot.SpotImages.forEach(image => {
            if (image.preview === true) {
                spot.previewImage = spot.preview
                spot.previewImage = image.url;
            }
        })

        delete spot.Reviews

        delete spot.SpotImages
    })


    allSpots.previewImage = allSpots.preview

    res.json({ spots: allSpots })

});




module.exports = router;
