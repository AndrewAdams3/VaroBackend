var express = require('express');
var router = express.Router();
const multer = require('multer');
const Path = require('path');
const slash = require('slash');
const Async = require('async');

const fs = require('fs');
const mkdirp = require('mkdirp');

const DB = require('../Schemas/DBModel');
const User = require('../Schemas/UserModel');

//External Setups (AWS / Google Sheets)
const uploadFile = require('../aws').uploadFile;
const AppendDB = require('../sheets');

//Storage
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const date = new Date()
    var path = Path.join('file/uploads/', date.getFullYear().toString(), (date.getMonth() + 1).toString(), date.getDate().toString());
    //console.log("path of new Image: ", path);
    mkdirp(path, function (err) {
      cb(null, path);
    });
  },
  filename: async function (req, file, cb) {
    cb(null, file.originalname)
  }
})
const upload = multer({ storage: storage });

router.post('/byUserId', (req, res) => {
  let docs = DB.find({ "finder": req.body.id }).sort(req.body.sort).sort("-date").limit(req.body.limit);
  docs.exec((err, dbs) => {
    if (err) {
      console.log(err);
      res.send({
        response: -1
      })
    }
    else {
      res.send({
        response: 0,
        docs: dbs
      })
    }
  })
})

router.get('/all', async (req, res) => {
  //console.log("getting");
  DB.find({}, (err, docs) => {
    if (err) {
      //console.log(err);
      res.send({
        response: -1,
        docs: []
      })
    }
    else {
      res.send({
        response: 0,
        docs: docs
      })
    }
  })

})

router.post('/upload', upload.single('image'), async (req, res) => {
  console.log("test", req);
  console.log("testing: ", req.file.originalname);
  if (req.file) {
    Async.series([
        function (callback) {
          uploadFile('varodrive', slash(req.file.path))
          callback(null, 1)
        },
        function (callback) {
          fs.unlink(req.file.path, (err) => {if(err) console.log(err)})
          callback(null, 2)
        }
    ], 
    function(err, res2) {
      //console.log("exiting with " + res2);
      if (err) {
        //console.log(err);
        res.send({
          response: -1
        })
      }
      else{
        res.send({
          response: 0,
          path: slash(req.file.path)
        })
      }
    })
  }
  else {
    res.send({
      response: -1
    })
  }
})

router.post('/NewDB', async (req, res) => {
  var type = ''
  switch (req.body.type) {
    case 0:
      type = 'Lot'
      break;
    case 1:
      type = 'SFH'
      break;
    case 2:
      type = 'MUB'
      break;
    case 3:
      type = "COM"
      break;
    default:
      type = "Assignment"
      break;
  }
  let date = new Date(req.body.date);
  let nd = date.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })
  let path = Path.join("s3-us-west-1.amazonaws.com/varodrive/" + req.body.path);
  path = Path.normalize(path);
  path = slash(path);
  path = "https://" + path;
  let hyperPath = `=HYPERLINK("${path}","View Image")`;
  Async.parallel([
    (cb) =>{
      User.findOne({ "_id": req.body.id })
        .then(async (user) => {
          DB.find({
            street: req.body.street
          }, (err, docs) => {
            AppendDB([
              "", //initials
              hyperPath, //pic
              nd,
              req.body.street, //street
              req.body.city, //city
              req.body.state,
              req.body.post, //zip
              req.body.county,
              type,
              (user["fName"][0].toUpperCase() + user["lName"][0].toUpperCase())//driver name
            ])
            cb(null, docs.length > 1 ? true : false);
          })
        })
      },
    (cb) =>{
      DB.create({
        address: req.body.address,
        street: req.body.street,
        picturePath: path, // req.body.path,
        date: req.body.date,
        type: type,
        vacant: req.body.vacant,
        burned: req.body.burned,
        boarded: req.body.boarded,
        finder: req.body.id,
        latitude: req.body.lat,
        longitude: req.body.lon
      }).then(()=>cb(null)).catch((err)=>{
        cb(err);
      })
    }
  ], (err, results) => {
      if(!err){
        res.send({
          response: 0,
          message: "Submission Complete!",
          already: results[0]
        });
      } else {
        res.send({
          response: -1,
          message: "Form Incomplete"
        })
      }
  })
})

module.exports = router;
