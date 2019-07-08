var express = require('express');
var router = express.Router();

const Assignments = require('../Schemas/AssignmentModel');

router.post('/addAssignment', (req, res, next) => {
  const { assignment, date, userId } = req.body;
  Assignments.create({
    Addresses: assignment,
    Date: date,
    userId: userId
  })

  res.send({
    tst: "ok"
  })
})

router.get('/byId/:userId', (req, res, next) => {
  var docs = Assignments.find({
    "userId": req.params.userId
  }).sort("-Date").limit(20);
  docs.exec((err, docs) => {
    if (!err) {
      res.send(docs);
    }
    else {
      res.send([]);
    }
  })
})

router.get('/byId/incomplete/:userId', (req, res, next) => {
  Assignments.find({
    "userId": req.params.userId,
    "completed": false
  }, (err, docs) => {
    if (!err)
      res.send(docs);
    else res.send({data: {}});
  })
})

router.put('/complete/byId/:id', (req, res, next) => {
  Assignments.findOneAndUpdate({
    "_id": req.params.id
  }, {completed: true}, (err, doc, res) => {
    if(!err) res.send({ok: -1});
    else res.send({ok: 1});
  })
})

router.put('/complete/one/:userId', (req, res) => {
  Assignments.updateMany({
    "userId": req.params.userId,
    "Addresses": { $elemMatch: {address: req.body.address} }
  }, {
    $set: { "Addresses.$[element].completed": true} },
    {
      multi: true,
      arrayFilters: [{ "element.address": { $eq: req.body.address } }]
    }, (err, data) => {
      if(!err){
        res.send({ok: 1});
      } else{
        res.send({ok: -1})
      }
    })
})

module.exports=router;