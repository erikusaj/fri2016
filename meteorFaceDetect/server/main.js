import { Meteor } from 'meteor/meteor';
import cv from 'opencv';
//import im from 'imagemagick';
import fs from 'fs';
import oxford from 'project-oxford';
import { Photos } from '../imports/api/photos.js';
let photos = Photos;

let photoDir = '';

// Ključi za uporabo APIjev storitve Microsoft Cognitive Services
var cFace = new oxford.Client('ključ pridobimo na spletnem mestu Azure');
var cEmotion = new oxford.Client('ključ pridobimo na spletnem mestu Azure');



// Microsoft Cognitive services
function detectFace(file, id, callback)
{
  var faceRect = {};

  cFace.face.detect({
    path: file,
    analyzesAge: true,
    analyzesGender: true
  }).then(function (response) {
    console.log('Microsoft Cognitive Services: FaceAPI zaznava obrazov');
    console.log(response);

    callback && callback(null, response);
  });
}


// Microsoft Cognitive services
function analyzeEmotion(file, id, callback)
{
  var faceRect = {};

  cFace.face.detect({
    path: file,
    analyzesAge: true,
    analyzesGender: true
  }).then(function (response) {
    console.log('Microsoft Cognitive Services: FaceAPI zaznava obrazov');
    console.log(response);

    callback && callback(null, response);
  });

  cEmotion.emotion.analyzeEmotion({
    path: file //,
    //faceRectangles :
  }).then(function (response) {
    console.log('Microsoft Cognitive Services: EmotionAPI zaznava čustev');
    callback && callback(null, response);
  });
}

function DetectOpenCV(file, id, callback)
{
  console.log('OpenCV zaznava obrazov');
  console.log(file +' - '+ id);
  cv.readImage(file, function(err, im){
    im.detectObject( cv.FACE_CASCADE, {}, function(err, faces)
    {
      if (err) throw new Error(err.message)
      else
      {
        callback && callback(null, faces);
      }
    });
  });
}


// from mongo data to file
function MongoImage2file(data, file) {
  console.log('shranimo v datoteko ....');
  let ok = false;
  var fs = require('fs');
  var re = /(?:\.([^.]+))?$/;
  var ext = re.exec(file)[1];
  var isJpeg = (ext == "jpeg" || ext == "jpg") && data.includes('jpeg;base64');
  var isPng = (ext == "png") && data.includes('png;base64');

  if (isJpeg) base64Data = data.replace(/^data:image\/jpeg;base64,/, "");
  if (isPng)  base64Data = data.replace(/^data:image\/png;base64,/, "");

  if (isJpeg || isPng)
  {
    base64Data += base64Data.replace('+', ' ');
    binaryData =  new Buffer(base64Data, 'base64').toString('binary');
    fs.writeFileSync(file, binaryData, "binary");
    console.log('shranjeno v '+ file);
    ok = true;
  }
  else {
    console.log('Wrong file type: ' + ext);
  }
  return ok;
}

function getTempDir()
{
  path = require('path');
  let fs = require('fs');
  let dir = path.resolve('../../../../../../_temp');
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }
  return dir;
}

// Metode Meteor
Meteor.methods({

  runAll: function(id) {
    Meteor.call('runOCV', id);
    Meteor.call('runMCS', id);
  },

  runOCV: function(id) {
    this.unblock();
    console.log(id);
    let image = photos.find({_id:id}).fetch()[0].image;
    //console.log(image);
    if ( image != null ) {
      let name = [photoDir, '/', id ,'.jpg'].join('');
      console.log(name);
      MongoImage2file(image, name);
      var DetectOpenCVSync = Meteor.wrapAsync(DetectOpenCV);
      var rezultat = DetectOpenCVSync(name, id);
      Meteor.call('addOCV', id, rezultat);
    } else {
      console.log('ne najdem slike');
    }
  },

  runMCS: function(id) {
    this.unblock();
    console.log(id);
    let image = photos.find({_id:id}).fetch()[0].image;
    //console.log(image);
    if ( image != null ) {
      let name = [photoDir, '/', id ,'.jpg'].join('');
      console.log(name);
      MongoImage2file(image, name);
      let detectFaceSync = Meteor.wrapAsync(detectFace);
      let rezultat = detectFaceSync(name, id);
      Meteor.call('addMCS', id, rezultat);
    }
  },

  addOCV: function(id, data ){
    photos.upsert(
      {_id:id},
      {
        $set: {
          ocv: data
        }
      }
    );
  },

  addMCS: function(id, data ){
    photos.upsert(
      {_id:id},
      {
        $set: {
          MCS: data
        }
      }
    );
  },

  deletePhoto: function(id){
    this.unblock();
    photos.remove(id);
  }


});


Meteor.startup(() => {
  photoDir = getTempDir();
  console.log(photoDir);
});
