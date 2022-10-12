const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const productRoutes = require("./api/routes/products");
const orderRoutes = require("./api/routes/orders");

// Connecting to MongoDB ATLAS
try {
  mongoose.connect(
    "mongodb+srv://" +
      process.env.MONGO_ATLAS_USERNAME +
      ":" +
      process.env.MONGO_ATLAS_PASSWORD +
      "@cluster0.u6rvu6x.mongodb.net/?retryWrites=true&w=majority",
    () => console.log("DB connected")
  );
} catch (err) {
  console.log("MM " + err);
  process.exit(1);
}
mongoose.Promise = global.Promise;

app.use(morgan("dev"));
app.use('/uploads',express.static('uploads'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header("Acess-Control-Allow-Origin", "*");
  res.header(
    "Acess-Control-Allow-Headers",
    "Origin, X-Requested-with, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

// Routes which should handel requests
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);

app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

module.exports = app;
