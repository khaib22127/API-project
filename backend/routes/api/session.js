// backend/routes/api/session.js
const express = require('express');

const { setTokenCookie, restoreUser, userAuth } = require('../../utils/auth');
const { User } = require('../../db/models');

const router = express.Router();

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');


const validateLogin = [
    check('credential')
        .exists({ checkFalsy: true })
        .notEmpty()
        .withMessage('Please provide a valid email or username.'),
    check('password')
        .exists({ checkFalsy: true })
        .withMessage('Please provide a password.'),
    handleValidationErrors
];



// Log in
// POST /api/session
router.post('/', validateLogin, async (req, res, next) => {
    const { credential, password } = req.body;

    const user = await User.login({ credential, password });

    if (!user) {
        // const err = new Error('Login failed');
        // err.status = 401;
        // err.title = 'Login failed';
        // err.errors = ['The provided credentials were invalid.'];
        // return next(err);
        res.status(400);
        return res.json({
            "message": "Validation error",
            "statusCode": 400,
            "errors": {
                "credential": "Email or username is required",
                "password": "Password is required"
            }
        })
    }
    next(err);

    await setTokenCookie(res, user);

    return res.json({
        user: user,
    });
}
);


// Log out
// DELETE /api/session
router.delete('/', (_req, res) => {
    res.clearCookie('token');
    return res.json({ message: 'success' });
});



// Restore session user
// GET /api/session
router.get('/', restoreUser, (req, res) => {
    const { user } = req;
    if (user) {
        return res.json({ user: user.toSafeObject() });
    } else {
        res.status(401);
        return res.json({
            "message": "Invalid credentials",
            "statusCode": 401
        })
    }
}
);








module.exports = router;
