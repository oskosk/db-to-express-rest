var express = require("express");

app = express();

var expressrest = require("../");

var store = require("nedb");
var join = require("path").join;
var s = new store({
  filename: join(process.cwd(), "db", "s" + ".db"),
  autoload: true
});

app.use("/api", expressrest(s));

app.listen(process.env.PORT || 3000);