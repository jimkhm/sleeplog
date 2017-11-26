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


//const mysqlConnection = require('./modules/mysql');
const mysqlConnection = require('mysql');

var pool  = mysqlConnection.createPool({
  connectionLimit : 10,
  host            : 'localhost',
  user            : 'root',
  password        : '1121ujung',
  database        : 'sleeplog'
});


app.post('/register',function(req, res) {

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
          // res.send({
          //   "code": 200,
          //   "success": "user registered sucessfully"
          // });
          //mysqlConnection.end();

          res.render('register_success');
        }
      });
});

app.post('/login', function(req, res) {

  var email = req.body.email;
  var password = req.body.password;

  //mysqlConnection.connect();

  pool.query('SELECT * FROM user WHERE email=?', [email],
  function(error, results, fields) {
    if (error) {
      // console.log("error ocurred", error);
      res.send({
        "code": 400,
        "failed": "error ocurred"
      })
    } else {
      // console.log('The solution is: ', result);
      if(results.length >0){
          console.log(results[0].password);
          console.log(results[0].created_at);
          console.log(sha256(password+results[0].created_at));

          if(results[0].password == sha256(password+results[0].created_at) ) {
            // res.send({
            //   "code": 200,
            //   "success": "login sucessfull"
            // });
            res.render('login_success');
          } else {
            res.send({
              "code": 204,
              "success": "Email and password does not match"
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
  //mysqlConnection.end();
});



//const time = new Date();

//const userInfo = {email: "test5@test.com", password: "1234", created_at: time, updated_at: time };

// const query = mysqlConnection.query('INSERT INTO USER SET ?',userInfo , function (error, results, fields) {
//   if (error) throw error;
//   console.log('The insert is: ', results);
// });
//
// console.log(query.sql);

//loginroutes.register(req, res, mysqlConnection);

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
