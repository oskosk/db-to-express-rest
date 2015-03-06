var request = require('supertest'),
  express = require('express'),
  nedb = require("nedb"),
  dbtoexpress = require("..");

var app = express();
var middleware = dbtoexpress("test");
app.use("/api", middleware);

app.listen(3000);

describe('Created collection is a property of returned value', function() {
  it('property collection is instance of nedb', function(done) {
    if (middleware.collection instanceof nedb) {
      done();
    }
  })
  it('property collection is a string', function(done) {
    if (typeof middleware.collectionName === 'string') {
      done();
    }
  })
})