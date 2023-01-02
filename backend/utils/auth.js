// Phase 3
const jwt = require('jsonwebtoken');
const { jwtConfig } = require('../config');
const { Spot, Review, SpotImage, ReviewImage, User, sequelize } = require('../db/models');

const { secret, expiresIn } = jwtConfig;

// Phase 3
// Sends a JWT Cookie
const setTokenCookie = (res, user) => {
    // Create the token.
    const token = jwt.sign(
        { data: user.toSafeObject() },
        secret,
        { expiresIn: parseInt(expiresIn) } // 604,800 seconds = 1 week
    );

    const isProduction = process.env.NODE_ENV === "production";

    // Set the token cookie
    res.cookie('token', token, {
        maxAge: expiresIn * 1000, // maxAge in milliseconds
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction && "Lax"
    });

    return token;
};


// Phase 3
const restoreUser = (req, res, next) => {
    // token parsed from cookies
    const { token } = req.cookies;
    req.user = null;

    return jwt.verify(token, secret, null, async (err, jwtPayload) => {
        if (err) {
            return next();
        }

        try {
            const { id } = jwtPayload.data;
            req.user = await User.scope('currentUser').findByPk(id);
        } catch (e) {
            res.clearCookie('token');
            return next();
        }

        if (!req.user) res.clearCookie('token');

        return next();
    });
};


// Phase 3
// If there is no current user, return an error
const requireAuth = function (req, _res, next) {
    if (req.user) return next();

    const err = new Error('Authentication required');
    err.title = 'Authentication required';
    err.errors = ['Authentication required'];
    err.status = 401;
    return next(err);
}


// const userAuth = function (req, res, next) {
//     res.status(401);
//     res.json({
//         "message": "Authentication required",
//         "statusCode": 401
//     })
// }


const userPermission = async function (req, res, next) {

    const spotOwner = await Spot.findByPk(req.params.spotId)
    const user = await User.findByPk(req.user.id);

    if (spotOwner === null || (spotOwner.ownerId !== user.id)) {
        res.status(404)
        return res.json({
            "message": "Spot couldn't be found",
            "statusCode": 404
        })
    }
    // if (spotOwner.ownerId !== user.id) {
    //     res.status(403);
    //     return res.json({
    //         "message": "Forbidden",
    //         "statusCode": 403
    //     })
    // }
     return next();
}

const userAuth = async function (req, res, next) {
    const reviewId = req.params.reviewId
    const imageCount = await Review.findByPk(reviewId, {
        include: [
            {
                model: ReviewImage,
                attributes: [[sequelize.fn('COUNT', sequelize.col('ReviewImages.id')), 'numReviews']]
            },
        ]
    })
    const nums = []
    nums.push(imageCount.toJSON())
    nums.forEach(num => {

        if (num.ReviewImages[0].numReviews > 10) {
            res.status(403)
           return res.json({
                "message": "Maximum number of images for this resource was reached",
                "statusCode": 403
            })
        }
        next(err)
    })
    return next()
}



const userReviewPermission = async function (req, res, next) {
    const reviewId = req.params.reviewId
    const imageCount = await Review.findByPk(reviewId)
    const user = await User.findByPk(req.user.id);

    if (!imageCount) {
        res.status(404)
        return res.json({
            "message": "Spot couldn't be found",
            "statusCode": 404
        })
    }

    const nums = []
    nums.push(imageCount.toJSON())
    nums.forEach(num => {
        console.log("loooking imageCount::: =====>  ", num.userId !== user.id)

            if (num.userId !== user.id) {
                res.status(404);
              return res.json({
                    "message": "Review couldn't be found",
                    "statusCode": 404
                })
            }
        })
        return next();
}

module.exports = { setTokenCookie, restoreUser, requireAuth, userAuth, userPermission, userReviewPermission };
