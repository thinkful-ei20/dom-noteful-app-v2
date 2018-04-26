'use strict';

const express = require('express');

// Create an router instance (aka "mini-app")
const router = express.Router();

const knex = require('../knex');

// Get All (and search by query)
router.get('/notes', (req, res, next) => {
  const { searchTerm } = req.query;
  const { folderId } = req.query;
  knex('notes')
    .select('notes.id', 'title', 'content', 'folders.id as folder_id', 'folders.name as folder_name')
    .leftJoin('folders', 'notes.folder_id', 'folders.id')
    .modify(queryBuilder => {
      if (searchTerm) {
        queryBuilder.where('title', 'like', `%${searchTerm}%`);
      }
    })
    .modify(queryBuilder => {
      if (folderId) {
        queryBuilder.where('folder_id', folderId);
      }
    })
    .orderBy('notes.id')
    .then(list => res.json(list))
    .catch(err => next(err));
});

// Get a single item
router.get('/notes/:id', (req, res, next) => {
  const qid = req.params.id;
  knex('notes')
    .select('notes.id', 'title', 'content', 'folder_id', 'folders.name as folderName')
    .leftJoin('folders', 'notes.folder_id', 'folders.id')
    .where('notes.id', qid)
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
  const {title, content, folder_id} = req.body;
  const updateObj = {
    title, content, folder_id
  };

  /***** Never trust users - validate input *****/
  if (!updateObj.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  knex('notes')
    .update(updateObj)
    .where({id: qid})
    .returning('id')
    .then(() => {
      return knex.select('notes.id', 'title', 'content', 'folder_id', 'folders.name as folderName')
        .from('notes')
        .leftJoin('folders', 'notes.folder_id', 'folders.id')
        .where('notes.id', qid);
    })
    .then(item => res.json(item[0]))
    .catch(err => {next(err);});
});

// Post (insert) an item
router.post('/notes', (req, res, next) => {
  const { title, content, folder_id } = req.body;

  const newItem = { title, content, folder_id };
  /***** Never trust users - validate input *****/
  if (!newItem.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  knex('notes')
    .insert(newItem)
    .returning('id')
    .then(([id]) => {
      const noteId = id;
      return knex('notes')
        .select('notes.id', 'title', 'content', 'folder_id', 'folders.name as folder_name')
        .leftJoin('folders', 'notes.folder_id', 'folders.id')
        .where('notes.id', noteId);
    })
    .then(item => res.location(`http://${req.headers.host}/api/notes/${item[0].id}`).status(201).json(item[0]))
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
