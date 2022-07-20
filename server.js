const express = require('express');
const app = express();
const bodyParser = require('body-parser')
app.use(express.urlencoded({extended: true})) 

const MogoClient = require('mongodb').MongoClient;
app.set('view engine', 'ejs'); //ejs

var db;
MogoClient.connect('mongodb+srv://admin:qwer1234@cluster0.wnuppec.mongodb.net/?retryWrites=true&w=majority', function(error, client){
  if (error) return console.log(error);

  db = client.db('todoapp'); //connect with todoapp database 

  // db.collection('post').insertOne( {_id: 1,name: 'Dan', Age: '29'} , function(error, result){
  //   console.log('saved!')
  // })

  app.listen(8080, function(){
    console.log('listening on 8080')
  });

});

// when someone visits /pet, let's show guidelind about per

app.get('/pet', function(req, res){
  res.send('This is the page you can shop for your pet');
});

app.get('/beauty', function(req, res){
  res.send('This is the page you can shop for your beauty');
});

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/write', function(req, res){
  res.sendFile(__dirname + '/write.html');
});
 
app.post('/add', function(req, res){
  //inside of counter collection, there is name: 'postNumber object,
  //we can reach out to totalPost in order to increase the id number
  db.collection('counter').findOne({name : 'postNumber'}, function(error, result){
    console.log(result.totalPost)
     var totalPostNumber = result.totalPost;

     db.collection('post').insertOne( { _id: totalPostNumber + 1, task: req.body.title, date: req.body.date} , function(){
       console.log('saved!')
       //counter라는 콜렉션에 있는  totalPost라는 항목도 1 증가시켜야함
       //$set, inc... mongoDB operator
       db.collection('counter').updateOne({name : 'postNumber'}, { $inc : { totalPost : 1} } , function(error, result){
        if(error){return console.log(error)}
        res.send('done');
       });
     })     
  })
});

//list로 GET 요펑으로 접속하면 
//실제 DB에 저장된 데이터들로 얘쁘게 꾸며진 HTML을 보여줌
app.get('/list', function(req, res){

//DB에 저장된 post라는 collection 안의 모든 데이터를 꺼네주세요
db.collection('post').find().toArray(function(error, result){
  console.log(result);
  res.render('list.ejs', { posts : result});
})

});

app.delete('/delte', function(req, res){
  console.log(req.body);
});
