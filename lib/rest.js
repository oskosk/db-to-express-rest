var extend = require("extend"),
  d = require("debug"),
  bodyparser = require("body-parser"),
  express = require("express");

module.exports = api;
/**
 *
 * @param {String} collectionName. The name to use on HTTP routes
 * @param {Object} document collection instance. The NeDB or monk.COllection instance
 * @param {Function} middleware1, middleware2, middleware3.
 */
function api(collectionName, db, middleware) {
  var debug = d("db-to-express-api:router:" + collectionName);
  router = express.Router();
  //decode bot json encoded bodies and url-encoded bodies
  router.use(bodyparser.json());
  router.use(bodyparser.urlencoded({
    limit: "50mb",
    extended: false
  }));
  if (middleware && middleware.length) {
    middleware.forEach(function(m) {
      if (typeof m === 'function') {
        debug("Attaching middleware to express.Router() for collection '%s'" +
          " prior to REST methods", collectionName);
        router.post("/", m);
        router.put("/:_id", m);
      }
    });
  }

  //set application/json type
  router.route("/")
    .get(function(req, res) {
      db.find({}, function(err, data) {
        if (err) {
          res.status(500).send(err);
        } else {
          res.json(data);
        }
      })
    }).post(function(req, res) {
      db.insert(req.body, function(err, data) {
        if (err) {
          res.status(500).send(err);
        } else {
          debug("Created new object in collection %s", collectionName);
          res.json(data);
        }
      })
    });
  router.route("/:_id")
    .get(function(req, res) {
      debug("Finding object in collection '%s' with _id='%s'", collectionName, req.params._id);
      db.findOne({
        _id: req.params._id
      }, function(err, data) {
        if (err) {
          res.status(500).send(err);
        } else if (!data) {
          debug("Didn't find object with _id='%s' in collection '%s'", req.params._id, collectionName)
          res.status(404).json(data);
        } else {
          res.json(data);
        }
      });
    })
    .put(function(req, res) {
      debug("Trying to update object with _id = '%s' in collection '%s'", req.params._id, collectionName);
      db.update({
        _id: req.params._id
      }, req.body, function(err, numReplaced) {
        if (err) {
          debug("Error updating object with _id='%s' in collection '%s'", req.params._id, collectionName)
          res.status(500).send(err);
        } else if (!numReplaced) {
          debug("Didn't find object with _id='%s' in collection '%s'", req.params._id, collectionName)
          res.status(404).json(data);
        } else {
          debug("Updated object with _id='%s' in collection '%s'", req.params._id, collectionName)
          db.findOne({
            _id: req.params._id
          }, function(err, data) {
            if (err) {
              res.status(500).send(err);
            } else if (!data) {
              debug("Didn't find object with _id='%s' ufter updating it on collection '%s'", req.params._id, collectionName)
              res.status(404).json(data);
            } else {
              res.json(data);
            }
          });
        }
      });
    })
    .delete(function(req, res) {
      debug("Trying to destroy object with _id='%s' from collection '%s'", req.params._id, collectionName);
      db.remove({
        _id: req.params._id
      }, {}, function(err, numRemoved) {
        if (err) {
          res.status(500).send(err);
        } else if (!numRemoved) {
          debug("Didn't find object with _id='%s' on collection '%s'", req.params._id, collectionName)
          res.status(404).send({});
        } else {
          debug("Removed object with _id='%s', from collection '%s'", req.params._id, collectionName)
          res.json({});
        }
      });
    });
  return router;
}