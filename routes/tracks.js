var express = require('express');
var router = express.Router();
const Track = require("../Schemas/Track");
const User = require("../Schemas/UserModel");

router.post('/init', async (req, res) => {
    const { userId, date, tracker } = req.body
    try {
        let track = undefined
        if(tracker.length) track = await Track.findById(tracker || "")
        if(!track){
            let new_track = await Track.create({
                path: [],
                date: date,
                userId: userId
            })
            await User.findByIdAndUpdate(userId, {tracker: new_track._id})
            res.send({tracker: new_track._id})
        } else res.send({tracker: track._id})
    } catch(err) {
        console.log("err making", err)
        res.send({tracker: ""})
    }
})

router.put('/end', async (req, res, next) => {
    const { userId, tracker } = req.body
    try {
        if(tracker && userId){
            let track = await Track.findById(tracker)
            track.complete = true;
            track.save({complete: true})
            await User.findByIdAndUpdate(userId, {tracker: ""})
        }
        res.send("ended track")
    } catch(err) {
        console.log("err ending track", err)
        res.send("err ending track")
    }
})
router.post('/', async (req, res) => {
    const { location, userId, tracker } = req.body;
    const { coords, timestamp } = location;
    if(!!tracker){
        try{
            Track.findOne({ userId: userId, _id: tracker }, async (err, track) => {
                if(track){
                    track.path = [...track.path, {
                        latitude: coords.latitude,
                        longitude: coords.longitude,
                        timestamp: new Date(timestamp).getTime(),
                        speed: coords.speed
                    }]
                    track.save()
                    res.send({tracker: track._id})
                }
            })
        } catch(err) {
            res.send("error updating track")
        }
    } else {
        res.send('no track found')
    }
})

router.get('/', (req, res, next) => {
    Track.find().then((tracks)=>{
        res.send(tracks)
    }).catch((err)=>{
        res.send(`err, ${err}`);
    })
})

router.get('/byId/:id', (req, res, next) => {
    const {id} = req.params;
    Track.findById(id).then((track)=>{
        res.send(track);
    }).catch((err)=>{
        console.log('err', err)
        res.send({});
    })
})

module.exports = router;