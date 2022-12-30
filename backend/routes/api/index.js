// backend/routes/api/index.js
const router = require('express').Router();
const sessionRouter = require('./session.js');
const usersRouter = require('./users.js');
const { restoreUser } = require("../../utils/auth.js");
// const currentRouter = require('./spots.js');
const spotsRouter = require('./spots')
const spotsImageRouter = require('./images')
// Connect restoreUser middleware to the API router
  // If current user session is valid, set req.user to the user in the database
  // If current user session is not valid, set req.user to null
  router.use(restoreUser);

  router.use('/session', sessionRouter);


  router.use('/users', usersRouter);

  router.post('/test', (req, res) => {
    res.json({ requestBody: req.body });
  });

  router.use('/spots', spotsRouter)
  router.use('/spots', spotsImageRouter)
  // router.use('/spots/current', currentRouter);

module.exports = router;
