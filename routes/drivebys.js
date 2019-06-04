var express = require('express');
var router = express.Router();
const multer = require('multer');
const Path = require('path');

const fs = require('fs');
const mkdirp = require('mkdirp');

const DB = require('../Schemas/DBModel');
const User = require('../Schemas/UserModel');

//External Setups (AWS / Google Sheets)
const uploadFile = require('../aws').uploadFile;
const AppendDB = require('../sheets');

//Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const date = new Date()
    var path = Path.join('./file/uploads/', date.getFullYear().toString(), (date.getMonth() + 1).toString(), date.getDate().toString());
    console.log("path of new Image: ", path);
    mkdirp(path, function (err) {
      cb(null, path);
    });
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
const upload = multer({ storage: storage });

router.post('/byUserId', async (req, res) => {
  console.log("id test: " + req.body.id)
  DB.find({ "finder": req.body.id }, (err, docs) => {
    if (err) {
      console.log(err);
      res.send({
        response: -1
      })
    }
    else {
      //console.log(docs);
      res.send({
        response: 0,
        docs: docs
      })
    }
  })
})

router.get('/all', async (req, res) => {
  console.log("getting");
  DB.find({}, (err, docs) => {
    if (err) {
      console.log(err);
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
    try {
      uploadFile('varodrive', req.file.path)
    } catch (err) {
      console.log("Uploading to AWS: ", err);
    }
    //getBuckets();
    fs.unlink(req.file.path, (err) => {
      if (err) {
        console.error(err)
        return
      }
    })
    res.send({
      response: 0,
      path: req.file.path
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
  console.log("t: " + type);
  console.log("path: " + req.body.path);
  let date = new Date(req.body.date);
  let street = req.body.address.substring(0, req.body.address.indexOf(","))
  //let path = req.body.path.split('\\').join('/');  
  var path = req.body.path.replace(/\\/g, "/");
  User.findOne({ "__id": req.body.id })
    .then( async (user) => {
      await AppendDB([
        "", //initials
        "https://s3-us-west-1.amazonaws.com/varodrive/" + path, //pic
        date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear(), //date
        street, //street
        req.body.city, //city
        req.body.state,
        req.body.post, //zip
        req.body.county,
        type,
        (user["fName"][0] + user["lName"][0])//driver name
      ])
    })
  await DB.create(
    {
      address: req.body.address,
      picturePath: path, // req.body.path,
      date: req.body.date,
      type: type,
      vacant: req.body.vacant,
      burned: req.body.burned,
      boarded: req.body.boarded,
      finder: req.body.finder,
      latitude: req.body.lat,
      longitude: req.body.lon
    }
  ).then(async (res2) => {
    console.log("Done!");
    await res.send({
      response: 0,
      message: "Submission Complete!"
    });
  }, async (err) => {
    await res.send({
      response: -1,
      message: "Form Incomplete"
    })
    co
    vxgfsole.log("err:" + err);
  }
  )
})

module.exports = router;
