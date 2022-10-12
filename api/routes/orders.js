const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const order = require("../models/order");

const Order = require("../models/order");
const Product = require("../models/product");

// Handel incoming GET request to /orders
router.get("/", (req, res, next) => {
  Order.find()
    .select("product quantity _id")
    .populate('product', 'name')
    .exec()
    .then((docs) => {
      res.status(200).json({
        count: docs.length,
        orders: docs.map((docs) => {
          return {
            productId: docs.product,
            _id: docs._id,
            quantity: docs.quantity,
            requests: {
              type: "GET",
              url: "http://localhost:3000/orders/" + docs._id,
            },
          };
        }),
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

router.post("/", (req, res, next) => {
  Product.findById(req.body.productId)
    .then((product) => {
        if(!product){
            return res.status(404).json({
                message: "Product not found"
            })
        }
      const order = new Order({
        _id: mongoose.Types.ObjectId(),
        quantity: req.body.quantity,
        product: req.body.productId,
      });
      return order.save();
    })
    .then((result) => {
      console.log(result);
      res.status(201).json({
        message: "Order Stored",
        createdOrder: {
          _id: result._id,
          productId: result.product,
          quantity: result.quantity,
        },
        requests: {
          type: "GET",
          url: "http://localhost:3000/orders/" + result._id,
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.get("/:orderId", (req, res, next) => {
    Order.findById(req.params.orderId)
    .populate('product')
    .exec()
    .then(order => {
        res.status(200).json({
            order: order,
            requests: {
                type: "GET",
                url: "http://localhost:3000/orders/"
            }
        })
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    })
//   res.status(200).json({
//     message: "Orders was created",
//     orderId: req.params.orderId,
//   });
});

router.delete("/:orderId", (req, res, next) => {
  res.status(200).json({
    message: "Order deleted",
    orderId: req.params.orderId,
  });
});

module.exports = router;
