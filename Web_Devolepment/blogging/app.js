//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const nodemailer = require("nodemailer");
const db = require('./db');
const mailsend = require('./mail');

const { isEmpty, take, flatMap } = require("lodash");
const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// variables
var otp6,insertfname,insertlname,inserttitel,insertmail,insertpostcont,insertpassword,insertabout;


app.get("/",function(req,res){

  db.getAllPersons() 
     .then((posts)=>{
        res.render('home',{
          para1: homeStartingContent,
          posts:posts})
     })
     .catch((err)=>{
         res.send(err)
     })
});


app.post("/posts/get",function(req,res){

  var  postTitel=encodeURIComponent('hello');
  console.log(req.body.searchTitel)
    let requrl = "/posts/get/"+ req.body.searchTitel;
     res.redirect(requrl);
  
});

app.get("/posts/get/:urlTitel",(req,res)=>{
 
  const requestedTitel=(req.params.urlTitel);
  console.log(requestedTitel)
  db.getAllPostsbyTitel(requestedTitel) 
     .then((posts)=>{
        res.render('searchPage',{
          para1: homeStartingContent,
          posts:posts,
          searchTitel:requestedTitel
        })
     })
     .catch((err)=>{
         res.send(err)
     })
 
})



app.get("/about",function(req,res){


   res.render("about",{
     para1: aboutContent ,
   });

});

app.get("/contact",function(req,res){


   res.render("contact",{
     para1: contactContent,
   });

});

app.get("/compose",function(req,res){

   res.render("compose");

});



app.post("/compose",function(req,res){

  insertfname=req.body.fName;
  insertlname= req.body.lName;
  insertmail=req.body.email;
  insertabout=req.body.aboutU;
  insertpostcont= req.body.postCont;
  insertpassword=req.body.passtext;
  inserttitel=req.body.postTitel;
 
  

  otp6=Math.floor(Math.random() * 1000000) + 100000;

    
  let mailBody =`<div style="background-color:teal;padding: 5%;font-family:Verdana, Geneva, Tahoma, sans-serif;">
  <h2 style="font-family:Arial, Helvetica, sans-serif; margin-bottom: 8vh;">✍🏽CodeWall</h2>
  <h1 style="font-size: 100px; text-align: center;">👇🏽</h1>
  <h4 style="color: wheat;">Hi `+ insertfname+`</h4>
  <p style="color: wheat;">Here is the your mail verification code for CodeWall:</p>
       <h1 style="text-align: center;color:palegreen;">`+otp6+`</h1>
  <p style="color: wheat;">All you have to do is copy the confirmation code and paste it to your form to complete verification process</p>
  <h2 style="text-align: right;color: white;">Thank you `+ insertfname+`...</h2>
  </div>`
   
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user:'ranadebnath619@gmail.com',
      pass: "Rana@1702"

    }
  });
  
  var mailOptions = {
    from: 'ranadebnath619@gmail.com',
    to: insertmail,
    subject: 'Mail Verification',
    html: mailBody
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
      console.log(" mail sending failed");
    } else {
      console.log('Email sent: ' + info.response);
      console.log("successful");
      res.render("composeOtpCheck",{
        userEmail: insertmail
       });
    }
  });

});

app.post("/compose/otpconfrom",function(req,res){
    

  const thankMail=`<div style="background-color:teal;padding: 5%;font-family:Verdana, Geneva, Tahoma, sans-serif;">
  <h2 style="font-family:Arial, Helvetica, sans-serif; margin-bottom: 8vh;color: white;">✍🏽CodeWall</h2>
  <h4 style="color: white;">Hi `+insertfname+`</h4>
  <p style="color: white;">Welcome to CodeWall ,we're happy for your contribution in our website. Go through our other posts and share your exprience in comment section & also incress our knowlage</p>
  <h3 style="text-align: center;font-size: 50px;">🙏🏼</h3>
  <h2 style="color: white;">Thank you `+insertfname+`...</h2>
  </div>`

     if(otp6==req.body.otp)
     {
       db.addNewPerson(insertfname,insertlname,insertabout,insertmail,insertpassword,inserttitel,insertpostcont)
       .then((post)=>{
        mailsend.sendMail(insertmail,thankMail )  
        res.redirect("/");
         })
        .catch((err)=>{
          res.send(err)
        })
        
     }
     else{
        console.log(req.body.otp)
        res.redirect("/compose")
     }

 
});







