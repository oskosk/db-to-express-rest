var debug = require("debug")("db-to-express-api"),
  extend = require("extend"),
  validator = require("validator"),
  join = require("path").join,
  sprintf = require("sprintf"),
  express = require("express"),
  path = require("path"),
  nedb = require("nedb"),
  monk = require("monk"),
  rest = require("./rest");

module.exports = dbapi;

function dbapi(collection, options, middleware) {
  if (!(this instanceof dbapi)) {
    return new dbapi(collection, options, middleware);
  }
  this.db = null;
  // Default options
  this.options = extend({
    dbtype: "nedb",
    uri: "localhost/mydb",
    // By default use an sprintf template for NeDB filename
    filename: join(process.cwd(), "db", "%s.db"),
  }, options);

  // accept a collection name as first argument
  if (typeof collection === "string") {
    if ("nedb" === this.options.dbtype) {
      // Create a NeDB file database for the collection
      validateCollectionName(collection);
      debug("Creating NeDB database for collection '%s'", collection);
      this.db = getNeDBCollection(collection, this.options);
    } else if ("mongodb" === this.options.dbtype) {
      // Create a Monk collection
      validateCollectionName(collection);
      debug("Using MongoDB collection '%s' on '%s'", collection,
        this.options.uri);
      var mongodb = monk(this.options.uri);
      this.db = mongodb.get(collection);
    } else {
      throw new Error("Use 'nedb' or 'mongodb' for option dbtype");
    }
    // accept a nedb instance or a monk.Collection instance as first argument
  } else {
    if (collection instanceof nedb) {
      // Guess collection name from nedb filename property.
      this.db = collection;
      collection = path.basename(collection.filename, path.extname(collection.filename));
      debug("Using existing NeDB database as collection '%s'", collection);
    } else if (collection instanceof monk.Collection) {
      this.db = collection;
      //figure out collection name from monk collection
      collection = this.db.name;
      debug("Using existing Monk collection '%s'", collection);

    }
  }


  var router = express.Router();
  debug("Attaching API router to /" + collection);

  var restrouter = rest(collection, this.db, middleware);
  router.use("/" + collection, restrouter);
  return router;
}

function argumentsToArray(obj) {
  var ar = [];
  for (var i = 0; i < obj.length; i++) {
    ar.push(obj[i]);
  }
  return ar;
}

function getNeDBCollection(collection, options) {
  var store = require("nedb");
  options.filename = sprintf(options.filename, collection);
  options.autoload = true;
  var collection = new store(options);
  return collection;
}

function validateCollectionName(name) {
  if ("collection" === name) {
    throw new Error("Please do not use 'collection' as a collection name.");
  }
  if (!validator.isAlphanumeric(name)) {
    var e = sprintf("collection name '%s' is not valid. " +
      "Please use an alphanumeric string.", name);
    throw new Error(e);
  }
}