'use strict';

const knex = require('../knex');

knex
  .from('folders')
  .select()
  .then(results => console.log(results));