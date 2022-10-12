const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  },
});

const upload = multer({ storage: storage });

const Product = require("../models/product");

router.get("/", (req, res, next) => {
    console.log(storage)
  Product.find()
    .select("name price _id productImage")
    .exec()
    .then((docs) => {
      const response = {
        
        count: docs.length,
        products: docs.map((docs) => {
          return {
            name: docs.name,
            price: docs.price,
            productImage: docs.productImage,
            // productImage: docs.productImage,
            _id: docs._id,
            request: {
              type: "GET",
              url: "http://localhost:3000/products/" + docs._id,
            },
          };
        }),
      };
      //   if (docs.length >= 0) {
      res.status(200).json(response);
      //   } else {
      //     res.status(404).json({
      //       message: "No entry founf",
      //     });
      //   }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.post("/", upload.single("productImage"), (req, res, next) => {
  const product = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price,
    productImage: `http://localhost:3000/uploads/${req.file.filename}`
  });

  //save() is a method provided by mongoose to Store this in the database
  product
    .save()
    .then((result) => {
      console.log(result);
      res.status(201).json({
        message: "Created product successfully",
        createdProduct: {
          name: result.name,
          price: result.price,
          productImage: result.productImage,
          _id: result._id,
          request: {
            type: "GET",
            url: "http://localhost:3000/products/" + result._id,
          },
        },
      });
    })
    .catch((err) => {
      console.log("MM " + err);
      res.status(500).json({
        error: err,
      });
    });
});

router.get("/:productId", (req, res, next) => {
  const id = req.params.productId;
  Product.findById(id)
    .select("name price _id productImage")
    .exec()
    .then((doc) => {
      console.log("From Database" + doc);
      if (doc) {
        res.status(200).json({
          product: doc,
          request: {
            type: "GET",
            description: "GET_ALL_PRODUCTS",
            url: "http://localhost:3000/products/",
          },
        });
      } else {
        res.status(404).json({
          message: "No valid entry found for provided product ID",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

//Patch is not clear brush it up
router.patch("/:productId", (req, res, next) => {
  const id = req.params.productId;
  const updatesOps = {};
  for (const ops of req.body) {
    updatesOps[ops.propName] = ops.value;
  }
  Product.updateOne(
    { _id: id },
    {
      $set: { name: updatesOps },
    }
  )
    .exec()
    .then((result) => {
      console.log(result);
      res.status(200).json(result);
    })
    .catch((err) => {
      console.log("ME ", err);
      res.status(500).json({
        error: err,
      });
    });
});

router.delete("/:productId", (req, res, next) => {
  const id = req.params.productId;
  Product.remove({ _id: id })
    .exec()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

module.exports = router;
