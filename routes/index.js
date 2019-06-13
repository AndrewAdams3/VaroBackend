var express = require('express');
var router = express.Router();
var Async = require('async');

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

module.exports = router;
