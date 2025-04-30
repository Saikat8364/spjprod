const mysql=require("mysql");

var connection = mysql.createConnection({
    host: "localhost",
      // port:"3306",
    user: "root",
    password: "Saikat@8364",
    database: "spj",
  });
connection.connect(function(err){
    if(err) throw err;
    
});

module.exports = connection;