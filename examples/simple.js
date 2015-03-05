var express = require("express");

app = express();

var expressrest = require("../");

app.use("/api", expressrest("users"));
app.use("/api", expressrest("cars"));
app.use("/api", expressrest("estates"));

app.listen(process.env.PORT || 3000);