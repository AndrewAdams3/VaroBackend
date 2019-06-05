var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
  
//Misc Routes
router.get('/file/uploads/profilePics/:name', function (req, res) {
  //console.log("test up");
  res.sendFile(path.join(__dirname, '/file', 'uploads', 'profilePics', req.params.name));
})

module.exports = router;
