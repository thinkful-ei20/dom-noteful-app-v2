'use strict';

const express = require('express');

// Create an router instance (aka "mini-app")
const router = express.Router();

const knex = require('../knex');

// Get All (and search by query)
router.get('/notes', (req, res, next) => {
  const { searchTerm } = req.query;
  knex('notes')
    .select('id', 'title', 'content')
    .modify(queryBuilder => {
      if (searchTerm) {
        queryBuilder.where('title', 'like', `%${searchTerm}%`);
      }
    })
    .orderBy('id')
    .then(list => res.json(list))
    .catch(err => next(err));
});

// Get a single item
router.get('/notes/:id', (req, res, next) => {
  const qid = req.params.id;
  knex('notes')
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

// Put update an item
router.put('/notes/:id', (req, res, next) => {
  const qid = req.params.id;

  /***** Never trust users - validate input *****/
  const updateObj = {};
  const updateableFields = ['title', 'content'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  });

  /***** Never trust users - validate input *****/
  if (!updateObj.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  knex('notes')
    .update(updateObj)
    .where({id: qid})
    .returning(['id','title','content'])
    .then(item => res.json(item))
    .catch(err => {next(err);});
});

// Post (insert) an item
router.post('/notes', (req, res, next) => {
  const { title, content } = req.body;

  const newItem = { title, content };
  /***** Never trust users - validate input *****/
  if (!newItem.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  knex('notes')
    .insert(newItem)
    .returning(['id', 'title', 'content'])
    .then(item => res.location(`http://${req.headers.host}/api/notes/${item[0].id}`).status(201).json(item))
    .catch(err => { next(err); });
});

// Delete an item
router.delete('/notes/:id', (req, res, next) => {
  const qid = req.params.id;

  knex('notes')
    .del()
    .where({id: qid})
    .then(() => res.sendStatus(204))
    .catch(err => {next(err);});
});

module.exports = router;
