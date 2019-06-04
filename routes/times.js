var express = require('express');
var router = express.Router();

const TimeClock = require('../Schemas/TimeClock');

router.post('/newTime', (req, res) => {
  TimeClock.create({
    startTime: req.body.sTime,
    userId: req.body.id,
    startLocation: req.body.sLocation,
  })
  console.log(req.body.sTime + "stime: " + req.body.sTime);
})

router.post('/byId', (req, res) => {
  TimeClock.find({ "userId": req.body.id }, (err, times) => {
    if (!err) {
      if (req.body.sDate) {
        var sd = new Date(req.body.sDate);
        var ed = new Date(req.body.eDate);
        var ts = times.map((time) => {
          var d = new Date(time.startTime);
          if (d.getTime() > sd.getTime() && d.getTime() < ed.getTime()) {
            return time;
          }
        })
        res.send({
          times: ts
        })
        return;
      }
      res.send({
        times: times
      })
      return;
    }
    console.log("err: " + err);
  })
})

router.post('/', (req, res) => {
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

router.put('/endTime', (req, res) => {
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
