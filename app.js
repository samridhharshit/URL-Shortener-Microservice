var express= require('express');
var app= express();
var MongoClient=require('mongodb').MongoClient,
assert=require('assert');

//create a url variable 
var appUrl="localhost:3000/";

MongoClient.connect("mongodb://localhost:27017/shorturl",{ useNewUrlParser: true },function(err,database){
    
    //get request to "new" path and another path to long url
    app.get('/new/:longUrl(*)',function(req,res,next){//(*)=>this expression is used so tha we could put "/"in our long url as much as we want
        
        // path to long url
        var longUrl=req.params.longUrl;
        
        //create a id corresponding unique id for short url
        var uniqueId=new Date().getTime();
        uniqueId=uniqueId.toString();
        uniqueId=uniqueId.slice(0,-2)
        //create a short url variable 
        var shortUrl=appUrl+uniqueId;
        
        //put that object in a database
        const myAwesomeDB=database.db('shorturl');
        myAwesomeDB.collection('shorturl').insert({
            "longUrl":longUrl,
            "shortUrl":shortUrl,
            "uniqueId":uniqueId
        },  function(error,data){
                if(error){
                    console.log("there was an error in database");
                }//console.log(data.ops[0]);=>this could be used for getting the exact object removing the resul and ops section
                var l=data.ops[0].longUrl;
                var s=data.ops[0].shortUrl;
                var obj={"original_url":l,"short_url":s}
                res.send(obj);
            });
    
    
        //res.send(uniqueId+" "+longUrl+" "+shortUrl);
    });//end long url get request
        
    //get request for id
    app.get('/:uniqueId',(req,res)=>{
        
        //make variable for id
        var uniqueId=req.params.uniqueId;

        //find object in the database that corresponds with the id
        const myAwesomeDB=database.db('shorturl');
        myAwesomeDB.collection('shorturl').find({
            "uniqueId":uniqueId
        }).toArray(function(err,data){
            //handle error if id dosent match anything in the database
            if(err){console.log("there was an erroe finding this shortenedurl")}
            
            //if it does not match something in the database redirect to corresponding long url
            if(data.length ==0){return console.log("there is no url matching this one in the database")}
            var l=data[0].longUrl;
            if(l.indexOf("https")==-1){l="https://"+1}
            res.redirect(l);
        })//end coolection find to array
    });
});//end of database connection

app.listen(3000,function(req,res,next){
    console.log('app is listening');
});