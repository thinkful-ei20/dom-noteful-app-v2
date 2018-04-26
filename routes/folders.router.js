'use strict';

const express = require('express');

// Create an router instance (aka "mini-app")
const router = express.Router();

const knex = require('../knex');

// Get all folders
router.get('/folders', (req, res, next) => {
  knex('folders')
    .select('id', 'name')
    .then(results => res.json(results))
    .catch(err => next(err));
});

// Get one folder
router.get('/folders/:id', (req, res, next) => {
  const qid = req.params.id;
  knex('folders')
    .where('id', qid)
    .then(result => {
      if (result) {
        res.json(result[0]);
      } else { next();}
    })
    .catch(err => next(err));
});

// Update a folder
router.put('/folders/:id', (req, res, next) => {
  const qid = req.params.id;
  const updateObj = {};
  const updateField = 'name';
  if (updateField in req.body) {
    updateObj[updateField] = req.body[updateField];
  }
  if (!updateObj.name) {
    const err = new Error('Missing the `name` in request body bruh.');
    err.status = 400; return next(err);
  }
  knex('folders')
    .update(updateObj)
    .where({id: qid})
    .returning(['id', 'name'])
    .then(folder => res.json(folder[0]))
    .catch(err => {next(err);});
});

router.post('/folders', (req, res, next) => {
  const { name } = req.body;
  if (!name) {
    const err = new Error('Missing the `name` in request body bruh.');
    err.status = 400; return next(err);
  }
  knex('folders')
    .insert({ name })
    .returning(['id', 'name'])
    .then(folder => res.location(`http://${req.headers.host}/api/folders/${folder[0].id}`).status(201).json(folder))
    .catch(err => { next(err); });
});

module.exports = router;