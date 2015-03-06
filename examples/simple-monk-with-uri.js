var express = require("express");

app = express();

var expressrest = require("../");

app.use("/api", expressrest("users", {
  dbtype: "mongodb",
  uri: "mongodb://localhost/mysuperdb"
}));
app.use("/api", expressrest("cars", {
  dbtype: "mongodb",
  uri: "mongodb://localhost/mysuperdb"
}));
app.use("/api", expressrest("estates", {
  dbtype: "mongodb",
  uri: "mongodb://localhost/mysuperdb"
}));

app.listen(process.env.PORT || 3000);