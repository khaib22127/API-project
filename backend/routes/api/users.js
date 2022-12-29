// backend/routes/api/users.js
const express = require('express');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User } = require('../../db/models');

const router = express.Router();

const { check } = require('express-validator');
const { handleValidationErrors, userValidationErrors } = require('../../utils/validation');


const validateSignup = [
    check('email')
        .exists({ checkFalsy: true })
        .isEmail()
        .withMessage('Please provide a valid email.'),
    check('username')
        .exists({ checkFalsy: true })
        .isLength({ min: 4 })
        .withMessage('Please provide a username with at least 4 characters.'),
    check('username')
        .not()
        .isEmail()
        .withMessage('Username cannot be an email.'),
    check('password')
        .exists({ checkFalsy: true })
        .isLength({ min: 6 })
        .withMessage('Password must be 6 characters or more.'),
    handleValidationErrors
];

const validateUserInput = [
    check('email')
    .isEmail()
    .withMessage("Invalid email"),
    check('username')
    .exists({ checkFalsy: true })
    .withMessage('Username is required'),
    check('firstName')
    .exists({ checkFalsy: true })
    .withMessage('First Name is required'),
    check('lastName')
    .exists({ checkFalsy: true })
    .withMessage('Last Name is required'),
    userValidationErrors

];

// Sign up
// POST /api/users
// router.post('/', validateSignup, async (req, res) => {
//     const { firstName, lastName, email, username, password } = req.body;
//     const user = await User.signup({ firstName, lastName, email, username, password });

//     await setTokenCookie(res, user);

//     return res.json({
//          firstName, lastName, email, username, token: ""
//     });
// }
// );


// Sign up
// POST /api/users
router.post('/', validateUserInput, validateSignup, async (req, res, next) => {

    const { firstName, lastName, email, username, password } = req.body;

    const usernames = await User.findOne({ where: { username } })

    const emails = await User.findOne({ where: { email } })

    if (emails) {
        res.status(403)
        return res.json({
            "message": "User already exists",
            "statusCode": 403,
            "errors": {
                "email": "User with that email already exists"
            }
        })
    };

    if (usernames) {
        res.status(403)
        return res.json({
            "message": "User already exists",
            "statusCode": 403,
            "errors": {
                "username": "User with that username already exists"
            }
        })
    };

    const user = await User.signup({ firstName, lastName, email, username, password });

    await setTokenCookie(res, user);

    return res.json({
        firstName, lastName, email, username, token: ""
    });
}
);


// router.get('/', async (req, res) => {
//     const { username } = req.body
//     const users = await User.findAll();

//     return res.json(users)
// })

module.exports = router;
