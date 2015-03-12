## db-to-express-rest
 
A module to create [Express 4](http://expressjs.com) **REST API routes** 
automagically from [MongoDB](http://www.mongodb.org/) or 
[NeDB](https://www.npmjs.com/package/nedb) document collections.

## Overview

**db-to-express-rest** allows you to create REST API routes for a document collection
with a simple one-liner. 
    
    var dbtoexpress = require("db-to-express-rest");
    app.use("/api", dbtoexpress("artists"));


1. You call `dbtoexpress()` with a collection name.
1. It creates a file-based document collection if it doesn't exist. _See [Using with MongoDB](#using-with-mongodb)_.
1. You `use()` the returned value on your [Express app](http://expressjs.com/4x/api.html#application).
1. And that's it. You have
an HTTP REST interface for that document collection. 

The call to `dbtoexpress()` returns an [express.Router](http://expressjs.com/4x/api.html#router) that is easy
to `app.use()` on your **Express 4** app.

This means that **db-to-express-rest** generates the usual **REST API** methods
for you to easily expose a document collection.


## Installation 

    npm install db-to-express-rest

## Usage

Creating API endpoints and collections for several
kind of documents at once.

    var express = require("express"),
      dbtoexpress = require("db-to-express-rest"),
      app = express();

    app.use("/api", dbtoexpress("records"));
    app.use("/api", dbtoexpress("artists"));
    app.use("/api", dbtoexpress("genres"));

    app.listen(3000);

## Inner workings

This module uses internally [NeDB](https://www.npmjs.com/package/nedb) 
for simple file-based document collections and 
[Monk](https://www.npmjs.com/package/monk) for interfacing with MongoDB document collections.
_The trick is that these modules implement the same interface for finding, inserting, updating and removing documents from collections._


### Auto-generated HTTP routes


The returned `express.Router` provides the following REST actions

* **FIND** - Using the underlying database's `.find()` method.
* **FIND ONE** - Using the underlying database's `.findOne()` method.
* **INSERT** - Using the underlying database's `.insert()` method.
* **UPDATE** - Using the underlying database's `.update()` method.
* **DELETE** - Using the underlying database's `.delete()` method.

See [Exposed REST API](#exposed-rest-api) for further explanation.


## Using file storage for collections (NeDB)

Using a file-based storage is the default behaviour. You can

* Ask **db-to-express-rest** to create collections for you (passing a collection name as first paramenter)
* Use **db-to-express-rest** with your previously created `NeDB` file-based collections.

See [API](#api) for more details on creation.

## Using with mongoDB

pass the option `dbtype` to ` dbtoexpress()`.

    var express = require("express"),
      dbtoexpress = require("db-to-express-rest"),
      app = express();

    app.use("/api", dbtoexpress("records", {dbtype: "mongodb"}));
    app.use("/api", dbtoexpress("artists", {dbtype: "mongodb"}));

    app.listen(3000);

_By default, it will connect to `localhost` and use (create) a database named `mydb`._

* Of course you can pass **db-to-express-rest** your previously created `NeDB` file-based collections.


See [API](#api) for more details on creation.

### MongoDB connection URI

Pass the option `uri` to `dbtoexpress` to use a specific database in a MongoDB instance

    app.use("/api", dbtoexpress("records", {
      dbtype: "mongodb",
      uri: "190.220.8.211/mydatabase"
    }));


## Validating POSTs and PUTs

Validating data is as simple as using a middleware like [express-form2](https://www.npmjs.com/package/express-form2).
You just set a middleware prior to `app.use()`ing the router created by **db-to-express-rest**.

You may think that **expres-form2** is exclusive for form-submitted data but it acts
on `req.body` so it will be as useful on a JOSN encoded body as with a URL encoded one.
  
    validate = require("express-form2");

    app.use("/api", expressrest("cars", {}, [
      validate(
        field("title").isNumeric(),
        field("content").required()
      ),
      function(req, res, next) {
        if (!req.form.isValid) {
          return res.status(400).json(req.form.errors);
        }
        next();
      }
    ]));

## API

### Module

The **db-to-express-rest** module returns a function. 
You specify a collection and options arguments to the main module function. For example:

    var dbtoexpress = require("db-to-express-rest");

#### dbtoexpress(collection, options)

**Arguments**

* `collection` - **Required** - A **string** or an **object**. 

    {String} - If you provide a string, that string will be used as the **collection name**. If you're using NeDB,
that will be the name of the file too. If you're using MongoDB, that will be
the name of the collection.

    {Object} - If you provide  **an instanceof `nedb()`** or **an instance of `monk.Collection`**,
it will be used as the exposed collection. The collection's name for the HTTP routes will be figured out by the
filename if using **NeDB** or by the Mongo collection name used if you're using **MongoDB**. 
* `options` - **Optional** - {Object}
  * `dbtype` - {String} `'nedb'` or `'mongodb'`. _Only required if the 
  `collection` argument is a string._ **Default**: `'nedb'`.
  * `uri` - {String} - Connection URI string for a MongoDB database. The URI is
a standard [MongDB MongoURI](https://api.mongodb.org/java/2.12/com/mongodb/MongoURI.html).
  For example: `'190.220.8.121/mydatabase'`. **Default**: `'localhost/mydb'`. _Only valid if using mongodb_.
  * `filename` - {String} - a filename for NeDB storage. _Only valid if using NeDB_. 
**Default**: `join(process.cwd(), "db", "{collection}.db")`
* `middleware` - **Optional** - {Array} - An array of middleware that will be attachend
on `POST` and `PUT` methods before saving changes.

**Returned value**

The module creates an [express.Router()](http://expressjs.com/4x/api.html#router) and returns it. It also adds two properties
to this object:

* `collection`: {Object} - The collection object used for queries. 
* `collectionName` - {String} - The collection name. This is also the collection name used
for HTTP routes for the REST endpoints.

**Example on using the extra properties on the returned value.**

    var express = require("express"),
      dbtoexpress = require("db-to-express-rest"),
      app = express();

    var dbroutes = dbtoexpress("records", {dbtype: "mongodb"});
    app.use(dbroutes);

    console.log("Exposing REST endpoints for collection %s", dbroutes.collectionName)


### Exposed REST API

All routes respond with `Content-type: application/json`.

Supported REST API requests:

#### GET /{collection_name} 

Returns all documents in the specified collection.

#### POST /{collection_name} 

Insert new document in collection (document in POST body).

#### GET /{collection_name}/:_id

 Returns document with `_id`.

#### PUT /{collection_name}/:_id

Update document with `_id=` (updated document in PUT body)

#### DELETE /{collection_name}/:_id

Delete document with `_id`.

### Content Type

Make sure `application/json` is used as Content-Type when using POST/PUT with request bodies.
Also accepts `url-encoded` parameters coming from a form. (this module loads 
[body-parser](https://www.npmjs.com/package/body-parser)'s `.json()` and 
`urlencoded` mechanisms )
