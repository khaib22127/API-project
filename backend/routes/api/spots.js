// backend/routes/api/spots.js
const express = require('express')

const { Op } = require("sequelize");
const { Spot, Review, SpotImage, User, sequelize } = require('../../db/models');
const router = express.Router();
const { check } = require('express-validator');
const { userValidationErrors } = require('../../utils/validation');
const { requireAuth, restoreUser, userAuth } = require('../../utils/auth');



// Get all spots
// GET /api/spots
router.get('/', async (req, res, next) => {

    let rating = await Review.getAvgStarReview();

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

            for (let id of rating) {
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

// get spots of current user
// GET /api/spots/current
router.get('/current', requireAuth, async (req, res) => {

    const spots = await Spot.findAll({
        where: {
            ownerId: req.user.id
        },
        include: [
            {
                model: Review,
            },
            {
                model: SpotImage,
            }
        ]
    });


    let rating = await Review.getAvgStarReview();


    let currentSpot = [];
    spots.forEach(spot => {
        currentSpot.push(spot.toJSON())
    })

    currentSpot.forEach(spot => {

        spot.Reviews.forEach(star => {

            for (let id of rating) {
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

    return res.json({ Spots: currentSpot })
});





// Get details of a Spot from an id
// GET /api/spots/:spotId
router.get('/:spotId', async (req, res) => {

    const rating = await Review.getAvgStarReview();


    let spots = await Spot.findAll({
        where: {
            ownerId: req.params.spotId,
        },
        include: [
            {
                model: Review,
                attributes: [
                    'spotId',
                    'review',
                    'stars'
                ]
            },
            {
                model: SpotImage,
                attributes: ['id', 'url', 'preview'],
            },
            {
                model: User,
                attributes: ['id', 'firstName', 'lastName']
            }
        ],
    });

    const reviewNum = await Review.count('review')

    const obj = JSON.stringify(spots)

    let spo = JSON.parse(obj)

    spo.forEach(spot => {
        spot.Reviews.forEach(star => {
            if (star.review) {
                star.review = reviewNum
                spot.numReviews = star.review
            }
            for (let id of rating) {
                if (star.spotId === id.spotId) {
                    spot.avgStarRating = id.dataValues.Rating
                }

            }

        });

        spot.Users.forEach(user => {
            delete user.Booking
            spot.Owner = user
        })

        delete spot.spotId
        delete spot.Reviews
        delete spot.Users

    })

    res.json(spo[0])
});




module.exports = router;
