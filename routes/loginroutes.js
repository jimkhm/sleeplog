exports.register = function(req, res, mysqlConnection) {

  var today = new Date();
  var users = {
    "email": req.body.email,
    "password": req.body.password,
    "created_at": today,
    "updated_at": today
  }

  mysqlConnection.query('INSERT INTO users SET ?', users,
    function(error, results, fields) {
      if (error) {
        console.log("error ocurrd ", error);
        res.send({
          "code": 400,
          "failed": "error ocurred"
        })
      } else {
        console.log('The solution is: ', results);
        res.send({
          "code": 200,
          "success": "user registered sucessfully"
        });
      }
    });
}

exports.login = function(req, res) {
  var email = req.body.email;
  var password = req.body.password;

  connection.query('SELECT * FROM users WHERE email=?', [email],
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
        if(results[0].password == password) {
          res.send({
            "code": 200,
            "success": "login sucessfull"
          });
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
}
