var express = require('express');
var mysql = require('mysql');
var dbconfig = require('../config/database.js');
var connection = mysql.createConnection(dbconfig);

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.status(200).json(
    {
      "" : true
    }
  );
});

router.post('/login', function(req, res) {
  const id = req.body.id;
  const pwd = req.body.pwd;

  if(id === undefined){
    res.status(200).json(
      {
        "message" : "id is undefined"
      }
    )
    return 0; 
  }

  if(pwd === undefined){
    res.status(200).json(
      {
        "message" : "pwd is undefined"
      }
    )
    return 0; 
  }

  res.status(200).json(
    {
      "id" : id,
      "pwd" : pwd
    }
  );
});

router.get('/db', function(req,res) {
  connection.query('SELECT * FROM member', function(err,rows, fields){
    if(err) throw err;

    res.status(200).json(rows);
  })
})

module.exports = router;
