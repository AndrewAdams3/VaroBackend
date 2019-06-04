const fs = require('fs');
const s3 = require('./awsConfig');
var Path = require('path');

getBuckets = () => {
  s3.listBuckets((err, data) => {
    if(err)
      console.log("getting bucket err", err);
    else{
      console.log(data.Buckets)
    }
  })
}

getFile = async (bucket, path) => {
  const params = {
    Bucket: bucket,
    Key: path 
  }
  console.log("pathcheck: ", path);
  await s3.getObject(params, (err, data)=> {
    if(err){
      console.log("Error Getting Image: ", err.stack);
      //return {};
    }
    else{
      console.log("testing Data: ", data);
      return data;
    }
  }).then( async (res) => {return res});
}

uploadFile = (bucket, path) => {
  fs.readFile(path, (err, data) => {
    path = path.replace(/\\/g, "/");
    console.log("aws location: ", path, Path.extname(path));
    if (err) throw err;
    const params = {
      Bucket: bucket, // pass your bucket name
      Key: path, // file will be saved as bucket/fileName.ext
      Body: data,
      ACL: 'public-read',
      ContentType: Path.extname(path),
      StorageClass: "INTELLIGENT_TIERING"
    };
    s3.upload(params, function (s3Err, data) {
      if (s3Err) throw s3Err
      console.log(`File uploaded successfully at ${data.Location}`)
    });
  });
};

module.exports.uploadFile = uploadFile;
module.exports.getBuckets = getBuckets;
module.exports.getFile = getFile;
