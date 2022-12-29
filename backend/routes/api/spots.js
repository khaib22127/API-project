// backend/routes/api/spots.js
const express = require('express')

const { Op } = require("sequelize");
const { Spot, Review, SpotImage, User, sequelize } = require('../../db/models');
const router = express.Router();
const { check } = require('express-validator');
const { userValidationErrors } = require('../../utils/validation');
const { requireAuth, restoreUser, userAuth } = require('../../utils/auth');

const validateSpot = [
    check('address')
    .exists({ checkFalsy: true })
    .withMessage('Street address is required'),
    check("city")
    .exists({ checkFalsy: true })
    .withMessage('City is required'),
    check("state")
    .exists({ checkFalsy: true })
    .withMessage('State is required'),
    check("country")
    .exists({ checkFalsy: true })
    .withMessage('Country is required'),
    check("lat")
    .exists({ checkFalsy: true })
    .isNumeric({ checkFalsy: true })
    .withMessage('Latitude is not valid'),
    check("lng")
    .exists({ checkFalsy: true })
    .isNumeric({ checkFalsy: true })
    .withMessage('Longitude is not valid'),
    check("name")
    .exists({ checkFalsy: true })
    .isLength({ max: 50 })
    .withMessage('Name must be less than 50 characters'),
    check("description")
    .exists({ checkFalsy: true })
    .withMessage('Description is required'),
    check("price")
    .exists({ checkFalsy: true })
    .isNumeric({ checkFalsy: true })
    .withMessage('Price per day is required'),
    userValidationErrors
];

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

    const { user } = req;

    if (user) {
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
    }

});



// Get details of a Spot from an id
// GET /api/spots/:spotId
router.get('/:spotId', async (req, res) => {

     let findSpot = await Spot.findByPk(req.params.spotId)

    if (findSpot === null) {
        res.status(404)
        res.json({
            "message": "Spot couldn't be found",
            "statusCode": 404
        })
    }


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




// Create a Spot
// Creates and returns a new spot
// POST /api/spots
router.post('/', requireAuth, validateSpot, async (req, res) => {

    const user = await User.findByPk(req.user.id);

    const {
        address, city, state,
        coutry, lat, lng, name,
        description, price } = req.body;


        const spot = await Spot.create({
            ownerId: user.id,
            address, city, state,
            coutry, lat, lng, name,
            description, price
        })
        res.json(spot)
});





module.exports = router;
