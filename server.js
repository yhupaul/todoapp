const express = require('express');
const app = express();

app.listen(8080, function(){
  console.log('listening on 8080')
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
