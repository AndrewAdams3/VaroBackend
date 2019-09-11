var express = require('express');
var router = express.Router();

const Assignments = require('../Schemas/AssignmentModel');
const Users = require('../Schemas/UserModel');


router.post('/addAssignment', (req, res, next) => {
  const { assignment, date, userId, notes } = req.body;
  Assignments.create({
    Addresses: assignment,
    Date: date,
    notes: notes,
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

router.delete('/deleteAssignment', (req, res, next) => {
  const { id } = req.body;
  Assignments.findByIdAndRemove(id, (err, doc) => {
    if(!err){
      console.log("deleted")
      res.send({ok: true})
    } else {
      console.log("err deleting", err);
      res.send({ok: false})
    }
  })
})

router.put('/deleteSubAssignment', (req, res, next) => {
  const { id, ass } = req.body;
  Assignments.findOne({
    _id: id
  }, (err, res) => {
    if(!err){
      console.log("doc found: ", res);
      for(var i = 0; i < res.Addresses.length; i++){
        if(res.Addresses[i].address === ass){
          console.log("found ass");
        }
      }
//      res.save()
      res.send({ok: true});
    } else{
      console.log("err deleting sub ass", err)
      res.send({ok: false});
    }
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

router.post('/addtarget/:userId', (req, res)=>{
  Users.findOneAndUpdate({
    _id: req.params.userId
  }, {
    target: {
      area: req.body.target,
      date: req.body.date
    }
  }, (err, doc)=>{
    if(!err){
      res.send({ok: true})
    }
  else {
    res.send({ok: false})
  }
  })
})

router.get('/target/byId/:userId', (req, res) => {
  Users.findOne({
    _id: req.params.userId
  }, (err, res2) => {
    if(err) res.send({})
    else {
      res.send(res2.target);
    }
  })
})

module.exports=router;