'use strict';

const fs   = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'products.json');

function readDB() {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch (e) {
    return [];
  }
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

function getAll()     { return readDB(); }
function getById(id)  { return readDB().find(function(p) { return p.id === parseInt(id, 10); }); }
function getNextId()  { var all = readDB(); return all.length ? Math.max.apply(null, all.map(function(p) { return p.id; })) + 1 : 1; }

function create(data) {
  var all  = readDB();
  var item = Object.assign({ id: getNextId(), createdAt: new Date().toISOString() }, data);
  all.push(item);
  writeDB(all);
  return item;
}

function update(id, data) {
  var all = readDB();
  var idx = all.findIndex(function(p) { return p.id === parseInt(id, 10); });
  if (idx === -1) return null;
  all[idx] = Object.assign({}, all[idx], data, { id: all[idx].id, updatedAt: new Date().toISOString() });
  writeDB(all);
  return all[idx];
}

function remove(id) {
  var all = readDB();
  var idx = all.findIndex(function(p) { return p.id === parseInt(id, 10); });
  if (idx === -1) return null;
  var deleted = all.splice(idx, 1)[0];
  writeDB(all);
  return deleted;
}

module.exports = { getAll, getById, create, update, remove };
