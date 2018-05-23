'use strict';
module.exports = function(app) {
  var controller = require('../controllers/controllers');

  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,DELETE,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  app.route('/works')
    .get(controller.list_all_works)
    .post(controller.create_work);

  app.route('/works/:workId')
    .get(controller.read_work)
    .put(controller.update_work)
    .delete(controller.delete_work);

  app.route('/actors')
    .get(controller.list_all_actors)
    .post(controller.create_actor);

  app.route('/actors/:actorId')
    .get(controller.read_actor)
    .put(controller.update_actor)
    .delete(controller.delete_actor);
};
