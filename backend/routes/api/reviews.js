// backend/routes/api/review.js
const express = require('express')

const { Op } = require("sequelize");
const { Spot, Review, SpotImage, User, ReviewImage, sequelize } = require('../../db/models');
const router = express.Router();
const { check, body } = require('express-validator');
const { userValidationErrors } = require('../../utils/validation');
const { requireAuth, restoreUser, userPermission } = require('../../utils/auth');


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
                attributes: ["id", "firstName", "lastName"]

            },
            {
                model: Spot,
                attributes: ['id', 'ownerId',
                    'address', 'city', 'state',
                    'country', 'lat', 'lng', 'name',
                    'description', 'price'],
                    include: [
                        {
                            model: SpotImage,
                            attributes: ['url', 'preview'],
                        }
                    ]
            },
            {
                model: ReviewImage,
                attributes: ['id', 'url']
            }
        ],
    })

    const obj = JSON.stringify(reviews)

    let result = JSON.parse(obj)

    result.forEach(review => {
        review.Spot.SpotImages.forEach(image => {

            console.log("looking::: =====>  ", image)
            if (image.preview === true) {
                review.previewImage = review.preview
                review.previewImage = image.url;
            }
        })
        delete review.Spot.SpotImages
    })

   return res.json(result[0])
});




module.exports = router;
