'use strict';

var mongoose = require('mongoose')
var Work = mongoose.model('Work');
var Actor = mongoose.model('Actor');

let reciprocalRelations = {
  "est une version de": "a pour version",
  "a pour version": "est une version de",
  "est une réécriture de": "a pour réécriture",
  "a pour réécriture": "est une réécriture de",
  "est un remake de": "a pour remake",
  "a pour remake": "est un remake de",
  "fait mention de": "est mentionné par",
  "est mentionné par": "fait mention de",
  "s'inspire de": "a inspiré",
  "a inspiré": "s'inspire de",
  "est une critique de": "est critiqué par",
  "est critiqué par": "est une critique de",
  "est une illustration de": "est illustré par",
  "est illustré par": "est une illustration de",
  "est la source de": "a pour source",
  "a pour source": "est la source de",
  "est la suite de": "a pour suite",
  "a pour suite": "est la suite de",
  "cite": "est cité par",
  "est cité par": "cite",
  "est une remédiation de": "est remédié par",
  "est remédié par": "est une remédiation de",
  "contient": "est contenu dans",
  "augmente": "est augmenté par",
  "est augmenté par": "augmente"
};

function log(message, req) {
  let d = new Date();
  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  ip = ip || "?.?.?.?";

  console.log(`${d.toLocaleDateString()} ${d.toLocaleTimeString()} \t ${ip} \t ${message}`);
}

function addReciprocalRelations(sourceWork) {
  return new Promise(function(resolve, reject) {
    // Ajout des relations du document mis à jour
    sourceWork.relations.forEach( srcRelation => {

      Work.findById(srcRelation.work).exec(function(err, targetWork) {
        if (err) {
          console.log("Erreur de mise à jour des relations!");
        }

        if (!targetWork.relations.some(
          relation => {
            return relation.work.toString() == sourceWork.id && relation.relationType == reciprocalRelations[srcRelation.relationType];
          })) {

          // Le relation inverse n'existe pas
          targetWork.relations.push( {
            work: sourceWork.id,
            relationType: reciprocalRelations[srcRelation.relationType]
          });

          targetWork.save(function(err, work) {
            if (err) {
              console.log("Erreur lors de la mise à jour des relations réciproques");
              reject();
            }
          });
        }
      });
    });
    resolve();
  });
}

function cleanRelationsTo(sourceWork) {
  return new Promise(function(resolve, reject) {

    Work.find({ "relations.work": sourceWork.id }).exec(function(err, relatedWorks) {
      if (err) {
        console.log("Erreur de mise à jour des relations!");
        reject();
      }

      relatedWorks.forEach( relatedWork => {
        // Ne pas traiter le document à l'origine du nettoyage
        if (relatedWork.id != sourceWork.id) {

          // Conserver les relations qui...
          relatedWork.relations = relatedWork.relations.filter(function(relation) {
            // ...ne pointent pas vers le document à l'origine du nettoyage
            if (relation.work.toString() != sourceWork.id) {
              return true;
            }

            // ...ont leur relation inverse dans le document à l'origine du nettoyage
            if (sourceWork.relations.find( srcWorkRelation => {
              return srcWorkRelation.work.toString() == relatedWork.id && srcWorkRelation.relationType == reciprocalRelations[relation.relationType];
            })) {
              return true
            }

            return false;
          });

          relatedWork.save(function(err, work) {
            if (err) {
              console.log("Erreur lors de l'enregistrement!");
              reject();
            }
          });
        }

      });
    });
    resolve();
  });
}

function deleteRelationsTo(workId) {
  return new Promise(function(resolve, reject) {

    Work.find({ "relations.work": workId }).exec(function(err, relatedWorks) {
      if (err) {
        console.log("Erreur lors de la suppression des relations!");
        reject();
      }

      // Pour toutes les fiches...
      relatedWorks.forEach( relatedWork => {
        // Ne pas traiter le document à l'origine du nettoyage
        if (relatedWork.id != workId && relatedWork.relations) {
          relatedWork.relations = relatedWork.relations.filter(function(relation) {
            if (relation.work.toString() != workId)
              return true;

            return false
          });

          relatedWork.save(function(err, work) {
            if (err) {
              console.log("Erreur lors de l'enregistrement!");
              reject();
            }
          });
        }
      });
      resolve();
    });
  });
}

