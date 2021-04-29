
const nodemailer = require("nodemailer");



function sendMail(mailId,mailBody)
{   
    console.log(mailId)
    return new Promise(function(resolve,reject){ 
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user:'ranadebnath619@gmail.com',
      pass: "Rana@1702"

    }
  });
  
  var mailOptions = {
    from: 'ranadebnath619@gmail.com',
    to:mailId ,
    subject: 'Mail Verification',
    html: mailBody
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
      console.log(" mail sending failed");
      reject(error)
    } else {
      console.log('Email sent: ' + info.response);
      console.log("successful");
      resolve(info)
    }
  });
     
    })
    
}




exports = module.exports={
   sendMail
} 


