var express = require("express"),
  validate = require("express-form2"),
  bodyparser = require("body-parser"),
  field = validate.field;

app = express();

var expressrest = require("../");
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({
  extended: false
}));



//app.post("/api/cars", validateCars());
app.use("/api", expressrest("cars", {}, [validate(
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
app.use("/api", expressrest("users"));
app.use("/api", expressrest("estates"));

app.listen(process.env.PORT || 3000);