const express = require('express');
const app = express();
const bodyParser = require('body-parser')
app.use(express.urlencoded({extended: true})); 

const MogoClient = require('mongodb').MongoClient;
app.set('view engine', 'ejs'); //ejs

app.use('/public', express.static('public'));

const methodOverride = require('method-override');
app.use(methodOverride('_method'));

require('dotenv').config();

var db;
MogoClient.connect(process.env.DB_URL, function(error, client){
  if (error) return console.log(error);

  db = client.db('todoapp'); //connect with todoapp database 

  // db.collection('post').insertOne( {_id: 1,name: 'Dan', Age: '29'} , function(error, result){
  //   console.log('saved!')
  // })

  app.listen(process.env.PORT, function(){
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
  res.render('index.ejs');
});

app.get('/write', function(req, res){
  res.render('write.ejs');
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

app.delete('/delete', function(req, res){
  console.log(req.body);
  req.body._id = parseInt(req.body._id);
  //요청 .body에 다겨온 계시문번호를 가진 글을 db에서 찾아서 삭제해주세요
  db.collection('post').deleteOne(req.body, function(error, result){
    console.log('deleted')
    res.status(200).send({ message : 'succeed'})
  })
});

app.get('/detail/:id', function(req, res){
  db.collection('post').findOne({_id : parseInt(req.params.id)}, function(error, result){
    console.log(result)
    res.render('detail.ejs', { data : result });
  })
})

app.get('/edit/:id', function(req, res){
  db.collection('post').findOne({_id : parseInt(req.params.id)}, function(error, result){
    console.log(result)
    res.render('edit.ejs', {post : result});    
  })
});

app.put('/edit', function(req, res){
  db.collection('post').updateOne({ _id : parseInt(req.body.id)}, { $set : { task: req.body.task, date: req.body.date }}, function(error, result){
      console.log('edited')
      res.redirect('/list')
  })
});

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

app.use(session({secret : 'secretCode', resave : true, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/login', function(req, res){
  res.render('login.ejs');
});

app.post('/login', passport.authenticate('local', {
  failureRedirect : '/fail'
}), function(req, res){
  res.redirect('/')
})

passport.use(new LocalStrategy({
  usernameField: 'id',
  passwordField: 'pw',
  session: true,
  passReqToCallback: false,
}, function (입력한아이디, 입력한비번, done) {
  //console.log(입력한아이디, 입력한비번);
  db.collection('login').findOne({ id: 입력한아이디 }, function (에러, 결과) {
    if (에러) return done(에러)

    if (!결과) return done(null, false, { message: '존재하지않는 아이디요' })
    if (입력한비번 == 결과.pw) {
      return done(null, 결과)
    } else {
      return done(null, false, { message: '비번틀렸어요' })
    }
  }) 
}));

passport.serializeUser(function(user, done){
  done(null, user.id)
});

passport.deserializeUser(function(아이디, done){
  
  done(null, {})
})

app.get('/mypage', login,function(req, res){
  res.render('mypage.ejs')
});

//this is middlewear for checking if user login or not
function login(req, res, next){
  if(req.user){
    next()
  } else {
    res.send('Login please!!')
  }
}

app.get('/search', (req, res)=>{
  console.log(req.query);
})