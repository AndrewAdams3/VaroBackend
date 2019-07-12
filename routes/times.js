var express = require('express');
var router = express.Router();

const TimeClock = require('../Schemas/TimeClock');

router.post('/newTime', (req, res) => {
  TimeClock.create({
    startTime: req.body.sTime,
    userId: req.body.id,
    startLocation: req.body.sLocation,
  })
  res.send({
    ok: true
  })
  //console.log(req.body.sTime + "stime: " + req.body.sTime);
})

router.get('/byId/:id/:sTime/:eTime', (req, res) => {
  let times = TimeClock.find({
    userId: req.params.id,
    "startTime": { $gte: new Date(req.params.sTime).getTime(), $lte: new Date(req.params.eTime).getTime() + 86400000}
  }).limit(30).sort("-startTime");
  times.exec((err, docs) => {
    res.send(docs);
  })
})

router.get('/byId/:id/:limit', (req, res) => {
  let times = TimeClock.find({
    userId: req.params.id,
  }).limit(req.params.limit).sort("-startTime");
  times.exec((err, docs) => {
    res.send(docs);
  })
})

router.post('/', (req, res) => {
  TimeClock.findOne({ "userId": req.body.id, "endTime": -1 }).exec((err, res2) => {
    if (err) {
      //console.log("Error finding tc\n" + err);
      return;
    }
    if (!res2) {
      //console.log("no tc found");
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
  //console.log(new Date(req.body.eTime));
  //console.log("testing stime: " + req.body.sTime);
  TimeClock.findOneAndUpdate({ "userId": req.body.id, "endTime": -1 }, {
    "endTime": req.body.eTime,
    "endLocation": req.body.eLocation,
    "totalTime": req.body.eTime - req.body.sTime
  }, (err) => {
    if (err) {
      //console.log("err with tc: " + err);
      res.send({
        ok: false
      });
    }
    res.send({
      ok: true
    })
  })
})

module.exports = router;
