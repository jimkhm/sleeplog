var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

var loginroutes = require('./routes/loginroutes');
var sha256 = require('sha256');

var jwt = require('jsonwebtoken');


var app = express();
app.locals.pretty = true;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// --->>> PRINT THE REQUEST LOG ON CONSOLE <<<---
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/controller',function(req, res, next) {
  var token = req.cookies.auth;

  // decode token
  if (token) {
    jwt.verify(token, 'secret', function(err, token_data) {
      if (err) {
         return res.status(403).send('Error');
      } else {
        req.user_data = token_data;
        console.log("jwt.verify: ", token_data);

        next();
      }
    });

  } else {
    return res.status(403).send('No token');
  }
});

app.use('/lastest_sleeptime',function(req, res, next) {
  var token = req.cookies.auth;
  console.log("lastest_sleeptime");
  // decode token
  if (token) {

    jwt.verify(token, 'secret', function(err, token_data) {
      if (err) {
         return res.status(403).send('Error');
      } else {
        req.user_data = token_data;
        console.log("jwt.verify: ", token_data);

        next();
      }
    });

  } else {
    return res.status(403).send('No token');
  }
});

// app.use('/controller_reciever',function(req, res, next) {
//   var token = req.cookies.auth;
//   console.log(token);
//   // decode token
//   if (token) {
//     jwt.verify(token, 'secret', function(err, token_data) {
//       if (err) {
//          return res.status(403).send('Error');
//       } else {
//         req.user_data = token_data;
//         console.log("jwt.verify: ", token_data);
//
//         next();
//       }
//     });
//
//   } else {
//     return res.status(403).send('No token');
//   }
// });

app.get('/form', function(req, res) {
  res.render('form');
});

app.get('/login_form', function(req, res) {
  res.render('login_form');
});

const pool = require('./modules/mysql');

//비밀번호 글자수 제한 및 문자 종류 제한 필요
app.post('/register',function(req, res) {

  function validateEmail(email) {
    var re = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z]{2}|com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|museum)\b/;
    return re.test(email);
  }

  const emailValidation = validateEmail(req.body.email);

  if(!emailValidation){
    res.status(400).send({
      message: "invalided email address"
    })
  }else{
    //mysqlConnection.connect();
    var today = new Date();

      var users = {
        "email": req.body.email,
        "password": sha256(req.body.password+today),
        "created_at": today,
        "updated_at": today
      }

      const query =pool.query('INSERT INTO user SET ?', users,
        function(error, results, fields) {
          if (error) {
            console.log("error ocurrd ", error);
            res.send({
              "code": 400,
              "failed": "error ocurred: " + error
            })
          } else {
            console.log('The solution is: ', results);
            res.render('register_success');
          }
        });
  }
});

app.post('/login', function(req, res) {

  var email = req.body.email;
  var password = req.body.password;
  const secret = req.app.get('jwt-secret');

  pool.query('SELECT * FROM user WHERE email=?', [email],
  function(error, results, fields) {
    if (error) {
      // console.log("error ocurred", error);
      res.status(500).send({
        message: "error ocurred: "+error
      })
    } else {
      // console.log('The solution is: ', result);
      if(results.length >0){
          console.log(results[0]);
          console.log(results[0].password);
          console.log(sha256(password+results[0].created_at));
          if(results[0].password === sha256(password+results[0].created_at) ) {

            var myToken = jwt.sign({ id: results[0].id, email: results[0].email },
                                      'secret',
                                     { expiresIn: 24 * 60 * 60 });

           //secret은 키 바꾸어주는 것이 좋음
           res.cookie('auth', myToken);
           res.redirect('/controller');//ToDo 좀 더 직관적인 이름으로
           //res.render('sleepLogController', {"token": myToken})//서버 사이드렌더링
           //cookie 4kb  서버에서 조작 가능, localStorage는 client 사이드에서 javascript로만 조작 가능
           //login 후 then redirect하는 방식으로 로컬스토리지 저장 가능

           //res.render('sleepLogController');

          } else {
            res.status(200).send({
              "success": false,
              "message": "Email and password does not match"
            });
          }
      } else {
        res.status(204).send({
          "success": true,
          "message": "Email does not exists"
        })
      }
    }
  })
});


app.get('/controller', function(req, res) {
  res.render('sleepLogController');
});

// var validation = function(req, res, next){
//                     console.log("controller_reciever");
//                     if (req.body.id !== undefined && req.body.id !== null) {
//                       next();
//                     } else {
//                       res.status(403).send({
//                         message : "forbidden"
//                       })
//                     }
//                   }


// var tokenValidation = function(req, res, next) {
//                     var token = req.cookie.auth;
//                     console.log("tokenValidation")
//                     console.log(token)
//                     console.log(req.cookie)
//                     console.log(req.body)
//                     // decode token
//                     if (token) {
//
//                       jwt.verify(token, 'secret', function(err, token_data) {
//                         if (err) {
//                            return res.status(403).send('Error');
//                         } else {
//                           req.user_data = token_data;
//                           console.log("jwt.verify: ", token_data);
//
//                           next();
//                         }
//                       });
//
//                     } else {
//                       console.log("notoken");
//                       return res.status(403).send('No token');
//                     }
//                   }

