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

var app = express();
app.locals.pretty = true;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/form', function(req, res) {
  res.render('form');
});

app.get('/login_form', function(req, res) {
  res.render('login_form');
});


const pool = require('./modules/mysql');

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

          if(results[0].password === sha256(password+results[0].created_at) ) {
            res.render('login_success');
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

var validation = function(req, res, next){
                    console.log("controller_reciever");
                    if (req.body.id !== undefined && req.body.id !== null) {
                      next();
                    } else {
                      res.status(403).send({
                        message : "forbidden"
                      })
                    }
                  }

app.post('/controller_reciever', validation, function(req, res) {

  var date;
  date = new Date();
  date = date.getFullYear() + '-' +
          ('00' + (date.getMonth()+1)).slice(-2) + '-' +
          ('00' + date.getDate()).slice(-2) + ' ' +
          ('00' + date.getHours()).slice(-2) + ':' +
          ('00' + date.getMinutes()).slice(-2) + ':' +
          ('00' + date.getSeconds()).slice(-2);
  console.log(date);

      var sleepLog = {
        user_id : req.body.id,
        start_time: date
      };

      //start button이 click되었고 button_flag가 true일 때
      if(req.body.is_start && req.body.button_flag) {
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
                button_flag: false,
                logged_start_time: sleepLog.start_time
              });
            }
          });
        //end button이 눌러졌고 button_flag가 false일 때
      } else if(req.body.is_end && !req.body.button_flag) {
        console.log(req.body)
        const query = pool.query('UPDATE sleep_log SET end_time = ? WHERE user_id = ? and start_time= ?', [new Date, req.body.id, req.body.logged_start_time],
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
      } else {
        res.send({
          message: "Button has already been activated!",
          button_flag: req.body.button_flag
        });
      }
});

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
