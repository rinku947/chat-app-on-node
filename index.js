var express = require('express');
var app=express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var session=require('express-session');
var MongoStore = require('connect-mongo')(session);
var ObjectId = require('mongodb').ObjectID;

var mongoose = require("mongoose");
var bodyParser = require('body-parser');
app.use(function(req, res, next) {
res.header("Access-Control-Allow-Origin", "*");
res.header('Access-Control-Allow-Methods', 'DELETE, PUT, GET, POST');
res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
next();
});
app.use(bodyParser.json());
//app.use(bodyParser.validator());
app.use(bodyParser.urlencoded({ extended: false }));
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/namechat").then(function(dbcon){
  console.log("DB connected to cloud");
}).catch(function(err){
  console.log("Error While connecting to Cloud DB");
})
 var db = mongoose.connection;
    // console.log(db);
var nameSchema   = new mongoose.Schema({
  
  
  name1        :String,
  email       : {type: String, unique: true},
  password      : String,
  conf_password     : String,
  
});

var user_info = mongoose.model("user_info", nameSchema);
app.use(session({
  secret: 'djddhdhdhd',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db
  })
}));


app.get('/', function(req, res) {
   res.sendFile(__dirname+'/login.html',{"Content-Type": "text/html"});
});


app.post('/', function(req, res) {
   var email= req.body.email;
   var password= req.body.password;
   console.log(email);
   console.log(password);
user_info.findOne({ email: email }).then(function(db1){
  //console.log(db);
if(db1.password==password){
        //req.session.Id=db1._id;

        res.redirect('/chat');
                req.session.Id=db1._id;

        console.log(db1.name1 + " has connected");


      }else{
        res.sendFile(__dirname+'/login.html',{"Content-Type": "text/html"});
      }

}).catch(function(err){
res.redirect('/register');
console.log(err);
});
});
app.get('/register', function(req, res) {
   res.sendFile(__dirname+'/register.html',{"Content-Type": "text/html"});
});

app.post('/register', function(req, res) {
   var name1= req.body.name1;
     var email= req.body.email;
       var password= req.body.password;
   var conf_password= req.body.conf_password;

console.log(name1);
console.log(email);
console.log(password);
console.log(conf_password);

   var data= new user_info({
        name1: name1,
        email:email,
        password:password,
        conf_password:conf_password,


   });
   data.save().then(function(db){
console.log(db);
  res.redirect('/chat');
                req.session.Id=db._id;

        console.log(db.name1 + " has connected");

   }).catch(function(err){
    res.sendFile(__dirname+'register.html');
    console.log(err);

   });



});

app.get('/chat', function(req, res) {
   res.sendFile(__dirname+'/index.html',{"Content-Type": "text/html"});
});


users = [];
io.on('connection', function(socket) {
  // console.log('A user connected');
   socket.on('setUsername', function(data) {
      console.log(data);
      
      if(users.indexOf(data) > -1) {
         socket.emit('userExists', data + ' username is taken! Try some other username.');
      } else {
         users.push(data);
         socket.emit('userSet', {username: data});
         console.log(data + " Is connected");
      }
   });
   
   socket.on('msg', function(data) {
      //Send message to everyone
     
      io.sockets.emit('newmsg', data);
   })
});
  /*var port = process.env.port || 3000;*/

/*http.listen(port)
   console.log('listening on localhost:3000');*/
   http.listen((process.env.PORT || 3000), function(){
  console.log('listening on :3000');
});
