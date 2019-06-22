var express = require('express');
var router = express.Router();
const multer = require('multer');
const nodemailer = require('nodemailer');
var mkdirp = require('mkdirp');


const User = require('../Schemas/UserModel');
const generate_key = require('../helpers/crypt').generate_key;
const encryptPass = require('../helpers/crypt').encryptPass;

//Storage
const storage2 = multer.diskStorage({
  destination: function (req, file, cb) {
    var path = 'file/uploads/profilePics/'
    mkdirp(path, function (err) {
      cb(null, path);
    });
  },
  filename: function (req, file, cb) {
    //console.log("fileName in Storage: ", file.originalname);
    cb(null, file.originalname)
  }
})

const upload2 = multer({ storage: storage2 });


/* GET users listing. */
router.get('/', function(req, res, next) {
  User.find({}).then(function (users) {
    res.send(users);
  });
});

router.get('/byId/:id', function (req, res, next) {
  User.findOne({"_id": req.params.id}).then(function (user) {
    res.send(user);
  });
});

router.put('/update', function (req, res) {
  User.findOne({ "_id": req.body.id }, (err, doc) => {
    if (err) {
      //console.log("error: " + err)
      res.send({
        success: false
      })
    } else {
      //console.log("params: ", req.body.fName, req.body.lName, req.body.city);
      if (req.body.fName)
        doc["fName"] = req.body.fName
      if (req.body.lName)
        doc["lName"] = req.body.lName
      if (req.body.email)
        doc["email"] = req.body.email
      if (req.body.city)
        doc["city"] = req.body.city
      if (req.body.state)
        doc["state"] = req.body.state
      if (req.body.address) {
        doc["mailingAddress"] = req.body.address;
      }
      doc.save();
      res.send({
        success: true
      })
    }
  });
})

router.put('/webSesh', (req, res) => {
  console.log(req.body);
  let seshId = generate_key();
  User.findOneAndUpdate({"_id": req.body.id}, {
    webShesh: {
      lastPage: req.body.lastPage || "",
      seshId: seshId || ""
    }
  })
})

router.put('/onclock', function (req, res) { // change /data/users to /onclock
  //console.log("id: " + req.body.id)
  //console.log("onclock: " + req.body.value);
  User.findOneAndUpdate({ "_id": req.body.id }, { "isOnClock": req.body.value }, (err) => {
    if (err) {
      //console.log("error: " + err)
      res.send({
        success: false
      })
    } else {
      ////console.log("put success");
      res.send({
        success: true
      })
    }
  });
});

router.post('/profilePic', upload2.single('image'), async (req, res) => {
  for (var i in req.body)
    //console.log("test: " + i);
  if (req.file) {
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

router.put('/profilePic', function (req, res) {
  //console.log("id: " + req.body.id)
  //console.log("pic: " + req.body.value);
  User.findOneAndUpdate({ "_id": req.body.id }, { "profilePic": req.body.value }, (err) => {
    if (err) {
      //console.log("error: " + err)
      res.send({
        success: false
      })
    } else {
      ////console.log("put success");
      res.send({
        success: true
      })
    }
  });
});

router.put('/logout', function (req, res) {
  //console.log("id: " + req.body.id)
  //console.log("onclock: " + req.body.value);
  User.findOneAndUpdate({ "_id": req.body.id }, { 
    "seshId": req.body.value, 
    "webShesh": {
      lastPage: req.body.lastPage || "",
      seshId: seshId || ""
    }
  }, (err) => {
    if (err) {
      //console.log("error: " + err)
      res.send({
        success: false
      })
    } else {
      ////console.log("put success");
      res.send({
        success: true
      })
    }
  });
});

router.post('/id', function (req, res) {
  console.log("test", req.body.seshId);
  User.findOne({ "seshId": req.body.seshId }).then(function (user) {
    if (user) {
      let picture = user["profilePic"].replace(/\\/g, "/");
      console.log("user: " + user["_id"]);
      res.send({
        userId: user["_id"],
        pic: picture,
        fName: user["fName"] || "",
        lName: user["lName"] || "",
        city: user["city"] || "",
        state: user["state"] || "",
        address: user["mailingAddress"] || "",
        isVerified: user["verified"],
        email: user["email"],
        ok: 1
      });
    }
    else {
      res.send({
        ok: 0
      })
    }
  }, (err) => {
    res.send({
      ok: 0
    })
    console.log("id found err: " + err)
  });
});

router.post('/signup', (req, res) => {
  User.find({ "email": req.body.email }, (err, res2) => {
    if (err) {
      //console.log("Signup Error\n" + err);
      return;
    }
    if (!res2.length) {
      var seshId = generate_key();
      var pass = encryptPass(req.body.password)
      User.create(
        {
          password: pass,
          email: req.body.email,
          seshId: seshId
        }
      ).then((user) => {
        //console.log("User Created");
        let transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          requireTLS: true,
          auth: {
            user: process.env.GMAIL_USERNAME,
            pass: process.env.GMAIL_PASSWORD
          }
        });
        var url = 'http://' + process.env.ip + ':3210/data/users/signup/verification/' + user["_id"];
        var mailOptions = {
          from: process.env.GMAIL_USERNAME,
          to: req.body.email,
          subject: 'VaroDrive email confirmation',
          //text: 'Hello, please click the link to confirm this address',
          html: `Hello, please click the link to confirm registration for VaroDrive\n` +
            `Please disregard this message if you did not register for VaroDrive\n ${url}`
        };
        transporter.sendMail(mailOptions, function (err, info) {
          if (err) {
            //console.log("emailerr: ", err);
            res.send({
              created: false
            })
          }
          else {
            res.send({
              created: true,
              seshId: seshId,
              userId: user["_id"]
            });
          }
        });
      })
    } else {
      //console.log("User Already Exists");
      res.send({ created: false });
    }
  });
})

router.get('/signup/isVerified/:id', (req, res) => {
  User.findOne({ "_id": req.params.id }, (err, user) => {
    if (user) {
      if (user["verified"] == true) {
        //console.log("verified");
        res.send({
          ok: true
        });
      }
      else {
        //console.log("user found not verified");
        res.send({ ok: false })
      }
    }
    else {
      //console.log("no user found verified");
      res.send({ ok: false })
    }
  });
})

router.get('/signup/verification/:id', (req, res) => {
  User.findOne({ "_id": req.params.id }, (err, user) => {
    if (user) {
      user["verified"] = true;
      user.save();
      //console.log("user found, verified");
      res.send({
        msg: "user validated"
      })
    }
    else {
      res.send({
        msg: "no user found"
      })
    }
  })

})

router.post('/login', (req, res) => {
  var pass = encryptPass(req.body.password)
  User.findOne({ "email": req.body.email, "password": pass }).exec((err, res2) => {
    if (err) {
      //console.log("Login Error\n" + err);
      res.send({
        err: err
      });
    }
    if (!res2) {
      //console.log("Invalid user / pass");
      res.send({
        loggedIn: false,
        admin: false
      });
    } else {
      res2["seshId"] = generate_key();
      res2.save((err) => { err ? console.log("error: " + err) : {} });
      res.send({
        loggedIn: true,
        seshId: res2["seshId"],
        userId: res2["_id"],
        verified: res2["verified"],
        admin: res2["admin"],
        user: res2
      })
    }
  });
})



module.exports = router;
