const express = require('express')

const { Op } = require("sequelize");
const { Spot, Review, SpotImage, User, sequelize } = require('../../db/models');
const router = express.Router();
const { check } = require('express-validator');
const { userValidationErrors } = require('../../utils/validation');
const { requireAuth, restoreUser, userPermission } = require('../../utils/auth');



// Add an Image to a Spot based on the Spot's id
// Create and return a new image for a spot specified by id.
// POST  /api/spots/:spotId/images
router.post('/:spotId/images', requireAuth, userPermission, async (req, res) => {

    const spotId = req.params.spotId
    const { url, preview } = req.body;

    const image = await SpotImage.create({
        spotId: spotId,
        url,
        preview
    });

    return res.json({
        id: image.id,
        url: image.url,
        preview: image.preview
    })
});


module.exports = router;
