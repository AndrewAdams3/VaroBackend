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

router.get('/one/byId/:id', (req, res) => {
  Assignments.findOne({
    _id: req.params.id
  }, (err, doc) => {
      if (!err) {
        res.send(doc);
      }
      else {
        res.send({});
      }
  });
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

router.delete('/deleteAssignment/:id', (req, res) => {
  const { id } = req.params;
  Assignments.deleteOne({_id: id}, (err) => {
    if(!err){
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
  }, (err, doc) => {
    if(!err){
      var noAss = doc.Addresses.filter(obj => String(obj._id) !== String(ass));
      doc.Addresses = noAss
      if(doc.Addresses.length === 0){
        Assignments.deleteOne({_id: id}, (err)=>err ? console.log("err deleting", err) : console.log("ok deleting"))
      } else{
        doc.save()
      }
      res.send({ok: true});
    } else{
      console.log("err deleting sub ass", err)
      res.send({ok: false});
    }
  })
})

router.put('/update-assignment', (req, res) => {
  const {id, sub_id, date, completed, newAss} = req.body;
  Assignments.findOne({_id: id}, (err, doc) => {
    if(!err){
      if(doc){
        if(String(sub_id).length){
          let found = false
          let done = true
          doc.Addresses.map((add)=>{
            if(String(add._id) === String(sub_id)){
              found = true
              add.completed = completed
              add.address = String(newAss).length ? newAss : add.address
            } else if(add.completed === false) done = false
          })
          if(!completed) doc.completed = false;
          else doc.completed = done
          doc.save();
          res.send({ok: found ? true : false}).end();
        } else{
          if(date){
            let d = new Date(date)
            d.setDate(d.getDate()+1)
            doc.Date = d
          }
          if(completed){
            doc.Addresses.map((ass)=>{
              ass.completed = true
            })
            doc.completed = true
          } else doc.completed = false
          doc.save();
          res.send({ok: true})
        }
      }
    }
  })
})

module.exports=router;