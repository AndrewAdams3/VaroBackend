var express = require('express');
var router = express.Router();

const Assignments = require('../Schemas/AssignmentModel');
const Users = require('../Schemas/UserModel');


router.post('/addAssignment', (req, res, next) => {
  const { assignment, date, userId } = req.body;
  Assignments.create({
    Addresses: assignment,
    Date: date,
    userId: userId
  }).then(()=>{
    res.send({
      ok: true
    })
  }).catch((err) => {
    console.error(err);
    res.send({
      ok: false
    })
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
  Assignments.findOne({
    "_id": req.params.id,
  }, (err, doc) => {
    if (err) res.send({ ok: -1 });
    else if(doc){
      let c = true;
      for(var i = 0; i < doc.Addresses.length; i++){
        if(doc.Addresses[i].completed === false){
          c = false;
          break;
        }
      }
      if(c){
        doc["completed"] = true;
        doc.save();
      }
      res.send({ ok: 1 });
    } else {
      res.send({ok: 1});
    }
  })
})

router.put('/complete/one/:userId', (req, res) => {
  Assignments.updateMany({
    "userId": req.params.userId,
    "Addresses": { $elemMatch: {address: req.body.address} }
  }, {
    $set: { "Addresses.$[element].completed": true} 
  },{
      multi: true,
      arrayFilters: [{ "element.address": { $eq: req.body.address } }]
  }, (err, data) => {
    if (!err) res.send({ ok: 1 });
    else res.send({ ok: -1 });
  })
})

router.post('/addtask/:userId', (req, res)=>{
  console.log("test", req.body.task, req.body.date)
  Users.findOneAndUpdate({
    _id: req.params.userId
  }, {
    currentTask: {
      area: req.body.task,
      date: req.body.date
    }
  }, (err, doc)=>{
    console.log("doc", doc);
    if(!err){
      res.send({ok: true})
    }
  else {
    console.log("err",err);
    res.send({ok: false})
  }
  })
})

module.exports=router;