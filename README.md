## db-to-express-rest

A module to mount an express **REST API** [Express](http://expressjs.com) 
automagically from a MongoDB database or a NeDB database.

## Installation 

    npm install db-to-express-rest

## Usage

Creating API endpoints and collections (database collections) for several
kind of objects at once.

    var express = require("express"),
      dbtorest = require("db-to-express-rest"),
      app = express();


     app.use(dbtorest("cars"));
     app.use(dbtorest("categories"));


## Using with mongoDB

pass option `dbtype`.


## Validating data. 

### Validating url-encoded

### validating json data.

## Creating a frontend the API with