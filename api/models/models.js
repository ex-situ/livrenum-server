'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var WorkSchema = new Schema({
  title: {
    type: String,
    trim: true,
    Required: true
  },
  corpus: {
    type: [{type:String, trim:true}],
    default: []
  },
  actors: {
    type:[{
      actor: {
        type: Schema.Types.ObjectId,
        ref: 'Actor',
        Required: true
      },
      role: {
        type: String,
        Required: true
      },
      isMajor: {
        type: Boolean,
        default: false
      },
      _id: false
    }],
    default: []
  },
  actorsEtAl: {
    type: Boolean,
    default: false
  },
  type: {
    type: [{type: String, trim: true}],
    default: []
  },
  publisher: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  edition: {
    type: String,
    trim: true
  },
  volumeNo: {
    type: String,
    trim: true
  },
  publicationNo: {
    type: String,
    trim: true
  },
  editionComment: {
    type: String,
    trim: true
  },
  url: {
    type: String,
    trim: true
  },
  languages: {
    type: [{type: String, trim: true}],
    default: []
  },
  keywords: {
    type: [{type: String, trim: true}],
    default: []
  },
  description: {
    type: String,
    trim: true
  },
  domains: {
    type: [{ type: String, trim: true}],
    default: []
  },
  mediaCharacteristics:{
    type: [{ type: String, trim: true}],
    default: []
  },
  interactionTypes: {
    type: [{ type: String, trim: true}],
    default: []
  },
  report: {
    type: String
  },
  relevance: {
    type: Number,
    min: 0,
    max: 5
  },
  comments: {
    type: String,
    trim: true
  },
  synthesis: {
    type: String,
    trim: true
  },
  awards: {
    type: [{type: String, trim:true}],
    default: []
  },
  platforms: {
    type: [{type: String, trim:true}],
    default: []
  },
  draft: {
    type: Boolean,
    default: true
  },
  found: {
    type: String,
    trim: true
  },
  datePublished: {
    type: Date
  },
  yearPublished: {
    type: Number
  },
  serie: {
    type: String,
    trim: true
  },
  pageCount: {
    type: Number
  },
  pageStart: {
    type: String,
    trim: true
  },
  pageEnd: {
    type: String,
    trim: true
  },
  entryCreated: {
    type: Date,
    default: Date.now
  },
  entryBy: {
    type: String,
    default: ""
  },
  media: {
    type: [ {type: Schema.Types.Mixed} ],
    default: []
  },
  medium: {
    type: [{ type: String, trim: true}],
    default: []
  },
  quotes: {
    type: [ {type: String, trim:true} ],
    default: []
  },
  relations:{
    type: [{
      work: {
        type: Schema.Types.ObjectId,
        ref: 'Work',
        Required: true
      },
      relationType: {
        type: String,
        Required: true
      },
      _id: false
    }],
    default: []
  }
});

WorkSchema.virtual('cover')
  .get(function() {
    return this.media.find( function(m) { return m.isCover === true}) || { title: "Non disponible", url:"/static/assets/images/non-disponible.png", description: ""};
  });

WorkSchema.set('toJSON', {virtuals:true});

var ActorSchema = new Schema({
  isOrganization: {
    type: Boolean,
    default: false
  },
  name: {
    type: String,
    default: ""
  },
  firstName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
  surname: {
    type: String,
    trim: true,
    default: ""
  },
  useSurname: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    trim: true,
    default: ""
  },
  country: {
    type: String,
    trim: true,
    default: ""
  },
  city: {
    type: String,
    trim: true,
    default: ""
  },
  dateCreated: {
    type: String,
    trim: true,
    default: ""
  },
  dateEnded: {
    type: String,
    trim: true,
    default: ""
  },
  comments: {
    type: String,
    trim: true,
    default: ""
  },
  awards: {
    type: [ {type: String, trim:true} ],
    default: []
  },
  works: {
    type: [ { type: Schema.Types.ObjectId, ref: 'Work' } ],
    default: []
  },
  media: {
    type: [ {type: Schema.Types.Mixed} ],
    default: []
  }
});

ActorSchema.virtual('fullName')
  .get(function() {
    if (this.isOrganization) {
      return this.name;
    } else {
      if ( (this.surname && this.useSurname) || (this.surname && !this.firstName && !this.lastName) ) {
        return this.surname
      } else {
        if (this.firstName && this.lastName) {
          return this.firstName + " " + this.lastName;
        } else {
          return "PROBLÈME DE NOM"
        }
      }
    }
  })
  .set(function(str) {
    this.name = str;
    this.firstName = str.substr(0, str.indexOf(' '));
    this.lastName = str.substr(str.indexOf(' ') + 1);
  });

ActorSchema.virtual('fullNameReverse')
  .get(function() {
    if (this.isOrganization) {
      return this.name;
    } else {
      if ( (this.surname && this.useSurname) || (this.surname && !this.firstName && !this.lastName) ) {
        return this.surname
      } else {
        if (this.firstName && this.lastName) {
          return this.lastName + ", " + this.firstName;
        } else {
          return "PROBLÈME DE NOM"
        }
      }
    }
  })
  .set(function(str) {
    this.name = str;
    this.lastName = str.substr(0, str.indexOf(','));
    this.firstName = str.substr(str.indexOf(' ') + 1);
  });

ActorSchema.set('toJSON', {virtuals:true});

module.exports = mongoose.model('Work', WorkSchema);
module.exports = mongoose.model('Actor', ActorSchema);
