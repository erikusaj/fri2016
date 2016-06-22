import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Mongo } from 'meteor/mongo';
import { Photos } from '../imports/api/photos.js';

import './main.html';

let photos = Photos;

Template.example.events({
    // zajem slike ob kliku na gumb
    'click .takePhoto': function(event, template) {
        var cameraOptions = {
            width:  480,
            height: 320
        };
        // če ne pride do napake sliko srhanimo v zbirko
        MeteorCamera.getPicture(cameraOptions, function (error, data) {
           if (!error) {
             Materialize.toast('Nova slika!', 4000);
             // vstavimo v zbirko
             photos.insert({
               image: data,
               time: new Date()
             });
             // sliko še prikažemo
             template.$('.photo').attr('src', data);
           }
           else {
              Materialize.toast('ERROR: '+error, 4000);
           }
        });
        event.preventDefault();
    }
});







Template.filmstrip.helpers({
  album() {
    var today = new Date();
    today.setHours(0,0,0,0);
    return photos.find({}, {sort:{time:-1}}).fetch();
  },

  stringify(){
    return JSON.stringify(this, null, 4);
  }
});

Template.filmstrip.events({
  'click .opencv': function(event, template){
    console.log(this._id);
    Materialize.toast('Analiza: '+ this._id, 4000);
    Meteor.call('runOCV', this._id);
  },

  'click .microsoft': function(event, template){
    console.log(this._id);
    Materialize.toast('Analiza: '+ this._id, 4000);
    Meteor.call('runMCS', this._id);
  },

  'click .delete': function(event, template){
    console.log(this._id);
    Materialize.toast('Brišem ...', 4000);
    Meteor.call('deletePhoto', this._id);
  }

});

Template.navbar.onCreated(function helloOnCreated() {
  // counter starts at 0
  // this.counter = new ReactiveVar(0);
});

Template.navbar.helpers({
  counter() {
    return photos.find({}).count();
  }
});
