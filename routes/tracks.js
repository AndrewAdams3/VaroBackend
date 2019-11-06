var express = require('express');
var router = express.Router();
const Track = require("../Schemas/Track");

router.post('/', (req, res) => {
    const { location, userId } = req.body;
    const { coords, timestamp } = location;
    Track.findOne({
        userId: userId,
        date: new Date(timestamp).toLocaleDateString()
    }, (err, track) => {
        if(!err){
        if(track){
            track.path = [...track.path, {
            latitude: coords.latitude,
            longitude: coords.longitude,
            timestamp: new Date(timestamp).getTime(),
            speed: coords.speed
            }]
            track.save()
                .then(()=>{
                    res.send('track updated')
                })
                .catch((err)=>{
                    console.log('err updating track',err);
                })
        } else {
            Track.create({
            path: [{
                latitude: coords.latitude,
                longitude: coords.longitude,
                timestamp: new Date(timestamp).getTime(),
                speed: coords.speed
            }],
            date: new Date(timestamp).toLocaleDateString(),
            userId: userId
            }).catch((err)=>{
            console.log("err", err)
            })
            res.send("new track created")
        }
        } else {
        res.send("err creating track")
        }
    })
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