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
  this.collection = null;
  this.collectionName = undefined;
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
      this.collectionName = collection;
      debug("Creating NeDB database for collection '%s'", this.collectionName);
      this.collection = getNeDBCollection(this.collectionName, this.options);
    } else if ("mongodb" === this.options.dbtype) {
      // Create a Monk collection
      validateCollectionName(collection);
      this.collectionName = collection;
      debug("Using MongoDB collection '%s' on '%s'", this.collectionName,
        this.options.uri);
      var mongodb = monk(this.options.uri);
      this.collection = mongodb.get(this.collectionName);
    } else {
      throw new Error("Use 'nedb' or 'mongodb' for option dbtype");
    }
    // accept a nedb instance or a monk.Collection instance as first argument
  } else {
    if (collection instanceof nedb) {
      // Guess collection name from nedb filename property.
      this.collection = collection;
      this.collectionName = path.basename(collection.filename, path.extname(collection.filename));
      debug("Using existing NeDB database as collection '%s'", this.collectionName);
    } else if (collection instanceof monk.Collection) {
      this.collection = collection;
      //figure out collection name from monk collection
      this.collectionName = this.collection.name;
      debug("Using existing Monk collection '%s'", this.collectionName);

    }
  }


  var router = express.Router();
  // Expose the collection and collectionName properties on the router 
  // for convenience.
  router.collection = this.collection;
  router.collectionName = this.collectionName;
  debug("Attaching API router to /" + this.collectionName);

  var restrouter = rest(this.collectionName, this.collection, middleware);
  router.use("/" + this.collectionName, restrouter);
  return router;
}

function argumentsToArray(obj) {
  var ar = [];
  for (var i = 0; i < obj.length; i++) {
    ar.push(obj[i]);
  }
  return ar;
}

function getNeDBCollection(collectionName, options) {
  var store = require("nedb");
  options.filename = sprintf(options.filename, collectionName);
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