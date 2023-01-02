// backend/utils/validation.js
const { validationResult } = require('express-validator');

// middleware for formatting errors from express-validator middleware
// (to customize, see express-validator's documentation)
const handleValidationErrors = (req, _res, next) => {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
        const errors = validationErrors
            .array()
            .map((error) => `${error.msg}`);

        const err = Error('Bad request.');
        err.errors = errors;
        err.status = 400;
        err.title = 'Bad request.';
        next(err);
    }
    next();
};



const userValidationErrors = (req, res, next) => {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
        let errors = validationErrors
            .array()
            .map((error) => ({ [error.param]: error.msg }));


        const err = Error();
        err.errors = Object.assign(errors[0], ...errors);
        err.status = 400;
        err.statusCode = 400
        err.message = "Validation error"
        next(err);

    }
    next();
};


const reviewValidationErrors = (req, res, next) => {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
        let errors = validationErrors
            .array()
            .map((error) => ({ [error.param]: error.msg }));


        const err = Error();
        err.errors = Object.assign(errors[0], ...errors);
        err.status = 403;
        err.statusCode = 403
        err.message = "Validation error"
        next(err);

    }
    next();
};

module.exports = {
    handleValidationErrors,
    userValidationErrors,
    reviewValidationErrors
};
