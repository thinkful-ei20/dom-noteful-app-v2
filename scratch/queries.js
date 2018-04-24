'use strict';

const knex = require('../knex');

let qid = 3;
// knex
//   .select('notes.id', 'title', 'content')
//   .from('notes')
//   .modify(queryBuilder => {
//     if (searchTerm) {
//       queryBuilder.where('title', 'like', `%${searchTerm}%`);
//     }
//   })
//   .orderBy('notes.id')
//   .then(results => {
//     console.log(JSON.stringify(results, null, 2));
//   })
//   .catch(err => {
//     console.error(err);
//   });
knex('notes')
  .select('id','title', 'content')
  .modify(queryBuilder => {
    if (qid) {
      queryBuilder.where({id: qid});
    }
  })
  .orderBy('id')
  .then(results => {console.log(JSON.stringify(results, null, 2));});