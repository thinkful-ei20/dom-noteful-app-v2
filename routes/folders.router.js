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
      } else {
        next();
      }
    })
    .catch(err => next(err));
});

module.exports = router;