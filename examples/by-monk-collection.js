var express = require("express");

app = express();

var expressrest = require("../");

var monk = require("monk")("localhost/mydb");
var cars = monk.get("cars");

app.use("/api", expressrest(cars));

app.listen(process.env.PORT || 3000);