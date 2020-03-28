var express = require("express");
var router = express.Router();
const multer = require("multer");
const Path = require("path");
const slash = require("slash");
const Async = require("async");
const formidable = require("formidable");

const fs = require("fs");
const mkdirp = require("mkdirp");

const DB = require("../Schemas/DBModel");
const User = require("../Schemas/UserModel");

//External Setups (AWS / Google Sheets)
const uploadFile = require("../aws").uploadFile;
//const AppendDB = require("../sheets");

//Storage
const storage = multer.diskStorage({
  destination: async function(req, file, cb) {
    const date = new Date();
    var path = Path.join(
      "file/uploads/",
      date.getFullYear().toString(),
      (date.getMonth() + 1).toString(),
      date.getDate().toString()
    );
    mkdirp(path, function(err) {
      cb(null, path);
    });
  },
  filename: async function(req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });

router.get("/byUserId/:userId/:limit/:sort", async (req, res) => {
  try {
    let docs = await DB.find({
      finder: req.params.userId
    })
      .sort(req.params.sort)
      .limit(Number(req.params.limit));
    res.send({
      response: 0,
      docs: docs
    });
  } catch (err) {
    console.log("err", err);
    res.send({
      response: -1,
      docs: []
    });
  }
});

//old
router.post("/byUserId", (req, res) => {
  let docs = DB.find({ finder: req.body.id })
    .sort(req.body.sort)
    .sort("-date")
    .limit(req.body.limit);
  docs.exec((err, dbs) => {
    if (err) {
      console.log(err);
      res.send({
        response: -1
      });
    } else {
      res.send({
        response: 0,
        docs: dbs
      });
    }
  });
});

router.get("/all/:skip", async (req, res) => {
  DB.find({})
    .sort("-date")
    .limit(50)
    .skip(req.params.skip)
    .then((err, docs) => {
      if (err) {
        res.send({ response: -1, docs: [] });
      } else {
        res.send({ response: 0, docs: docs });
      }
    });
});

router.get("/byId/:id", (req, res) => {
  DB.findById(req.params.id)
    .then(doc => {
      res.send(doc);
    })
    .catch(err => {
      console.log("err getting db", err);
      req.send({});
    });
});

router.get("/all", async (req, res) => {
  //console.log("getting");
  DB.find({}, (err, docs) => {
    if (err) {
      //console.log(err);
      res.send({
        response: -1,
        docs: []
      });
    } else {
      res.send({
        response: 0,
        docs: docs
      });
    }
  });
});

router.post("/upload-db", upload.single("image"), async (req, res) => {
  try {
    if (!req.body.id) {
      res.send({ ok: false });
    }
    await uploadFile("varodrive", slash(req.file.path));
    fs.unlink(req.file.path, err => {
      console.log("err unlink", err);
    });
    const already = await DB.find({ street: req.body.street });

    if (already.length > 0) {
      res.send({
        already: true
      });
    } else {
      let path = Path.join(
        "s3-us-west-1.amazonaws.com/varodrive/" + req.file.path
      );
      path = Path.normalize(path);
      path = slash(path);
      path = "https://" + path;

      await DB.create({
        address: req.body.address,
        street: req.body.street,
        state: req.body.state.toLowerCase(),
        picturePath: path, // req.body.path,
        date: req.body.date,
        type: req.body.type,
        vacant: req.body.vacant,
        burned: req.body.burned,
        boarded: req.body.boarded,
        finder: req.body.id,
        latitude: req.body.latitude,
        longitude: req.body.longitude
      });
    }
  } catch (err) {
    console.log("uploading", err);
  }
  res.send({ ok: true });
});

router.put("/status", async (req, res) => {
  try {
    const driveby = await DB.findOneAndUpdate(
      { _id: req.body.id },
      { status: req.body.staus }
    );
    switch(status){
      case 'Verified':
        break;
      case 'Rejected':
        break;
      case 'Deal Made':
        break;
      default:
        console.log('status not caught', status)
    }
  } catch (err) {
    console.log("err updating driveby status", err);
  }
});

router.put("/updateDB", (req, res, next) => {
  DB.findOneAndUpdate(
    {
      _id: req.body.id
    },
    {
      [req.body.field]: req.body.update
    },
    (err, doc) => {
      if (err) {
        console.log(err);
        res.send({ ok: false });
      } else {
        console.log(doc);
        res.send({ ok: true });
      }
    }
  );
});

module.exports = router;
