// backend/routes/api/review.js
const express = require('express')

const { Op } = require("sequelize");
const { Spot, Review, SpotImage, User, ReviewImage, Booking, sequelize } = require('../../db/models');
const router = express.Router();
const { check, body } = require('express-validator');
const { userValidationErrors, reviewValidationErrors } = require('../../utils/validation');
const { requireAuth, restoreUser, userPermission, userReviewPermission } = require('../../utils/auth');


const validateUserReviews = [
    check('review')
        .exists({ checkFalsy: true })
        .isString()
        .withMessage('Review text is required'),
    check('stars', 'Stars must be an integer from 1 to 5')
        .exists({ checkFalsy: true })
        .isInt({ min: 1, max: 5 }),
    userValidationErrors
];
const validateReviews = [
    check('userId')
        .exists()
        .withMessage("User already has a review for this spot"),
    reviewValidationErrors
];

// Get all Reviews of the Current User
// Returns all the reviews written by the current user
// GET  /api/reviews/current
router.get('/current', requireAuth, async (req, res) => {


    const reviews = await Review.findAll({
        where: {
            userId: req.user.id
        },
        include: [
            {
                model: User,
                attributes: ["id", "firstName", "lastName"],

            },
            {
                model: Spot,
                attributes: ['id', 'ownerId',
                    'address', 'city', 'state',
                    'country', 'lat', 'lng', 'name', 'price'],
                include: [
                    {
                        model: SpotImage,
                        attributes: ['url', 'preview'],
                        where: {
                            preview: true,
                        },
                        attributes: [['url', 'previewImage']],
                    }
                ],
            },
            {
                model: ReviewImage,
                attributes: ['id', 'url']
            }
        ],
    })


    let review = [];
    for (let ele of reviews) {
        review.push(ele.toJSON())
    };

    review.forEach(spot => {
        for (const ele of spot.Spot.SpotImages) {
            spot.Spot.SpotImages = ele.previewImage
        }
        spot.Spot.previewImage = spot.Spot.SpotImages
        delete spot.Spot.SpotImages

    })

    res.json({ Reviews: review })
});




// Get all Reviews by a Spot's id
// GET /api/spots/:spotId/reviews
router.get('/:spotId/reviews', async (req, res) => {

    const spot = await Spot.findByPk(req.params.spotId, {
        attributes: [],

        include: [
            {
                model: Review,
                include: [
                    {
                        model: User,
                        attributes: ['id', 'firstName', 'lastName'],
                    },
                    {
                        model: ReviewImage,
                        attributes: ['id', 'url']
                    },
                ]
            },
        ],
    })


    // const review = await Review.findAll({
    //     where: {
    //         spotId: req.params.spotId
    //     },
    //     include: [
    //         {
    //             model: User,
    //             attributes: ['id', 'firstName', 'lastName'],
    //         },
    //         {
    //             model: ReviewImage,
    //             attributes: ['id', 'url']
    //         }
    //     ]
    // });

    if (!spot) {
        res.status(404);
        return res.json({
            "message": "Spot couldn't be found",
            "statusCode": 404
        })
    }

    return res.json(spot)
});


// Create a Review for a Spot based on the Spot's id
// POST /api/spots/:spotId/reviews
router.post('/:spotId/reviews', requireAuth, async (req, res) => {

    const { review, stars } = req.body;

    const spot = await Spot.findByPk(req.params.spotId)

    if (!spot) {
        res.status(404)
        return res.json({
            "message": "Spot couldn't be found",
            "statusCode": 404
        })
    }

    const reviewSpot = await Review.findAll({
        where: {
            spotId: req.params.spotId,
            userId: req.user.id
        },
        include: [
            { model: Spot, attributes: [] }
        ]
    })


    for (let ret of reviewSpot) {
        if (ret.userId) {
            res.status(403);
            return res.json({
                "message": "User already has a review for this spot",
                "statusCode": 403
            })
        }
    }

    const newReview = await Review.create({
        userId: req.user.id,
        spotId: req.params.spotId,
        review,
        stars
    });


    await newReview.save();
    return res.json(newReview)

})

// Create an image for a Review
// POST /api/reviews/:reviewId/images
router.post('/:reviewId/images', requireAuth, async (req, res) => {

    const reviewId = req.params.reviewId

    const { user } = req;
    const { url } = req.body;

    const addImage = await ReviewImage.create({
        reviewId: reviewId,
        url,
    })

    const imageCount = await Review.findByPk(reviewId, {
        include: [
            {
                model: ReviewImage,
                attributes: [[sequelize.fn('COUNT', sequelize.col('ReviewImages.id')), 'numReviews']]
            },
        ],

    })



    if (!imageCount.id) {
        res.status(404);
        return res.json({
            "message": "Review couldn't be found",
            "statusCode": 404
        })
    }


    const nums = []
    nums.push(imageCount.toJSON())
    nums.forEach(num => {

        if (num.userId !== user.id) {
            res.status(404);
            return res.json({
                "message": "Review couldn't be found",
                "statusCode": 404
            })
        }
        if (num.ReviewImages[0].numReviews > 10) {
            res.status(403)
            return res.json({
                "message": "Maximum number of images for this resource was reached",
                "statusCode": 403
            })

        } else {


             addImage.save()
            res.json({
                id: addImage.id,
                url: addImage.url
            })
        }



    })

    // res.json(imageCount)


    if (imageCount.id) {

    }
});



// Edit a Review
// PUT /api/reviews/:reviewId
router.put('/:reviewId', requireAuth, userReviewPermission, validateUserReviews, async (req, res) => {

    const reviewId = await Review.findByPk(req.params.reviewId);

    const {review, stars} = req.body;

    reviewId.review = review;
    reviewId.stars = stars;

    res.set();
    res.json(reviewId)
})


// Delete a Review
// /api/reviews/:reviewId
router.delete('/:reviewId', requireAuth, userReviewPermission, async (req, res) => {
    const reviewId = await Review.findByPk(req.params.reviewId);

    await reviewId.destroy();
    res.json({
        "message": "Successfully deleted",
        "statusCode": 200
      })
})


module.exports = router;
