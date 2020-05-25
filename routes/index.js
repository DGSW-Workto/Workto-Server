var express = require('express');
var mysql = require('mysql');
var dbconfig = require('../config/database.js');
var connection = mysql.createConnection(dbconfig);
var crypto = require('crypto');
var async = require('async');
var jwt = require('jsonwebtoken');
var config = require('../config/config');

var router = express.Router();

function Makehash(password){
  return new Promise(function(res, rej){
    crypto.randomBytes(66, (err, buf) => {
      crypto.pbkdf2(password, buf.toString('base64'), 163437, 66, 'sha512',  (err, key) => {
        const data = [key.toString('base64'), buf.toString('base64')];
        res(data);
      })
    });
  })
}

function MakeJWT(nickname){
  return new Promise(function(res,rej){
    jwt.sign(
      {
        "nickname": nickname
      },
      config.secret,
      {
        expiresIn: '1d',
        issuer: 'worktogether.com'
      }, (err, token) => {
        if (err) rej(err)
        res(token)
      }
    )
  })
}



/* GET home page. */
router.get('/', function(req, res) {
  res.status(200).json(
    {
      "" : true
    }
  );
  res.status(200).json(
    {
      "" : false
    }
  )
});

router.post('/join', async function(req,res) {
  const body = req.body;

  if(body.password === undefined) {
    res.status(200).json(
      {
        "400" : "no password"
      }
    )
    return 0;
  }else if(body.member_id === undefined) {
    res.status(200).json(
      {
        "400" : "no member_id"
      }
    )
    return 0;
  }else if(body.name === undefined) {
    res.status(200).json(
      {
        "400" : "no name"
      }
    )
    return 0;
  }else if(body.nickname === undefined) {
    res.status(200).json(
      {
        "400" : "no nickname"
      }
    )
    return 0;
  }else if(body.image === undefined) {
    res.status(200).json(
      {
        "400" : "no image"
      }
    )
    return 0;
  }else if(body.skills === undefined) {
    res.status(200).json(
      {
        "400" : "no skills"
      }
    )
    return 0;
  }else if(body.email === undefined) {
    res.status(200).json(
      {
        "400" : "no email"
      }
    )
    return 0;
  }

  var data;
  data  =  await Makehash(body.password);

  var users = {
    "member_id": body.member_id,
    "salt": data[1],
    "hash": data[0],
    "name": body.name,
    "nickname": body.nickname,
    "image": body.image,
    "skills": body.skills,
    "email": body.email,
  }

  connection.query('INSERT INTO member SET ?', users, function (err, rows, fields) {
    if(err){
      if(err.sqlMessage === `Duplicate entry '${users.member_id}' for key 'PRIMARY'`) {
        res.status(200).json(
          {
            "400" : "ID error"
          }
        )
      } else if (err.sqlMessage === `Duplicate entry '${users.email}' for key 'email_UNIQUE'`) {
          res.status(200).json(
            {
              "400" : "email error"
            }
          )
        } else if (err.sqlMessage === `Duplicate entry '${users.nickname}' for key 'nickname_UNIQUE'`){
            res.status(200).json(
              {
                "400" : "nickname error"
              }
            )
          } else {
              res.status(200).json(
                { 
                  "400" : "unknown error"
                }
              )
              return 0;
            }
    } else {
      res.status(200).json(
        {
          "200" : "register success"
        }
      )
    }
  })
})  


router.post('/login', async function(req, res) {
  const id = req.body.id;
  const pwd = req.body.pwd;

  if(id === undefined || id === ""){
    res.status(200).json(
      {
        "message" : "id is empty"
      }
    )
    return 0; 
  }

  if(pwd === undefined || pwd === ""){
    res.status(200).json(
      {
        "message" : "pwd is empty"
      }
    )
    return 0; 
  }

  connection.query(`SELECT * FROM member WHERE member_id = '${id}'`, function (err,rows,fields) {
    if(err){
      if(err.sqlMessage === `Unknown column '${id}' in 'where clause'`){
        res.status(200).json(
          {
            "400" : "id error"
          }
        )
        return 0;
      } else {
          console.log(err);
        }
    } else {
      crypto.pbkdf2(pwd, rows[0].salt, 163437, 66, 'sha512',  async(err, key) => {
        if(rows[0].hash === key.toString('base64')){
            const token = await MakeJWT(rows[0].nickname);
            res.status(200).json(
              {
                "200": "login success",
                "token": token
              }
            )
        } else{
          res.status(200).json(
            {
              "400": "can't match"
            }
          )
        }
      })
    } 
  })

  // res.status(200).json(
    
  //     "id" : id,
  //     "pwd" : pwd
  //   }
  // );
});

module.exports = router;
