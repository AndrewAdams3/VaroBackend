var express = require('express');
var router = express.Router();

const TimeClock = require('../Schemas/TimeClock');

router.post('/data/times', (req, res) => {
  TimeClock.findOne({ "userId": req.body.id, "endTime": -1 }).exec((err, res2) => {
    if (err) {
      console.log("Error finding tc\n" + err);
      return;
    }
    if (!res2) {
      console.log("no tc found");
      res.send({
        found: false
      });
      return;
    } else {
      res.send({
        sTime: res2["startTime"],
        found: true
      })
    }
  });
})

router.put('/data/times/endTime', (req, res) => {
  console.log(new Date(req.body.eTime));
  console.log("testing stime: " + req.body.sTime);
  TimeClock.findOneAndUpdate({ "userId": req.body.id, "endTime": -1 }, {
    "endTime": req.body.eTime,
    "endLocation": req.body.eLocation,
    "totalTime": req.body.eTime - req.body.sTime
  }, (err) => {
    if (err) {
      console.log("err with tc: " + err);
      return;
    }
    //    console.log("put success");
  })
})

module.exports = router;
