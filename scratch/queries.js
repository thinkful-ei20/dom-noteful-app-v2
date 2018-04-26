'use strict';

const knex = require('../knex');

knex
  .from('notes')
  .select()
  .where({id: 4})
  .then(result => console.log(result));