app.get('/posts/:urlTitel/rrt234:urlID', function (req, res) {
  const requestedTitel=(req.params.urlTitel);
  const requestedID=(req.params.urlID);
  console.log(requestedTitel)
  console.log(requestedID)
  db.findSinglePost(requestedTitel,requestedID)
  .then((post)=>{
   db. findPostComments(requestedID)
     .then((rows)=>{
       console.log(rows)
       res.render('fullPost',{
        post:post[0],
        rows:rows
    })
    })
   .catch((err)=>{
     res.send(err)
   })

  })

  .catch((err)=>{
      res.send(err)
  })

  




})

app.post('/posts/:urlTitel/post/:urlTitel/rrt234:urlID/Comment',(req,res)=>{
  let requestedTitel= _.lowerCase(req.params.urlTitel);
  let normalurlreq= req.params.urlTitel;
  let requestedID =(req.params.urlID);
  db.addNewComment(requestedID, req.body.mailID, req.body.Commentcont)
  .then((result)=>{
    console.log(result)
     res.redirect("/")
  })
  .catch((err)=>{
     console.log(err)
  })

})











app.get('/posts/:urlTitel/rrt234:urlID/delete', function (req, res){
  let requestedTitel= _.lowerCase(req.params.urlTitel); 
  let requestedID =(req.params.urlID);
  res.render("deleteCon",{
    postTitel:requestedTitel,
    postID:requestedID
  });

});  
app.get('/posts/:urlTitel/rrt234:urlID/editpostinfo', function (req, res){
  let requestedTitel= _.lowerCase(req.params.urlTitel); 
  let requestedID=(req.params.urlID);
  res.render("editPost",{
    postTitel:requestedTitel,
    postID:requestedID
  });

}); 
app.post('/posts/:urlTitel/rrt234:urlID/postinfo/edit', function (req, res){
  let requestedTitel= _.lowerCase(req.params.urlTitel); 
  let requestedID=(req.params.urlID);
 db.findSinglePostMF(requestedID,req.body.passtext)
 .then((rows)=>{
        if(rows.length){      
          res.render("finalEdit",{
            rows:rows[0]
         })

        }
        else{ 
          res.render("failEdit",{
            postTitel :requestedTitel,
            postID:requestedID

          }) 
        }
   })
.catch((err)=>{
   console.log(err)   
   
   })


}); 




app.post('/posts/edit/:urlTitel/rrt234:urlID/complete', function (req, res){
  let requestedTitel=(req.params.urlTitel); 
  let requestedID=(req.params.urlID);
 db.updateSinglePost(req.body.postCont,requestedID,requestedTitel)
 .then((getIt)=>{
      if(getIt==0){
      res.render("failEdit",{
        postTitel :requestedTitel,
        postID:requestedID

      }) 
    }
      else
         res.redirect("/")
})
.catch((err)=>{
      console.log(err) 
      
})

}); 


 





app.post('/delete/:urlTitel/rrt234:urlID/comform', function (req, res){
  let requestedTitel= _.lowerCase(req.params.urlTitel); 
  let requestedID=(req.params.urlID);
  let autemail;
  db.findSinglePost(requestedTitel,requestedID)
  .then((row)=>{
       autemail=row[0].Email;
 })
  const deletemail =`<div style="background-color:black;padding: 5%;font-family:Verdana, Geneva, Tahoma, sans-serif;">
  <h2 style="font-family:Arial, Helvetica, sans-serif; margin-bottom: 8vh;color: white;">✍🏽CodeWall</h2>
  <h4 style="color: white;">Hi</h4>
  <p style="color: white;">As per your request we remove your post <span style="color:aqua">`+requestedTitel+`</span> from our Wall...please share your knowledge with us again because it's very precious for us</p>
  <h3 style="text-align: center;font-size: 50px;">🙏🏼</h3>
  <h2 style="color: white;">Thank you...</h2>
  </div>`
  console.log(req.body.PostID)
  console.log(req.body.postPassword)
  db.deleteSinglePost(requestedID,req.body.postPassword)
  .then((getIt)=>{
       if(getIt==0)
          res.render("failDelete",{
            postTitel:requestedTitel,
            postID :requestedID
          });
       else
         db.deleteRelatedComments(requestedID)
         mailsend.sendMail(autemail,deletemail) 
          res.redirect("/");
    })
  .catch((err)=>{
    console.log(err)  
  
    })

});

 


app.listen(3000, function() {
  console.log("Server started on port 3000");
});



