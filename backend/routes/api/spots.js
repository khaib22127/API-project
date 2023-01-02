// backend/routes/api/spots.js
const express = require('express')

const { Op } = require("sequelize");
const { Spot, Review, SpotImage, User, ReviewImage, sequelize } = require('../../db/models');
const router = express.Router();
const { check, body } = require('express-validator');
const { userValidationErrors } = require('../../utils/validation');
const { requireAuth, restoreUser, userPermission } = require('../../utils/auth');
const review = require('../../db/models/review');

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
        .exists()
        .isNumeric({ checkFalsy: true })
        .withMessage('Latitude is not valid'),
    check("lng")
        .exists()
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
        .exists()
        .isInt({ min: 0 })
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

    const spot = await Spot.findAll({
        where: {
            ownerId: req.user.id
        },
        attributes: {
            include: [
                [sequelize.fn('AVG', sequelize.col('Reviews.stars')), 'avgStarRating'],
            ],
        },
        include: [
            {
                model: Review,
                attributes: []
            },
            {
                model: SpotImage,
                attributes: ['id', 'url', 'preview'],
            },
        ],
        group: ['Spot.id', 'SpotImages.id'],
    })

    let spots = [];
    spot.forEach(ele => {
        spots.push(ele.toJSON())
    })


    spots.forEach(spot => {
        spot.SpotImages.forEach(image => {
            if (image.preview === true) {
                spot.previewImage = spot.preview
                spot.previewImage = image.url;
            }
            console.log("LOOOKING::: =======>   ", image.preview)
        })
        delete spot.SpotImages
    })

    res.json({Spots: spots})
});



// Get details of a Spot from an id
// GET /api/spots/:spotId
router.get('/:spotId', async (req, res) => {

    // let findSpot = await Spot.findOne({
    //     where: {
    //         id: req.params.spotId
    //     },
    //     include: [
    //         {
    //             model: Review,
    //             attributes: [
    //                 'spotId',
    //                 'review',
    //                 'stars'
    //             ]
    //         },
    //         {
    //             model: SpotImage,
    //             attributes: ['id', 'url', 'preview'],
    //         },
    //         {
    //             model: User,
    //             attributes: ['id', 'firstName', 'lastName']
    //         }
    //     ],
    // })

    // if (findSpot === null) {
    //     res.status(404)
    //     return res.json({
    //         "message": "Spot couldn't be found",
    //         "statusCode": 404
    //     })
    // }


    // const rating = await Review.getAvgStarReview();

    // const reviewNum = await Review.count('review')

    // let spots = [];
    // spots.push(findSpot.toJSON())

    // for (let spot of spots) {
    //     spot.Reviews.forEach(star => {
    //         if (star.review) {
    //             star.review = reviewNum
    //             spot.numReviews = star.review
    //         }

    //         for (let id of rating) {





    //             if (star.spotId === id.spotId) {
    //                 spot.Reviews = id.dataValues.Rating
    //                 spot.avgStarRating = spot.Reviews
    //             }
    //         }
    //     });
    //     spot.SpotImage = spot.SpotImages
    //     delete spot.SpotImages
    //     spot.SpotImages = spot.SpotImage
    //     spot.Users.forEach(user => {
    //         spot.Owner = user
    //         delete user.Booking

    //     })
    //     delete spot.spotId
    //     delete spot.Reviews
    //     delete spot.Users
    //     delete spot.SpotImage
    // }

    // return res.json(spots[0])

    //==================================================================================

    let spot = await Spot.findByPk(req.params.spotId, {
        attributes: {
            include: [
                [sequelize.fn('COUNT', sequelize.col('Reviews.review')), 'numReviews'],
                [sequelize.fn('AVG', sequelize.col('Reviews.stars')), 'avgStarRating'],
            ],
        },
        include: [
            {
                model: Review,
                attributes: [],
            },
            {
                model: SpotImage,
                attributes: ['id', 'url', 'preview'],
            },
            {
                model: User,
                attributes: ['id', 'firstName', 'lastName'],
            }
        ],

        group: ['Spot.id', 'SpotImages.id'],
    })

    if (!spot) {
        res.status(404)
        return res.json({
            "message": "Spot couldn't be found",
            "statusCode": 404
        })
    }

    let p = [];
    p.push(spot.toJSON())

    p.forEach(ele => {

            console.log("LOOKING spot::: =====>  ", ele)

        ele.Owners = ele.User
        delete ele.User

    })

    res.json(p[0])
});




// Create a Spot
// Creates and returns a new spot
// POST /api/spots
router.post('/', requireAuth, validateSpot, async (req, res) => {

    const { user } = req;

    const {
        address, city, state,
        country, lat, lng, name,
        description, price } = req.body;



    const spot = await Spot.create({
        ownerId: user.id,
        address, city, state,
        country, lat, lng, name,
        description, price,
    })

    await spot.save();
    return res.json(spot)
});

// Edit a Spot
// PUT /api/spots/:spotId
router.put('/:spotId', requireAuth, userPermission, validateSpot, async (req, res) => {

    const {
        address, city, state,
        country, lat, lng, name,
        description, price } = req.body;

    let spot = await Spot.findByPk(req.params.spotId)

    spot.ownerId = req.user.id;
    spot.address = address;
    spot.city = city;
    spot.state = state;
    spot.country = country;
    spot.lat = lat;
    spot.lng = lng;
    spot.name = name;
    spot.description = description;
    spot.price = price;

    await spot.save()
    return res.json(spot)
})

// Deletes an existing spot
// DELETE /api/spots/:spotId
router.delete('/:spotId', requireAuth, userPermission, async (req, res) => {

    const spot = await Spot.findByPk(req.params.spotId);

    await spot.destroy();
    res.json({
        "message": "Successfully deleted",
        "statusCode": 200
    })
});






module.exports = router;