app.post('/controller_reciever', function(req, res) {
  console.log("controller_reciever");
  var date; //.toUTCString();
  date = new Date();
  date = date.getFullYear() + '-' +
          ('00' + (date.getMonth()+1)).slice(-2) + '-' +
          ('00' + date.getDate()).slice(-2) + ' ' +
          ('00' + date.getHours()).slice(-2) + ':' +
          ('00' + date.getMinutes()).slice(-2) + ':' +
          ('00' + date.getSeconds()).slice(-2);

  var token = req.body.auth;
  token = token.substring(5);
  console.log(token);
  //decode token
  if (token) {
    jwt.verify(token, 'secret', function(err, token_data) {
      if (err) {
        console.log("jwt.verify error");
        console.log(err);
         return res.status(403).send('Error');
      } else {
        token = token_data;
        console.log("jwt.verify: ", token_data);

        var sleepLog = {
          user_id : 50,
          start_time: date
        };
        console.log(token);

        //start button이 click되었고 button_flag가 true일 때
        if(req.body.is_start) {
          const checkQuery = pool.query('SELECT * FROM sleep_log WHERE ' +
          'user_id = ? AND end_time IS NULL AND start_time >= (NOW()-INTERVAL 18 HOUR) '+
          'ORDER BY id DESC LIMIT 1', [sleepLog.user_id],
          function(error, results, fields) {
            console.log("checkQuery", results);
            if(error) {
              console.log("error ocurred", error);
              res.status(500).send({
                message : "internal server error"
              });
            } else {
              console.log('The solution is: ', results);
              console.log('The solution is: ', results.length);
              if(results.length === 0){
                const query = pool.query('INSERT INTO sleep_log SET ?', sleepLog,
                  function(error, results, fields) {
                    if(error) {
                      console.log("error ocurred", error);
                      res.status(500).send({
                        message : "internal server error"
                      });
                    } else {
                      console.log('The solution is', results);
                      res.status(200).send({
                        success : true,
                        message : "starting log success",
                        button_flag: false//,
                        //logged_start_time: sleepLog.start_time//ToDo 삭제 예정
                      });
                    }
                  });
              } else {
                res.send('fail');
              }
            }
          });

        //end button이 눌러졌고 button_flag가 false일 때
        } else {
          console.log(req.body)
          //const query = pool.query('UPDATE sleep_log SET end_time = ? WHERE user_id = ? and start_time= ?', [date, sleepLog.user_id, req.body.logged_start_time],


          const query = pool.query('UPDATE sleep_log SET end_time = ? WHERE user_id = ? '+
          'AND end_time IS NULL AND start_time >= (NOW()- INTERVAL 18 HOUR)' +
          'ORDER BY id DESC LIMIT 1', [date, sleepLog.user_id],
            function(error, results, fields) {
              console.log('results:', results);
              console.log('fields:', fields);

              if(error) {
                console.log('The solution is', error);
                res.status(500).send({
                  message: "internal sever error"
                });
              } else {
                res.status(200).send({
                  success: true,
                  message: "ending log success",
                  button_flag: true
                });
              }
          });
        }
      }
     });
   }

});

app.get('/lastest_sleeptime', function(req, res){
  console.log(req.user_data.id);
  // var latestDay = pool.query('SELECT * FROM sleep_log WHERE start_time = (SELECT MAX(start_time) FROM sleep_log '+
  // 'WHERE end_time IS NOT NULL AND user_id = ?) AND user_id = ?',[req.user_data.id, req.user_data.id],

  var latestDay = pool.query('SELECT * FROM sleep_log '+
  'WHERE end_time IS NOT NULL AND user_id = ? ORDER BY start_time DESC LIMIT 1', [req.user_data.id],

  function(error, results, fields ) {
      console.log(results);
      let start_time = results[0].start_time;
      let end_time = results[0].end_time;

      console.log('###############');
      console.log(start_time);
      console.log(end_time);
      console.log('###############');

      //start_time = start_time.split(/[- : T]/);
      //end_time = end_time.split(/[- : T]/);
      //start_time = new Date(Date.UTC(start_time[0], start_time[1]-1, start_time[2], start_time[3], start_time[4]));
      //end_time = new Date(Date.UTC(end_time[0], end_time[1]-1, end_time[2], end_time[3], end_time[4]));
      let hours = end_time - start_time;
      console.log(hours);

      function msToTime(duration) {
        var milliseconds = parseInt((duration%1000)/100)
            , seconds = parseInt((duration/1000)%60)
            , minutes = parseInt((duration/(1000*60))%60)
            , hours = parseInt((duration/(1000*60*60))%24);

        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;

        return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
      }
      hours = msToTime(hours);
      console.log(hours);

      console.log(start_time);
      console.log(end_time);
      console.log(typeof start_time);
      console.log(typeof start_time);
      res.status(200).send({
        success: true,
        message: "success",
        hours: hours
      });
  });
})

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
