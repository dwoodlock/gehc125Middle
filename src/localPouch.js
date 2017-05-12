//localPouch.js

function setItem(db, id, doc) {
  return db.get(id)
  .then((info) => {
    return Promise.resolve(info._rev)
  })
  .catch((err) => {
    if (err.error === "not_found") {
      return Promise.resolve(undefined);      
    } else {
      return Promise.reject(err);
    }
  })
  .then((rev) => {
    const newDoc = Object.assign({}, doc, {_id: id, _rev: rev});
    return db.put(newDoc)
  })
}

module.exports = {setItem}