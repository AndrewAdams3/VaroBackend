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

router.post('/byUserId', async (req, res) => {
  //console.log("id test: " + req.body.id)
  DB.find({ "finder": req.body.id }, (err, docs) => {
    if (err) {
      //console.log(err);
      res.send({
        response: -1
      })
    }
    else {
      ////console.log(docs);
      res.send({
        response: 0,
        docs: docs
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
      type = 'NOD'
      break;
    case 1:
      type = 'HHS'
      break;
    case 2:
      type = 'DB'
      break;
    case 3:
      type = 'Tax Auction'
      break;
    case 4:
      type = 'Lot'
      break;
    default:
      break;
  }
  let date = new Date(req.body.date);
  let street = req.body.address.substring(0, req.body.address.indexOf(","))
  let path = Path.join("s3-us-west-1.amazonaws.com/varodrive/" + req.body.path);
  path = Path.normalize(path);
  path = slash(path);
  //console.log("path: ", path);
  path = "https://" + path;
  let hyperPath = `=HYPERLINK("${path}","View Image")`;
  Async.parallel([
    () =>
      User.findOne({ "_id": req.body.id })
        .then(async (user) => {
//          console.log(`id: ${req.body.id}, user: ${user["fName"]}`);
          AppendDB([
            "", //initials
            hyperPath, //pic
            date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear(), //date
            street, //street
            req.body.city, //city
            req.body.state,
            req.body.post, //zip
            req.body.county,
            type,
            (user["fName"][0] + user["lName"][0])//driver name
          ])
        }),
    () =>
      DB.create(
        {
          address: req.body.address,
          picturePath: path, // req.body.path,
          date: req.body.date,
          type: type,
          vacant: req.body.vacant,
          burned: req.body.burned,
          boarded: req.body.boarded,
          finder: req.body.id,
          latitude: req.body.lat,
          longitude: req.body.lon
        }
      )
  ], (err, results) => {
      if(!err){
        res.send({
          response: 0,
          message: "Submission Complete!"
        });
      }
      res.send({
        response: -1,
        message: "Form Incomplete"
      })
  })
  res.send({
    response: 0,
    message: "Good Submit"
  })
})

module.exports = router;
