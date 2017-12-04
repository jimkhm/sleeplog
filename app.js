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
        res.send({
          "code": 204,
          "success": "Email does not exists"
        })
      }
    }
  })
});

app.get('/controller', function(req, res) {
  res.render('sleepLogController');
});

app.post('/controller_reciever', function(req, res) {

  var currentTime = new Date();
  console.log("controller_reciever");
  console.log(req.body);

  if(req.body.user_id !== "undefined"){//Id check

    if(req.body.end_sign === "end") {
       res.send("end!!");
    } else if(req.body.start.slice(-5) === "SLEEP"){
      var sleepLog = {
        user_id: req.body.user_id,
        start_time: currentTime
      }

      const query = pool.query('INSERT INTO sleep_log SET ?', sleepLog,
        function(error, results, fields) {
          if(error) {
            console.log("error ocurred", error);
            res.send({
              "code": 400,
              "failed": "error ocurred: " + error
            })
          } else {
            console.log('The solution is', results);
          }
        }
      )
    }
  } else {
    res.send("Please Login")
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
