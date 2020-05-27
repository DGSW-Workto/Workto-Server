var express = require('express');
var token = require('./token');
var mysql = require('mysql');
var dbconfig = require('../config/database.js');
var connection = mysql.createConnection(dbconfig);

var router = express.Router();

router.post('/', async function(req,res,next) {
    const isLogin = await token.verify(req,res,next);

    if(isLogin.iss !== "worktogether.com"){
        res.status(200).json({
            "400": isLogin 
        })
    }else{
        connection.query(`UPDATE member SET email = "${req.body.email}", nickname = "${req.body.nickname}", skills = "${req.body.skills}" WHERE name ="${isLogin.name}"`, function (err,rows,fields) {
            if(err){
                if(err.sqlMessage === `Duplicate entry '${req.body.email}' for key 'email_UNIQUE'`){
                    res.status(200).json(
                        {
                            "400": "already exist email"
                        }
                    )
                    console.log(err);   
                } else if(err.sqlMessage === `Duplicate entry '${req.body.nickname}' for key 'nickname_UNIQUE'`){
                    res.status(200).json(
                        {
                            "400": "already exist nickname"
                        }
                    )
                } else {
                    res.status(200).json(
                        {
                            "400": "unknown error"
                        }
                    )
                    console.log(err);
                }
            } else {
                res.status(200).json(
                    {
                        "200" : "success"
                    }
                )
            }
        })
    }

})

router.get('/', async function(req,res,next){
    const isLogin = await token.verify(req,res,next);

    if(isLogin.iss !== "worktogether.com"){
        res.status(200).json({
            "400": isLogin 
        })
    }else{
        connection.query(`SELECT * FROM member WHERE name = "${isLogin.name}"`, function(err,rows,fields) {
            if(err){
                res.status(200).json({
                    "400": "unknown error"
                })
                console.log(err)
            } else{
                res.status(200).json(
                    {
                        "200": [
                        {
                            "member_id": rows[0].member_id,
                            "name": rows[0].name,
                            "nickname": rows[0].nickname,
                            "skills": rows[0].skills,
                            "email": rows[0].email
                        }
                    ]
                    }
                )
            }
        })
    }
})

module.exports = router;