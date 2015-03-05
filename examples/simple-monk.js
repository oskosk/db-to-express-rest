var express = require("express");

app = express();

var expressrest = require("../");

app.use("/api", expressrest("users", {
  dbtype: "mongodb"
}));
app.use("/api", expressrest("cars", {
  dbtype: "mongodb"
}));
app.use("/api", expressrest("estates", {
  dbtype: "mongodb"
}));

app.listen(process.env.PORT || 3000);