// Works
exports.list_all_works = function(req, res) {
  log("Liste des oeuvres", req);
  Work.find({}).populate('actors.actor').exec(function(err, doc) {
    if (err)
      res.send(err);

//    res.json(doc);
    var docs = [];
    doc.forEach(d => {
      var tmpMedia = [];
      d.media.forEach( m => {
        m.url = m.url.replace('livrenum.crilcq.org', 'starbuck.ex-situ.info');
        tmpMedia.push(m);
      });
      d.media = tmpMedia;
      docs.push(d);
    });
    res.json(docs);
  });
};

exports.create_work = function(req, res) {
  var new_doc = new Work(req.body);
  log(`Ajout d'une oeuvre: ${new_doc.title} (${new_doc.id})`, req);
  new_doc.populate('actors.actor').save(function(err, newWork) {
    if (err)
      res.send(err);

    // Ajout des relations du document mis à jour
    addReciprocalRelations(newWork).then(function() {
      res.json(newWork);
    });
  });
};

exports.read_work = function(req, res) {
  log("Get Work", req);
  Work.findById(req.params.workId).populate('actors.actor').exec(function(err, doc) {
    if (err) {
      res.send(err);
    }
    res.json(doc);
  });
};

exports.update_work = function(req, res) {
  log(`Mise à jour d'une oeuvre: ${req.body.title} (${req.params.workId})`, req);
  Work.findByIdAndUpdate({_id: req.params.workId}, req.body, {new: true}).populate('actors.actor').exec(function(err, updatedWork) {
    if (err) {
      res.send(err);
    }

    // Ajout des relations du document mis à jour
    addReciprocalRelations(updatedWork).then(function() {
      cleanRelationsTo(updatedWork).then(function() {
        res.json(updatedWork);
      });
    });
  });
};

exports.delete_work = function(req, res) {
  log(`Suppression d'une oeuvre: ${req.params.workId}`, req);

  Work.remove({
    _id: req.params.workId
  }, function(err, work) {
    if (err)
      res.send(err);

    deleteRelationsTo(req.params.workId)
    .then(function() {
      res.json({ message: 'Work successfully deleted' });
    })
    .catch(function() {
      console.log("Erreur lors de la suppression");
      res.json(work);
    });
  });
};

// Actors
exports.list_all_actors = function(req, res) {
  log(`Liste des créateurs`, req);

  Actor.find({}, function(err, actor) {
    if (err)
      res.send(err);
    res.json(actor);
  });
};

exports.create_actor = function(req, res) {
  var new_actor = new Actor(req.body);
  log(`Ajout d'un créateur: ${new_actor.name} (${new_actor.id})`, req);
  new_actor.save(function(err, actor) {
    if (err)
      res.send(err);
    res.json(actor);
  });
};

exports.read_actor = function(req, res) {
  Actor.findById(req.params.actorId, function(err, actor) {
    if (err) {
      res.send(err);
    }
    log(`Créateur: ${req.params.actorId}`, req);
    res.json(actor);
  });
};

exports.update_actor = function(req, res) {
  log(`Mise à jour d'un créateur: "${req.body.name}" (${req.params.actorId})`, req);
  Actor.findByIdAndUpdate(req.params.actorId, req.body, {new: true}, function(err, actor) {
    if (err)
      res.send(err);
    res.json(actor);
  });
};

exports.delete_actor = function(req, res) {
  log(`Suppression d'un créateur: ${req.params.actorId}`, req);
  Actor.remove({
    _id: req.params.actorId
  }, function(err, actor) {
    if (err)
      res.send(err);
    res.json({ message: 'Actor successfully deleted' });
  });
};
