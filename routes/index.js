var express = require('express');
var router = express.Router();
const nodemailer = require('nodemailer');


const getLocation = require("../getLocation");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
  
//Misc Routes
router.get('/file/uploads/profilePics/:name', function (req, res) {
  //console.log("test up");
  res.sendFile(path.join(__dirname, '/file', 'uploads', 'profilePics', req.params.name));
})

function sendLoc(res, loc) {
  res.send(loc);
}

router.get('/location/:lat/:lon', (req, res, next) => {
  //console.log("req", req.params);
  getLocation(Number(req.params.lat), Number(req.params.lon), res, sendLoc);
})

router.post('/email-verify', (req, res) => {
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
  var mailOptions = {
    from: process.env.GMAIL_USERNAME,
    to: req.body.email,
    subject: 'Verify New User',
    //text: 'Hello, please click the link to confirm this address',
    html: <h1></h1>
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

module.exports = router;
