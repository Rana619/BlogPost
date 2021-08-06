require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const mailGo = require('./mail');
const CryptoJS = require("crypto-js");
const { request } = require("express");
const multer = require('multer');
var fs = require('fs');
var path = require('path');
const { cachedDataVersionTag } = require("v8");
const { connected } = require("process");
const { match } = require("assert");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();

//middlewares 
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const dbConnect = "mongodb+srv://Rana619:" + process.env.DBPASS + "@cluster0.shack.mongodb.net/bankingDB?retryWrites=true&w=majority";
const connectDB = async ()=>{
     try{
       await mongoose.connect(dbConnect , {
        useNewUrlParser: true,
        useCreateIndex : true,
        useUnifiedTopology: true,
        useFindAndModify: false
       });
       console.log("mongoDB connected");
     } catch (err){ 
        console.log(err);
     }
};
connectDB();

const transactionSchema = new mongoose.Schema({
  transactionTypeMoney: { type: String },
  transactionAmount: { type: Number },
  totalAmount: { type: Number },
  transactionTime: { type: String },
  transactionBranch: { type: String },
  transactiontype: { type: String },
  dayNumber: { type: Number },
  BankerId: { type: String }
});
const Transaction = mongoose.model("Transaction", transactionSchema);
const fixedDipositSchema = new mongoose.Schema({
  primeAmount: { type: Number },
  finalAmount: { type: Number },
  startingDate: { type: String },
  maturitiyDate: { type: String },
  BankerId: { type: String }
})
const FixedDeposit = mongoose.model("FixedDiposit", fixedDipositSchema);
const fixedDipositCSSchema = new mongoose.Schema({
  primeAmount: { type: Number },
  TotalAmount: { type: Number },
  duration: { type: Number },
  Datego: { type: String },
  accountNo: { type: String },
})
const FixedCSDeposit = mongoose.model("FixedCSDiposit", fixedDipositCSSchema);
const loanAplicationSchema = new mongoose.Schema({
  monthlyIncome: { type: Number },
  loanAmount: { type: Number },
  creditScore: { type: Number },
  sanctionAmountLoan: { type: Number },
  loanPeriod: { type: Number },
  EmiStatrtLastDate: { type: String },
  loanType: { type: String },
  loanNominee: { type: String },
  loanIntarest: { type: Number },
  loanIntarestRate: { type: Number },
  totalAmountFromLoan: { type: Number },
  totalAmountWithdrawal: { type: Number },
  dateToCalculateIntarest: { type: String },
  dateLoanTake: { type: String },
  BankerId: { type: String }
})
const LoanAplication = mongoose.model("LoanAplication", loanAplicationSchema);
const loanAplicationCSSchema = new mongoose.Schema({
  AccountNo: { type: String },
  monthlyIncome: { type: Number },
  loanAmount: { type: Number },
  creditScore: { type: Number },
  FamilyIncome: { type: Number },
  loanPeriod: { type: Number },
  loanType: { type: String },
  loanNominee: { type: String },
  dateOfApplication: { type: String },
  Purpose: { type: String }
})
const LoanAplicationCS = mongoose.model("LoanAplicationCS", loanAplicationCSSchema);
const loanEMISchema = new mongoose.Schema({
  branchName: { type: String },
  loanAccountNumber: { type: String },
  loanPlanCode: { type: String },
  loanPaymentMode: { type: String },
  noInstallments: { type: Number },
  totalPayable: { type: Number },
  loanEmiAmount: { type: Number },
  emiStartDate: { type: String },
  isEmiruning: { type: String },
  BankerId: { type: String },
  dateIntarestCalculate: { type: String },
  loanAdvisorName: { type: String }
})
const LoanEmi = mongoose.model("LoanEmi", loanEMISchema);
const loanEMICSSchema = new mongoose.Schema({
  branchName: { type: String },
  loanAccountNumber: { type: String },
  loanPlanCode: { type: String },
  loanPaymentMode: { type: String },
  noInstallments: { type: Number },
  loanEmiAmount: { type: Number },
  applyDate: { type: String },
  loanAdvisorName: { type: String },
  Narration: { type: String }
})
const LoanEmiCS = mongoose.model("LoanEmiCS", loanEMICSSchema);
const customerSchema = new mongoose.Schema({
  //initial member creation form
  userfName: { type: String },
  usermName: { type: String },
  userlName: { type: String },
  ffName: { type: String },
  fmName: { type: String },
  flName: { type: String },
  currentTotalAmount: { type: Number },
  AccountNo: { type: String },
  IFCcode: { type: String },
  gender: { type: String },
  marriageStatus: { type: String },
  address: { type: String },
  phone: { type: String },
  pin: { type: String },
  panNo: { type: String },
  voter: { type: String },
  adhar: { type: String },
  email: { type: String },
  dob: { type: String },
  occupation: { type: String },
  accountType: { type: String },
  nominiName: { type: String },
  nominiRelationship: { type: String },
  isAnyFixedDiposit: { type: String },
  isAnyEMIrunning: { type: String },
  isCustomerOnline: { type: String },
  istransfromOpen: { type: String },
  transferPIN: { type: String },
  BankerId: { type: String },
  passportSizePhoto:
  {
    data: Buffer,
    contentType: String
  },
  SignatureImg:
  {
    data: Buffer,
    contentType: String
  },
  fixedDipositEntery: [fixedDipositSchema],
  transactionEnterys: [transactionSchema],
  loanAplicationEntery: [loanAplicationSchema],
  loanEMIEntery: [loanEMISchema]
});
const Customer = mongoose.model("Customer", customerSchema);

const adminSchema = new mongoose.Schema({
  username: { type: String },
  password: { type: String },
  userType: { type: String }
});
const Admin = new mongoose.model("Admin", adminSchema);

var storage = multer.memoryStorage()
var upload = multer({ storage: storage });
var uploadMultiple = upload.fields([{ name: 'passportSizePhoto', maxCount: 1 }, { name: 'Signature', maxCount: 1 }]);

//-------------------------------------------functions-------------------------------------

function getDate() {
  let current = new Date();
  let cDate = (current.getMonth() + 1) + '/' + current.getDate() + '/' + current.getFullYear();
  let cTime = current.getHours() + ":" + current.getMinutes();
  let dateTime = cDate + '  ' + cTime;
  return dateTime;
}

function getOnlyDate() {
  let current = new Date();
  let cDate = (current.getMonth() + 1) + '/' + current.getDate() + '/' + current.getFullYear();
  return cDate;
}

function getDateAfter(duration) {
  let current = new Date();
  let month, year;
  month = current.getMonth() + 1 + duration;
  year = current.getFullYear();
  if (month > 12) {
    year = year + Math.floor(month / 12);
    month = month % 12;
  }
  let cDate = month + '/' + current.getDate() + '/' + year;
  return cDate;
}

function DaysBitweentwoDays(d1, d2) {
  var date1, date2;
  date1 = new Date(d1);
  date2 = new Date(d2);
  var time_difference = date2.getTime() - date1.getTime();
  var days_difference = time_difference / (1000 * 60 * 60 * 24);
  return (days_difference)
}

function dayNumber(d) {
  date1 = new Date("1/1/1970");
  date2 = new Date(d);
  var time_difference = date2.getTime() - date1.getTime();
  var days_difference = time_difference / (1000 * 60 * 60 * 24);
  return (days_difference);
}

function IntarestWithPeriod(p, r, t) {
  let RbyN = (r / 12) + 1;
  let TintoN = t * 12;
  let powerget = (RbyN ** TintoN)
  let TotalAmountWithIntarest = Math.floor(p * powerget);
  return TotalAmountWithIntarest;
}

//Daily Update
function FixedDipositUpdate() {
const authenticate = async ()=>{
  await Customer.find({ isAnyFixedDiposit: "Yes" }, (err, docs) => {
    if (!err) {
      docs.forEach((doc) => {
        let accountNo = doc.AccountNo;
        let crAmount = doc.currentTotalAmount;
        doc.fixedDipositEntery.forEach((fixded) => {
          if (fixded.maturitiyDate === getOnlyDate()) {
            let FixID = fixded._id;
            currentTotalAmount = parseInt(crAmount) + parseInt(fixded.finalAmount);
           const authenticate = async()=>{ 
            await Customer.updateOne({ AccountNo: accountNo }, { currentTotalAmount: currentTotalAmount }, (err) => {
              if (!err) {
                let day = getOnlyDate();
                let dayNumberk = dayNumber(day);
                const Deposit = new Transaction({
                  transactionTypeMoney: "Unlock The Fixed Amount",
                  transactionAmount: parseInt(fixded.finalAmount),
                  totalAmount: currentTotalAmount,
                  transactionTime: getDate(),
                  transactionBranch: "Nasaratpur",
                  transactiontype: "Deposit",
                  dayNumber: dayNumberk,
                  BankerId: fixded.BankerId
                });
               const authenticate = async()=>{
                await Customer.findOne({ AccountNo: accountNo }, (err, foundCustomer) => {
                  if (!err) {
                    foundCustomer.transactionEnterys.push(Deposit);
                    foundCustomer.save((err) => {
                      if (err) {
                        console.log(err);
                      } else {
                      const authenticate = async()=>{ 
                        await Customer.findOneAndUpdate({ AccountNo: accountNo },
                          { $pull: { fixedDipositEntery: { _id: FixID } } }, (err, getk) => {
                            if (!err) {
                              if (!foundCustomer.fixedDipositEntery[0]) {
                               const authenticate = async()=>{ 
                                await Customer.updateOne({ AccountNo: accountNo }, { isAnyFixedDiposit: "no" }, (err) => {
                                  if (!err) {
                                    console.log("No Fixeddiposit exsist");
                                  }
                                })
                              };
                              authenticate();
                              }
                              let mailBody = "diposit from fixeddiposit";
                              let mailSubject = "Fixeddiposit BRB Bank";
                              mailGo.sendMail(foundCustomer.email, fixded.finalAmount, mailBody, currentTotalAmount, mailSubject)
                              .then((posts)=>{
                                console.log("sucess");
                                 })
                              .catch((err)=>{
                                console.log(err);
                              })  
                            }
                          });
                        };
                        authenticate();
                        console.log("sucess");
                      }
                    });
                  } else {
                    console.log(err)
                  }
                });
              };
              authenticate();
              }
            });
          };
          authenticate();
          }
        })
      })
    }
  });
};
authenticate();
}

function EMIPaymentUpdate() {
 const authenticate = async()=>{
  await Customer.find({ isAnyEMIrunning: "yes" }, (err, docs) => {
    if (!err) {
      docs.forEach((doc) => {
        let accountNo = doc.AccountNo;
        let crAmount = doc.currentTotalAmount;
        let loanEMI = doc.loanEMIEntery[0];
        if (loanEMI.dateIntarestCalculate === getOnlyDate()) {
          let emiId = loanEMI._id;
          currentTotalAmount = parseInt(crAmount) - parseInt(loanEMI.loanEmiAmount);
         const authenticate = async()=>{
          await Customer.updateOne({ AccountNo: accountNo }, { currentTotalAmount: currentTotalAmount }, (err) => {
            if (!err) {
              let day = getOnlyDate();
              let dayNumberk = dayNumber(day);

              const withdrawal = new Transaction({
                transactionTypeMoney: "EMI",
                transactionAmount: parseInt(loanEMI.loanEmiAmount),
                totalAmount: currentTotalAmount,
                transactionTime: getDate(),
                transactionBranch: loanEMI.branchName,
                transactiontype: "Withdrawal",
                dayNumber: dayNumberk,
                BankerId: loanEMI.BankerId
              });
             const authenticate = async()=>{
              await Customer.findOne({ AccountNo: accountNo }, (err, foundCustomer) => {
                if (!err) {
                  foundCustomer.transactionEnterys.push(withdrawal);
                  foundCustomer.save((err) => {
                    if (err) {
                      console.log(err);
                    } else {
                      let totalPayable = parseInt(loanEMI.totalPayable) - parseInt(loanEMI.loanEmiAmount)
                      let dateIntarestCalculate = getDateAfter(1);
                      let noInstallments = parseInt(loanEMI.noInstallments) - 1;
                      const authenticate = async()=>{
                      await Customer.findOneAndUpdate(
                        { "AccountNo": accountNo, "loanEMIEnterys._id": emiId },
                        {
                          "$set": {
                            "loanEMIEnterys.$.totalPayable": totalPayable,
                            "loanEMIEnterys.$.dateIntarestCalculate": dateIntarestCalculate,
                            "loanEMIEnterys.$.noInstallments": noInstallments,
                          }
                        },
                        function (err, doc) {
                          if (err) {
                            console.log(err);
                          } else {
                            if (noInstallments === 0) {
                             const authenticate = async()=>{ 
                              await Customer.findOneAndUpdate({ AccountNo: accountNo },
                                { $pull: { loanEMIEntery: { _id: emiId } } }, (err, getk) => {
                                  if (!err) {
                                    let mailBody = "withdrwan for EMI";
                                    let mailSubject = "EMI withdrwan BRB Bank";
                                    mailGo.sendMail(foundCustomer.email, parseInt(loanEMI.loanEmiAmount), mailBody, currentTotalAmount, mailSubject)
                                    .then((posts)=>{
                                      console.log("sucess");
                                       })
                                    .catch((err)=>{
                                      console.log(err);
                                    })  
                                  }
                                });
                              };
                              authenticate();
                            }
                          }
                        });
                      };
                      authenticate();
                    }
                  });
                } else {
                  console.log(err)
                }
              });
            };
            authenticate();
            }
          });
        };
        authenticate();
        }
      })
    }
  });
};
authenticate();
}

// defore deploy store user And password in online database using this below code
// if you want athintication you have to save data using this line of code
// very impotent for Athintication

// bcrypt.hash( "Banker@pass" , saltRounds , (err,hash)=>{

//   const newUser = new Admin({
//     username: "Banker@123",
//     password: hash,
//     userType: "banker"
//   }); 
//   newUser.save((err)=>{
//     if(err){
//       console.log("fail");
//     } else {
//       console.log("sucess"); 
//     }
//   })
// });

var encriptionSecrateKey = process.env.KEY + getDate();

// Encrypt
function encryptText(text) {
  var ciphertext = CryptoJS.AES.encrypt(text, encriptionSecrateKey);
  var sendCipherText = ciphertext.toString().replace(/\+/g, 'p1L2u3S').replace(/\//g, 's1L2a3S4h').replace(/=/g, 'e1Q2u3A4l');
  return sendCipherText;
}

// Decrypt
function decryptText(encryptedcode) {
  encryptedcode = encryptedcode.toString().replace(/p1L2u3S/g, '+').replace(/s1L2a3S4h/g, '/').replace(/e1Q2u3A4l/g, '=');
  var bytes = CryptoJS.AES.decrypt(encryptedcode, encriptionSecrateKey);
  var originalText = bytes.toString(CryptoJS.enc.Utf8);
  return originalText;
}


//-------------------------------------------------------------------------routing------------------------------------------------------------------------

//home route
app.get("/", (req, res) => {
  res.render("home");
});
//----------------------------------------------------------contact mail-----------------------------------------------------
app.post("/contact", (req, res) => {
  mailGo.contactUs(req.body.mailID, req.body.phNo, req.body.mainMsg, req.body.name)
  .then((posts)=>{
    console.log("sucess");
     })
  .catch((err)=>{
    console.log(err);
  })  
  res.redirect("/");
});

//----------------------------------------------------login--------------------------------------------------------
app.get("/login", (req, res) => {
  res.render("loginOld" , {
     match : " ",
     userType : " "
  });
});

app.get("/logout", (req, res) => {
  res.redirect("/");
});

app.post("/login", (req, res) => {
  if (req.body.banker === 'banker') {
   const authenticate = async()=>{
    await Admin.findOne({ username: req.body.username, userType: "banker" }, (err, user) => {
    if(!err){
      if (user) {
        password = req.body.password;
        bcrypt.compare( password , user.password , (err,result)=>{
          if(err){
            let goUrl = "/login/tryaagain/banker";
            res.redirect(goUrl); 
          } else {
            if(result == true){
              const userID = encryptText(req.body.username)
              const requestedUrl = "/tab/banker/" + userID;
              res.redirect(requestedUrl);
            } else {
              // wrong password
                let goUrl = "/login/tryaagain/banker";
                res.redirect(goUrl); 
            }
          }
        });
      } else {
        let goUrl = "/login/tryaagain/banker";
        res.redirect(goUrl); 
      }
    } else {
      let goUrl = "/login/tryaagain/banker";
      res.redirect(goUrl); 
    }
    });
  };
  authenticate();
  }
  else if (req.body.customer === 'customer') {
   const authenticate = async()=>{
    await Admin.findOne({ username: req.body.username, userType: "customer" }, (err, user) => {
      if(!err){
        if (user) {
          password = req.body.password;
          bcrypt.compare( password , user.password , (err,result)=>{
            if(err){
              let goUrl = "/login/tryaagain/customer";
              res.redirect(goUrl); 
            } else {
              if(result == true){
                const userID = encryptText(req.body.username);
                const requestedUrl = "/tab/customer/" + userID + "/home";
                res.redirect(requestedUrl);
              } else {
                // wrong password
                let goUrl = "/login/tryaagain/customer";
                res.redirect(goUrl); 
              }
            }
          });
        } else {
          let goUrl = "/login/tryaagain/customer";
          res.redirect(goUrl); 
        }
      } else {
        let goUrl = "/login/tryaagain/customer";
        res.redirect(goUrl); 
      }
      });
   };
   authenticate();
  }
});

app.get("/login/tryaagain/:userType" , (req,res)=>{
  let user = req.params.userType;
  res.render("loginOld" , {
    match : "yes",
    userType : user
  });
});

//----------------------------------------------------------------customer singup--------------------------------------------------
app.get("/customersingup", (req, res) => {
  res.render("customerSingUp", {
    otpMatch: " ",
    signUp: "yes",
    updatepass: " "
  });
});

app.post("/OtpSend", (req, res) => {
  let otp = Math.floor(100000 + Math.random() * 900000);
  let AccountNo = req.body.username;
 const authenticate = async()=>{
  await Customer.findOne({ AccountNo: AccountNo }, (err, user) => {
    if (user) {
      if (user.isCustomerOnline === "no") {
        mailGo.sendMailOtp(user.email, otp)
        .then((posts)=>{
          console.log("sucess");
           })
        .catch((err)=>{
          console.log(err);
        })  
        let passWord = req.body.password;
        res.render("otpCheckForSignUp", {
          AccountNo: AccountNo,
          passWord: passWord,
          OTP: otp,
          userExist: "yes",
          passwordUpdate: " ",
          signUp: "yes"
        });
      } else {
        res.redirect("/login");
      }
    } else {
      res.render("otpCheckForSignUp", {
        AccountNo: AccountNo,
        userExist: "no",
        passwordUpdate: " ",
        signUp: "yes"
      });
    }
  });
};
authenticate();
});

app.post("/checkingOTP", (req, res) => {
  if (req.body.userOtp == req.body.serverOTP) {
    let accountNo = req.body.AccountNo;
    let passw = req.body.passWord;
    bcrypt.hash( passw , saltRounds , (err,hash)=>{
      if(err)
      {
        console.log(err);
        res.redirect("/login");
      } else {
        const newUser = new Admin({
          username: accountNo ,
          password: hash,
          userType: "customer"
        });
      const authenticate = async()=>{
        await newUser.save((err)=>{
          if(err){
            console.log(err);
            res.redirect("/login");
          } else {
            console.log("sucess"); 
           const authenticate = async()=>{
            await Customer.updateOne({ AccountNo: accountNo }, { isCustomerOnline: "yes" }, (err) => {
              if (err) {
                res.redirect("/login");
              } else {
                res.render("sucessRegisted", {
                  passwordUpdate: " ",
                  signUp: "yes"
                });
              }
            });
          };
          authenticate();
          }
        });
      };
      authenticate();
      }
    });
  } else {
    res.render("customerSingUp", {
      otpMatch: "no",
      signUp: "yes",
      updatepass: " "
    });
  }
});

//------------------------------------------------------Banker Home-----------------------------------------------
//Tab route
app.get("/tab/banker/:urlUser", (req, res) => {
  const encriptedBankerId = req.params.urlUser;
    res.render("Tab", {
      user: encriptedBankerId
    });
});

//---------------------------------------------------------------------Banker-------------------------------------------------------------------

//----------------------------------------New Member register-----------------------------------------
app.get("/tab/banker/:urlUser/member", (req, res) => {
  const encriptedBankerId = req.params.urlUser;
    res.render("register", {
      user: encriptedBankerId,
      overviewhm: "uperr",
      overviewcr: "overview",
      overviewd: " ",
      overvieww: " ",
      overviewle: " ",
      overviewee: " ",
      overviewfd: " ",
      overviewra: " ",
      overviewfda: " ",
      overviewla: " ",
      overviewea: " ",
      overviewcd: " ",
      overviewtd: " ",
      overviewld: " ",
      overviewed: " ",
      bghm: " ",
      bgcr: "bg",
      bgd: " ",
      bgw: " ",
      bgle: " ",
      bgee: " ",
      bgfd: " ",
      bgra: " ",
      bgfda: " ",
      bgla: " ",
      bgea: " ",
      bgcd: " ",
      bgtd: " ",
      bgld: " ", 
      bged: " "
    });
});

app.post("/memberRegister/:urlUser", uploadMultiple, function (req, res, next) {
  const encriptedBankerId = req.params.urlUser;
  const decriptedBankerId = decryptText(req.params.urlUser);
  let InitialAccountNo = 9050114588;
  var AccountNumber;
  const authenticate = async()=>{
  await Customer.countDocuments().then((count_documents) => {
    let newAccountNumber = InitialAccountNo + count_documents + 1;
    AccountNumber = "000" + newAccountNumber.toString();
    let currentAmount = 0;
    const newCustomer = {
      userfName: req.body.fName,
      usermName: req.body.mName,
      userlName: req.body.lName,
      ffName: req.body.ffName,
      fmName: req.body.fmName,
      flName: req.body.flName,
      AccountNo: AccountNumber,
      currentTotalAmount: currentAmount,
      IFCcode: "RCBK0000078",
      gender: req.body.gender,
      marriageStatus: req.body.marriageStatus,
      address: req.body.address,
      phone: req.body.phone,
      pin: req.body.pin,
      panNo: req.body.panNo,
      voter: req.body.voter,
      adhar: req.body.adhar,
      email: req.body.email,
      dob: req.body.dob,
      occupation: req.body.occupation,
      accountType: req.body.accountType,
      nominiName: req.body.nominiName,
      nominiRelationship: req.body.nominiRelation,
      isAnyFixedDiposit: "no",
      isAnyEMIrunning: "no",
      isCustomerOnline: "no",
      istransfromOpen: "no",
      transferPIN: " ",
      BankerId: decriptedBankerId,
      passportSizePhoto:
      {
        data: req.files.passportSizePhoto[0].buffer,
        contentType: 'passportSizePhoto/png'
      },
      SignatureImg:
      {
        data: req.files.Signature[0].buffer,
        contentType: 'Signature/png'
      },
    }
  const authenticate = async()=>{  
    await Customer.create(newCustomer, (err, item) => {
      if (err) {
        const requestedUrl = "/memberRegister/fail/" + encriptedBankerId;
        res.redirect(requestedUrl);
      }
      else {
        let encriptedAccountNo = encryptText(item.AccountNo)
        const requestedUrl = "/memberRegister/sucess/" + encriptedBankerId + "/" + encriptedAccountNo;
        res.redirect(requestedUrl);
      }
    });
  };
  authenticate();
  }).catch((err) => {
    console.log(err.Message);
  })
};
authenticate();
});

//sucess
app.get("/memberRegister/sucess/:urlBanker/:saveAccNo", (req, res) => {
  const requestedAccountNo = decryptText(req.params.saveAccNo);
  const requestedBanker = req.params.urlBanker;
    res.render("sucess", {
      AcNo: requestedAccountNo,
      requestedTitel: requestedBanker
    });
});
//fail
app.get("/memberRegister/fail/:urlBanker", (req, res) => {
  const requestedBanker = req.params.urlBanker;
  const goUrl = "/tab/banker/" + requestedBanker + "/member"
    res.render("failure", {
      backUrl: goUrl
    });
});
//-------------------------------------------search customer----------------------------------------------
app.post("/search/:BankerId", (req, res) => {
  const BankerId = req.params.BankerId;
  let UrlCr = "/" + req.body.SearchBtn + "/" + encryptText(req.body.uniqueAccountNo) + "/" + BankerId;
  res.redirect(UrlCr);
});
//-------------------------------------------deposit-----------------------------------------------
app.get("/tab/banker/:urlUser/deposit", (req, res) => {
  const BankerId = req.params.urlUser;
    res.render("deposit", {
      depositBtn: " ",
      customer: " ",
      user: BankerId,
      overviewhm: " ",
      overviewcr: " ",
      overviewd: "overview",
      overvieww: "lowerr",
      overviewle: " ",
      overviewee: " ",
      overviewfd: " ",
      overviewra: " ",
      overviewfda: " ",
      overviewla: " ",
      overviewea: " ",
      overviewcd: " ",
      overviewtd: " ",
      overviewld: " ",
      overviewed: " ",
      bghm: " ",
      bgcr: " ",
      bgd: "bg",
      bgw: " ",
      bgle: " ",
      bgee: " ",
      bgfd: " ",
      bgra: " ",
      bgfda: " ",
      bgla: " ",
      bgea: " ",
      bgcd: " ",
      bgtd: " ",
      bgld: " ",
      bged: " "
    });
});

//Search Response
app.get("/deposit/:urlAccountNo/:BankerId", (req, res) => {
  const deRequestedAccountNo = decryptText(req.params.urlAccountNo);
  const enBankerId = req.params.BankerId;
  const authenticate = async()=>{
    await Customer.findOne({ AccountNo: deRequestedAccountNo }, (err, user) => {
      if (err) {
        res.redirect("/login");
      } else {
        res.render("deposit", {
          depositBtn: "depositBtn",
          customer: user,
          user: enBankerId,
          overviewhm: " ",
          overviewcr: " ",
          overviewd: "overview",
          overvieww: "lowerr",
          overviewle: " ",
          overviewee: " ",
          overviewfd: " ",
          overviewra: " ",
          overviewfda: " ",
          overviewla: " ",
          overviewea: " ",
          overviewcd: " ",
          overviewtd: " ",
          overviewld: " ",
          overviewed: " ",
          bghm: " ",
          bgcr: " ",
          bgd: "bg",
          bgw: " ",
          bgle: " ",
          bgee: " ",
          bgfd: " ",
          bgra: " ",
          bgfda: " ",
          bgla: " ",
          bgea: " ",
          bgcd: " ",
          bgtd: " ",
          bgld: " ",
          bged: " "
        })
      }
    });
  };
  authenticate();
});

//new Deposit Enter & save

app.post("/deposit/:bankerId/:accountno/save", (req, res) => {
  let deRequestedAccountNo = req.params.accountno;
  let enRequestedAccountNo = encryptText(req.params.accountno)
  let enBankerId = req.params.bankerId;
  let deBankerId = decryptText(req.params.bankerId);
  let getFromDeposit = parseInt(req.body.depositAmount);
  let getFromDepositTotal = parseInt(req.body.currentAmount);
  let currentTotalAmount = getFromDeposit + getFromDepositTotal;
const authenticate = async ()=>{
  await Customer.updateOne({ AccountNo: deRequestedAccountNo }, { currentTotalAmount: currentTotalAmount }, (err) => {
    if (!err) {
      let day = getOnlyDate();
      let dayNumberk = dayNumber(day);
      const Deposit = new Transaction({
        transactionTypeMoney: req.body.depositType,
        transactionAmount: getFromDeposit,
        totalAmount: currentTotalAmount,
        transactionTime: getDate(),
        transactionBranch: req.body.branchName,
        transactiontype: "Deposit",
        dayNumber: dayNumberk,
        BankerId: deBankerId
      });
    const authenticate = async()=>{
      await Customer.findOne({ AccountNo: deRequestedAccountNo }, (err, foundCustomer) => {
        if (!err) {
          foundCustomer.transactionEnterys.push(Deposit);
          foundCustomer.save((err) => {
            if (err) {
              let failUrl = "/deposit/fail/" + enBankerId + "/" + enRequestedAccountNo;
              res.redirect(failUrl);
            } else {
              let mailBody = "diposit";
              let mailSubject = "Diposit BRB Bank";
              mailGo.sendMail(foundCustomer.email, getFromDeposit, mailBody, currentTotalAmount, mailSubject)
              .then((posts)=>{
                console.log("sucess");
                 })
              .catch((err)=>{
                console.log(err);
              })  
              let sucessUrl = "/deposit/sucess/" + enBankerId + "/" + enRequestedAccountNo;
              res.redirect(sucessUrl);
            }
          });
        } else {
          let failUrl = "/deposit/fail/" + enBankerId + "/" + enRequestedAccountNo;
          res.redirect(failUrl);
        }
      });
    };
    authenticate();
    }
  });
};
authenticate();
});

//sucess & fail Msg
app.get("/deposit/sucess/:urlBanker/:AccNo", (req, res) => {
  const requestedBanker = req.params.urlBanker;
  let reqDepoait = "/tab/banker/" + requestedBanker + "/deposit";
    res.render("sucessMsg", {
      backUrl: reqDepoait
    });
});

app.get("/deposit/fail/:urlBanker/:AccNo", (req, res) => {
  let reqDepoait = "/deposit/" + req.params.AccNo + "/" + req.params.urlBanker;
    res.render("fail", {
      backUrl: reqDepoait
    });
});

//----------------------------------------------------withdrawal----------------------------------------------------
app.get("/tab/banker/:urlUser/withdrawal", (req, res) => {
  const BankerId = req.params.urlUser;
    res.render("withdrawal", {
      withdrawalBtn: " ",
      customer: " ",
      user: BankerId,
      overviewhm: " ",
      overviewcr: " ",
      overviewd: "uperr",
      overvieww: "overview",
      overviewle: "lowerr",
      overviewee: " ",
      overviewfd: " ",
      overviewra: " ",
      overviewfda: " ",
      overviewla: " ",
      overviewea: " ",
      overviewcd: " ",
      overviewtd: " ",
      overviewld: " ",
      overviewed: " ",
      bghm: " ",
      bgcr: " ",
      bgd: " ",
      bgw: "bg",
      bgle: " ",
      bgee: " ",
      bgfd: " ",
      bgra: " ",
      bgfda: " ",
      bgla: " ",
      bgea: " ",
      bgcd: " ",
      bgtd: " ",
      bgld: " ",
      bged: " "
    })

});

//Search Response
app.get("/withdrawal/:urlAccountNo/:BankerId", (req, res) => {
  const requestedAccountNo = decryptText(req.params.urlAccountNo);
  const BankerId = req.params.BankerId;



  const authenticate = async ()=>{
    await Customer.findOne({ AccountNo: requestedAccountNo }, (err, user) => {
      if (err) {
        res.redirect("/login");
      } else {
        res.render("withdrawal", {
          withdrawalBtn: "withdrawalBtn",
          customer: user,
          user: BankerId,
          overviewhm: " ",
          overviewcr: " ",
          overviewd: "uperr",
          overvieww: "overview",
          overviewle: "lowerr",
          overviewee: " ",
          overviewfd: " ",
          overviewra: " ",
          overviewfda: " ",
          overviewla: " ",
          overviewea: " ",
          overviewcd: " ",
          overviewtd: " ",
          overviewld: " ",
          overviewed: " ",
          bghm: " ",
          bgcr: " ",
          bgd: " ",
          bgw: "bg",
          bgle: " ",
          bgee: " ",
          bgfd: " ",
          bgra: " ",
          bgfda: " ",
          bgla: " ",
          bgea: " ",
          bgcd: " ",
          bgtd: " ",
          bgld: " ",
          bged: " "
        })
      }
    });
  };
  authenticate();
});

//WithDrawal Entery & save
app.post("/withdrawal/:bankerId/:accountno/save", (req, res) => {

  const deRequestedAccountNo = req.params.accountno;
  const enRequestedAccountNo = encryptText(req.params.accountno);
  const enBankerId = req.params.bankerId;
  const deBankerId = decryptText(req.params.bankerId);
  let getFromWithdrawal = parseInt(req.body.withdrawalAmount);
  let getFromWithdrawalTotal = parseInt(req.body.currentAmount);
  let currentTotalAmount = getFromWithdrawalTotal - getFromWithdrawal;
  let currentAmountLoan = parseInt(req.body.LoanAmount) - parseInt(req.body.withdrawalAmount);
  let withdrawalFromLoan = parseInt(req.body.totalLoanAmountWithdrawal) + parseInt(req.body.withdrawalAmount);
  if (req.body.withdeawalFrom === "Loan") {
    if (currentAmountLoan >= 500) {
    const authenticate = async()=>{
      await Customer.findOneAndUpdate(
        { "AccountNo": deRequestedAccountNo, "loanAplicationEntery._id": req.body.LoanAmountID },
        {
          "$set": {
            "loanAplicationEntery.$.totalAmountFromLoan": currentAmountLoan,
            "loanAplicationEntery.$.totalAmountWithdrawal": withdrawalFromLoan,
          }
        },
        function (err, doc) {
          if (err) {
            console.log(err)
          } else {
            let day = getOnlyDate();
            let dayNumberk = dayNumber(day);
            const withdrawal = new Transaction({
              transactionTypeMoney: req.body.withdeawalType,
              transactionAmount: getFromWithdrawal,
              totalAmount: currentAmountLoan,
              transactionTime: getDate(),
              transactionBranch: req.body.branchName,
              transactiontype: "withdrawal Loan",
              dayNumber: dayNumberk,
              BankerId: deBankerId
            });
          const authenticate = async ()=>{
            await Customer.findOne({ AccountNo: deRequestedAccountNo }, (err, foundCustomer) => {
              if (!err) {
                foundCustomer.transactionEnterys.push(withdrawal);
                foundCustomer.save((err) => {
                  if (err) {
                    let failUrl = "/withdrawal/fail/" + enBankerId + "/" + enRequestedAccountNo;
                    res.redirect(failUrl);
                  } else {
                    let mailBody = "withdrawal from loan";
                    let mailSubject = "withdrawal-loan BR Bank";
                    mailGo.sendMail(foundCustomer.email, getFromWithdrawal, mailBody, currentAmountLoan, mailSubject)
                    .then((posts)=>{
                      console.log("sucess");
                       })
                    .catch((err)=>{
                      console.log(err);
                    })  
                    let sucessUrl = "/withdrawal/sucess/" + enBankerId + "/" + enRequestedAccountNo;
                    res.redirect(sucessUrl);
                  }
                });
              } else {
                let failUrl = "/withdrawal/fail/" + enBankerId + "/" + enRequestedAccountNo;
                res.redirect(failUrl);
              }
            });
          };
          authenticate();
          }
        }
      );
    };
    authenticate();
    } else {
      let failUrl = "/withdrawal/fail/" + enBankerId + "/" + enRequestedAccountNo;
      res.redirect(failUrl);
    }
  } else {
    if (currentTotalAmount >= 500) {
    const authenticate = async()=>{
      await Customer.updateOne({ AccountNo: deRequestedAccountNo }, { currentTotalAmount: currentTotalAmount }, (err) => {
        if (!err) {
          let day = getOnlyDate();
          let dayNumberk = dayNumber(day);

          const withdrawal = new Transaction({
            transactionTypeMoney: req.body.withdeawalType,
            transactionAmount: req.body.withdrawalAmount,
            totalAmount: currentTotalAmount,
            transactionTime: getDate(),
            transactionBranch: req.body.branchName,
            transactiontype: "withdrawal",
            dayNumber: dayNumberk,
            BankerId: deBankerId
          });
        const authenticate = async()=>{
          await Customer.findOne({ AccountNo: deRequestedAccountNo }, (err, foundCustomer) => {
            if (!err) {
              foundCustomer.transactionEnterys.push(withdrawal);
              foundCustomer.save((err) => {
                if (err) {
                  let failUrl = "/withdrawal/fail/" + enBankerId + "/" + enRequestedAccountNo;
                  res.redirect(failUrl);
                } else {
                  let mailBody = "withdrawal";
                  let mailSubject = "withdrawal BR Bank";
                  mailGo.sendMail(foundCustomer.email, req.body.withdrawalAmount, mailBody, currentTotalAmount, mailSubject)
                  .then((posts)=>{
                    console.log("sucess");
                     })
                  .catch((err)=>{
                    console.log(err);
                  })  
                  let sucessUrl = "/withdrawal/sucess/" + enBankerId + "/" + enRequestedAccountNo;
                  res.redirect(sucessUrl);
                }
              });
            } else {
              let failUrl = "/withdrawal/fail/" + enBankerId + "/" + enRequestedAccountNo;
              res.redirect(failUrl);
            }
          });
        };
        authenticate();
        }
      });
    };
    authenticate();
    } else {
      let failUrl = "/withdrawal/fail/" + enBankerId + "/" + enRequestedAccountNo;
      res.redirect(failUrl);
    }
  }
});

//sucess
app.get("/withdrawal/sucess/:urlBanker/:AccNo", (req, res) => {
  const requestedBanker = req.params.urlBanker;
  let reqwithdrawal = "/tab/banker/" + requestedBanker + "/withdrawal";
    res.render("sucessMsg", {
      backUrl: reqwithdrawal
    });
});

//fail
app.get("/withdrawal/fail/:urlBanker/:AccNo", (req, res) => {
  const requestedAccountNo = req.params.AccNo;
  const requestedBanker = req.params.urlBanker;
  let reqwithdrawal = "/withdrawal/" + requestedAccountNo + "/" + requestedBanker;
    res.render("fail", {
      backUrl: reqwithdrawal
    });
});

//------------------------------------------------NewLoanEntery------------------------------------------------
app.get("/tab/banker/:urlUser/loan/NewLoanEntry", (req, res) => {
  const BankerId = req.params.urlUser;
    res.render("loanEntry", {
      loanEntryBtn: " ",
      customer: " ",
      user: BankerId,
      overviewhm: " ",
      overviewcr: " ",
      overviewd: " ",
      overvieww: "uperr",
      overviewle: "overview",
      overviewee: "lowerr",
      overviewfd: " ",
      overviewra: " ",
      overviewfda: " ",
      overviewla: " ",
      overviewea: " ",
      overviewcd: " ",
      overviewtd: " ",
      overviewld: " ",
      overviewed: " ",
      bghm: " ",
      bgcr: " ",
      bgd: " ",
      bgw: " ",
      bgle: "bg",
      bgee: " ",
      bgfd: " ",
      bgra: " ",
      bgfda: " ",
      bgla: " ",
      bgea: " ",
      bgcd: " ",
      bgtd: " ",
      bgld: " ",
      bged: " "
    })
});

app.get("/loanEntry/:urlAccountNo/:BankerId", (req, res) => {
  const deRequestedAccountNo = decryptText(req.params.urlAccountNo)
  const BankerId = req.params.BankerId;
  const authenticate = async()=>{
    await Customer.findOne({ AccountNo: deRequestedAccountNo }, (err, user) => {
      if (err) {
        res.redirect("/login");
      } else {
        res.render("loanEntry", {
          loanEntryBtn: "loanEntryBtn",
          customer: user,
          user: BankerId,
          overviewhm: " ",
          overviewcr: " ",
          overviewd: " ",
          overvieww: "uperr",
          overviewle: "overview",
          overviewee: "lowerr",
          overviewfd: " ",
          overviewra: " ",
          overviewfda: " ",
          overviewla: " ",
          overviewea: " ",
          overviewcd: " ",
          overviewtd: " ",
          overviewld: " ",
          overviewed: " ",
          bghm: " ",
          bgcr: " ",
          bgd: " ",
          bgw: " ",
          bgle: "bg",
          bgee: " ",
          bgfd: " ",
          bgra: " ",
          bgfda: " ",
          bgla: " ",
          bgea: " ",
          bgcd: " ",
          bgtd: " ",
          bgld: " ",
          bged: " "
        })
      }
    });
  };
  authenticate();
});

app.post("/loanEntry/:bankerId/:urlAccountnok/save", (req, res) => {

  const deRequestedAccountNo = req.params.urlAccountnok;
  const enRequestedAccountNo = encryptText(deRequestedAccountNo);
  const enBankerId = req.params.bankerId;
  const deBankerId = decryptText(req.params.bankerId);

  if (req.body.buttonType === "cancel") {
  const authenticate = async()=>{
    await LoanAplicationCS.deleteOne({ _id: req.body.applicationID }, (err) => {
      if (!err) {
        let urlGo = "/tab/banker/" + enBankerId + "/LoanApproval"
        res.redirect(urlGo);
      }
    });
  };
  authenticate();
  } else {
    const period = parseInt(req.body.loanPeriod);
    const EmiStatrtLastDate = getDateAfter(period);
    let valuek = 0;
    loanEntry = new LoanAplication({
      monthlyIncome: req.body.monthlyIncome,
      loanAmount: req.body.loanAmount,
      creditScore: req.body.creditScore,
      sanctionAmountLoan: req.body.sanctionAmountLoan,
      loanPeriod: req.body.loanPeriod,
      EmiStatrtLastDate: EmiStatrtLastDate,
      loanType: req.body.loanType,
      loanNominee: req.body.loanNominee,
      loanIntarest: valuek,
      loanIntarestRate: req.body.intarestrate,
      totalAmountFromLoan: req.body.sanctionAmountLoan,
      totalAmountWithdrawal: valuek,
      dateToCalculateIntarest: getOnlyDate(),
      dateLoanTake: getDate(),
      BankerId: deBankerId
    }) 
  const authenticate = async()=>{
    await Customer.findOne({ AccountNo: deRequestedAccountNo }, (err, foundCustomer) => {
      if (!err) {
        foundCustomer.loanAplicationEntery.push(loanEntry);
        foundCustomer.save((err) => {
          if (err) {
            if (req.body.buttonType === "approved") {
              let failUrl = "/loanApplicationApproval/fail/" + enBankerId;
              res.redirect(failUrl);
            } else {
              let failUrl = "/loanApplicationApproval/fail/" + enBankerId + "/" + enRequestedAccountNo;
              res.redirect(failUrl);
            }
          } else {
            mailGo.sendMailapproval(foundCustomer.email, req.body.sanctionAmountLoan)
            .then((posts)=>{
              console.log("sucess");
               })
            .catch((err)=>{
              console.log(err);
            })  
            if (req.body.buttonType === "approved") {
            const authenticate = async()=>{ 
              await LoanAplicationCS.deleteOne({ _id: req.body.applicationID }, (err) => {
                if (!err) {
                  let urlGo = "/tab/banker/" + enBankerId + "/LoanApproval"
                  res.redirect(urlGo);
                }
              })
            };
            authenticate();
            } else {
              let sucessUrl = "/loanApplicationApproval/sucess/" + enBankerId + "/" + enRequestedAccountNo;
              res.redirect(sucessUrl);
            }
          }
        });
      } else {
        if (req.body.buttonType === "approved") {
          let failUrl = "/loanApplicationApproval/fail/" + enBankerId;
          res.redirect(failUrl);
        } else {
          let failUrl = "/loanApplicationApproval/fail/" + enBankerId + "/" + enRequestedAccountNo;
          res.redirect(failUrl);
        }
      }
    });
  };
  authenticate();
  }
});
//sucess
app.get("/loanApplicationApproval/sucess/:urlBanker/:AccNo", (req, res) => {
  const requestedBanker = req.params.urlBanker;
  let reqwithdrawal = "/tab/banker/" + requestedBanker + "/loan/NewLoanEntry";
    res.render("sucessMsg", {
      backUrl: reqwithdrawal
    });
});
//fail
app.get("/loanApplicationApproval/fail/:urlBanker/:AccNo", (req, res) => {
  const requestedAccountNo = req.params.AccNo;
  const requestedBanker = req.params.urlBanker;
  let reqwithdrawal = "/loanEntry/" + requestedAccountNo + "/" + requestedBanker;
    res.render("fail", {
      backUrl: reqwithdrawal
    });
});

// approve fail 
app.get("/loanApplicationApproval/fail/:BankerId", (req, res) => {
  let reqwithdrawal = "/tab/banker/" + req.params.BankerId + "/LoanApproval";
    res.render("fail", {
      backUrl: reqwithdrawal
    });
});

//---------------------------------------------------------emiEntery-----------------------------------------------
app.get("/tab/banker/:BankerId/loan/EMIentry", (req, res) => {
  const BankerId = req.params.BankerId;
    res.render("emiEntry", {
      emiEntryBtn: " ",
      customer: " ",
      user: BankerId,
      overviewhm: " ",
      overviewcr: " ",
      overviewd: " ",
      overvieww: " ",
      overviewle: "uperr",
      overviewee: "overview",
      overviewfd: "lowerr",
      overviewra: " ",
      overviewfda: " ",
      overviewla: " ",
      overviewea: " ",
      overviewcd: " ",
      overviewtd: " ",
      overviewld: " ",
      overviewed: " ",
      bghm: " ",
      bgcr: " ",
      bgd: " ",
      bgw: " ",
      bgle: " ",
      bgee: "bg",
      bgfd: " ",
      bgra: " ",
      bgfda: " ",
      bgla: " ",
      bgea: " ",
      bgcd: " ",
      bgtd: " ",
      bgld: " ",
      bged: " "
    })
});

app.get("/emiEntry/:urlAccountNo/:BankerId", (req, res) => {

  const enRequestedAccountNo = req.params.urlAccountNo;
  const deRequestedAccountNo = decryptText(req.params.urlAccountNo);
  const enBankerId = req.params.BankerId;
  const deBankerId = decryptText(req.params.BankerId);

  const authenticate = async()=>{
    await Customer.findOne({ AccountNo: deRequestedAccountNo }, (err, user) => {
      if (err) {
        res.redirect("/login");
      } else {
        if (user && user.loanAplicationEntery[0]) {
          let day1 = user.loanAplicationEntery[0].dateToCalculateIntarest;
          let day2 = getOnlyDate();
          let dayDif = DaysBitweentwoDays(day1, day2);
          dayDif = parseInt(dayDif);
          let intarestRate = user.loanAplicationEntery[0].loanIntarestRate;
          let totalWithdrawalAmount = parseInt(user.loanAplicationEntery[0].totalAmountWithdrawal);
          let r = intarestRate / 100;
          let RbyN = (r / 12) + 1;
          let t = dayDif / 365;
          let TintoN = t * 12;
          let powerget = (RbyN ** TintoN)
          let totalAmountwithIntarest = totalWithdrawalAmount * powerget;
          let intarestNow = totalAmountwithIntarest - totalWithdrawalAmount;
          let emi1t, emi2t, emi3t, emi4t, emi5t, emi6t, emi7t, emi8t, emi9t, emi10t, emi11t, emi12t, emi13t, emi14t;
          let ints1t, ints2t, ints3t, ints4t, ints5t, ints6t, ints7t, ints8t, ints9t, ints10t, ints11t, ints12t, ints13t, ints14t;
          emi1t = IntarestWithPeriod(totalAmountwithIntarest, r, 0.5) / 6;
          emi2t = IntarestWithPeriod(totalAmountwithIntarest, r, 1) / 12;
          emi3t = IntarestWithPeriod(totalAmountwithIntarest, r, 1.5) / 18;
          emi4t = IntarestWithPeriod(totalAmountwithIntarest, r, 2) / 24;
          emi5t = IntarestWithPeriod(totalAmountwithIntarest, r, 2.5) / 30;
          emi6t = IntarestWithPeriod(totalAmountwithIntarest, r, 3) / 36;
          emi7t = IntarestWithPeriod(totalAmountwithIntarest, r, 3.5) / 42;
          emi8t = IntarestWithPeriod(totalAmountwithIntarest, r, 4) / 48;
          emi9t = IntarestWithPeriod(totalAmountwithIntarest, r, 4.5) / 54;
          emi10t = IntarestWithPeriod(totalAmountwithIntarest, r, 5) / 60;
          emi11t = IntarestWithPeriod(totalAmountwithIntarest, r, 5.5) / 66;
          emi12t = IntarestWithPeriod(totalAmountwithIntarest, r, 6) / 72;
          emi13t = IntarestWithPeriod(totalAmountwithIntarest, r, 6.5) / 78;
          emi14t = IntarestWithPeriod(totalAmountwithIntarest, r, 7) / 84;
          ints1t = IntarestWithPeriod(totalAmountwithIntarest, r, 0.5) - totalWithdrawalAmount;
          ints2t = IntarestWithPeriod(totalAmountwithIntarest, r, 1) - totalWithdrawalAmount;
          ints3t = IntarestWithPeriod(totalAmountwithIntarest, r, 1.5) - totalWithdrawalAmount;
          ints4t = IntarestWithPeriod(totalAmountwithIntarest, r, 2) - totalWithdrawalAmount;
          ints5t = IntarestWithPeriod(totalAmountwithIntarest, r, 2.5) - totalWithdrawalAmount;
          ints6t = IntarestWithPeriod(totalAmountwithIntarest, r, 3) - totalWithdrawalAmount;
          ints7t = IntarestWithPeriod(totalAmountwithIntarest, r, 3.5) - totalWithdrawalAmount;
          ints8t = IntarestWithPeriod(totalAmountwithIntarest, r, 4) - totalWithdrawalAmount;
          ints9t = IntarestWithPeriod(totalAmountwithIntarest, r, 4.5) - totalWithdrawalAmount;
          ints10t = IntarestWithPeriod(totalAmountwithIntarest, r, 5) - totalWithdrawalAmount;
          ints11t = IntarestWithPeriod(totalAmountwithIntarest, r, 5.5) - totalWithdrawalAmount;
          ints12t = IntarestWithPeriod(totalAmountwithIntarest, r, 6) - totalWithdrawalAmount;
          ints13t = IntarestWithPeriod(totalAmountwithIntarest, r, 6.5) - totalWithdrawalAmount;
          ints14t = IntarestWithPeriod(totalAmountwithIntarest, r, 7) - totalWithdrawalAmount;
          res.render("emiEntry", {
            emiEntryBtn: "emiEntryBtn",
            customer: user,
            user: enBankerId,
            emi1t: parseInt(emi1t),
            emi2t: parseInt(emi2t),
            emi3t: parseInt(emi3t),
            emi4t: parseInt(emi4t),
            emi5t: parseInt(emi5t),
            emi6t: parseInt(emi6t),
            emi7t: parseInt(emi7t),
            emi8t: parseInt(emi8t),
            emi9t: parseInt(emi9t),
            emi10t: parseInt(emi10t),
            emi11t: parseInt(emi11t),
            emi12t: parseInt(emi12t),
            emi13t: parseInt(emi13t),
            emi14t: parseInt(emi14t),
            ints1t: ints1t,
            ints2t: ints2t,
            ints3t: ints3t,
            ints4t: ints4t,
            ints5t: ints5t,
            ints6t: ints6t,
            ints7t: ints7t,
            ints8t: ints8t,
            ints9t: ints9t,
            ints10t: ints10t,
            ints11t: ints11t,
            ints12t: ints12t,
            ints13t: ints13t,
            ints14t: ints14t,
            totalWithdrawalAmount: parseInt(totalWithdrawalAmount),
            intarestNow: parseInt(intarestNow),
            totalAmountwithIntarest: parseInt(totalAmountwithIntarest),
            overviewhm: " ",
            overviewcr: " ",
            overviewd: " ",
            overvieww: " ",
            overviewle: "uperr",
            overviewee: "overview",
            overviewfd: "lowerr",
            overviewra: " ",
            overviewfda: " ",
            overviewla: " ",
            overviewea: " ",
            overviewcd: " ",
            overviewtd: " ",
            overviewld: " ",
            overviewed: " ",
            bghm: " ",
            bgcr: "bg",
            bgd: " ",
            bgw: " ",
            bgle: " ",
            bgee: "bg",
            bgfd: " ",
            bgra: " ",
            bgfda: " ",
            bgla: " ",
            bgea: " ",
            bgcd: " ",
            bgtd: " ",
            bgld: " ",
            bged: " "
          })
        } else {
          res.render("emiEntry", {
            emiEntryBtn: "emiEntryBtn",
            customer: user,
            user: enBankerId,
            overviewhm: " ",
            overviewcr: " ",
            overviewd: " ",
            overvieww: " ",
            overviewle: "uperr",
            overviewee: "overview",
            overviewfd: "lowerr",
            overviewra: " ",
            overviewfda: " ",
            overviewla: " ",
            overviewea: " ",
            overviewcd: " ",
            overviewtd: " ",
            overviewld: " ",
            overviewed: " ",
            bghm: " ",
            bgcr: " ",
            bgd: " ",
            bgw: " ",
            bgle: " ",
            bgee: "bg",
            bgfd: " ",
            bgra: " ",
            bgfda: " ",
            bgla: " ",
            bgea: " ",
            bgcd: " ",
            bgtd: " ",
            bgld: " ",
            bged: " "
          });
        }
      }
    });
  };
  authenticate();
});


app.post("/loan/EMIentry/:BankerId/save", (req, res) => {
  const enBankerId = req.params.BankerId;
  const deBankerId = decryptText(req.params.BankerId);
  const enRequestedAccountNo = encryptText(req.body.AccountNo)

  if (req.body.buttonType === "cancel") {
  const authenticate = async()=>{
    await LoanEmiCS.deleteOne({ _id: req.body.applicationID }, (err) => {
      if (!err) {
        let urlGo = "/tab/banker/" + enBankerId + "/EMIApproval";
        res.redirect(urlGo);
      }
    });
  };
  authenticate();
  } else {
    let currentTotalAmount = parseInt(req.body.TotalAmount) - parseInt(req.body.loanEmiAmount);
    if (currentTotalAmount >= 500) {
    const authenticate = async()=>{
      await Customer.updateOne({ AccountNo: req.body.AccountNo }, { currentTotalAmount: currentTotalAmount, isAnyEMIrunning: "yes" }, (err) => {
        if (!err) {
          let day = getOnlyDate();
          let dayNumberk = dayNumber(day);
          const withdrawal = new Transaction({
            transactionTypeMoney: "EMI Start",
            transactionAmount: parseInt(req.body.loanEmiAmount),
            totalAmount: currentTotalAmount,
            transactionTime: getDate(),
            transactionBranch: req.body.branchName,
            transactiontype: "withdrawal",
            dayNumber: dayNumberk,
            BankerId: deBankerId
          });
        const authenticate = async()=>{
          await Customer.findOne({ AccountNo: req.body.AccountNo }, (err, foundCustomer) => {
            if (!err) {
              foundCustomer.transactionEnterys.push(withdrawal);
              foundCustomer.save((err) => {
                if (err) {
                  if (req.body.buttonType === "approves") {
                    let failUrl = "/EMIentry/fail/" + enBankerId;
                    res.redirect(failUrl);
                  } else {
                    let failUrl = "/LoanPayment/fail/" + enBankerId + "/" + enRequestedAccountNo;
                    res.redirect(failUrl);
                  }
                } else {
                  let noInstallments = parseInt(req.body.noInstallments) - 1;
                  let payable = (parseInt(req.body.noInstallments) * parseInt(req.body.loanEmiAmount)) - parseInt(req.body.loanEmiAmount);
                  const newLoanEmi = new LoanEmi({
                    branchName: req.body.branchName,
                    loanAccountNumber: req.body.AccountNo,
                    loanPlanCode: req.body.loanPlanCode,
                    loanPaymentMode: "From Main Bank Balance",
                    noInstallments: noInstallments,
                    totalPayable: payable,
                    loanEmiAmount: req.body.loanEmiAmount,
                    emiStartDate: getOnlyDate(),
                    isEmiruning: "yes",
                    BankerId: deBankerId,
                    dateIntarestCalculate: getDateAfter(1),
                    loanAdvisorName: req.body.loanAdvisorName
                  });
                const authenticate = async()=>{
                  await Customer.findOne({ AccountNo: req.body.AccountNo }, (err, foundCustomer) => {
                    if (!err) {
                      foundCustomer.loanEMIEntery.push(newLoanEmi);
                      foundCustomer.save((err) => {
                        if (err) {
                          if (req.body.buttonType === "approves") {
                            let failUrl = "/EMIentry/fail/" + enBankerId;
                            res.redirect(failUrl);
                          } else {
                            let failUrl = "/LoanPayment/fail/" + enBankerId + "/" + enRequestedAccountNo;
                            res.redirect(failUrl);
                          }
                        } else {
                          let mailBody = "withdrwan for EMI";
                          let mailSubject = "EMI withdrwan BRB Bank";
                          mailGo.sendMail(foundCustomer.email, parseInt(req.body.loanEmiAmount), mailBody, currentTotalAmount, mailSubject)
                          .then((posts)=>{
                            console.log("sucess");
                             })
                          .catch((err)=>{
                            console.log(err);
                          })  
                          if (req.body.buttonType === "approves") {
                          const authenticate = async()=>{ 
                            await LoanEmiCS.deleteOne({ _id: req.body.applicationID }, (err) => {
                              if (!err) {
                                let urlGo = "/tab/banker/" + enBankerId + "/EMIApproval";
                                res.redirect(urlGo);
                              }
                            })
                          };
                          authenticate();
                          } else {
                            let sucessUrl = "/LoanPayment/sucess/" + enBankerId + "/" + enRequestedAccountNo;
                            res.redirect(sucessUrl);
                          }
                        }
                      });
                    } else {
                      if (req.body.buttonType === "approves") {
                        let failUrl = "/EMIentry/fail/" + enBankerId;
                        res.redirect(failUrl);
                      } else {
                        let failUrl = "/LoanPayment/fail/" + enBankerId + "/" + enRequestedAccountNo;
                        res.redirect(failUrl);
                      }
                    }
                  });
                };
                authenticate();
                }
              });
            } else {
              if (req.body.buttonType === "approves") {
                let failUrl = "/EMIentry/fail/" + enBankerId;
                res.redirect(failUrl);
              } else {
                let failUrl = "/LoanPayment/fail/" + enBankerId + "/" + enRequestedAccountNo;
                res.redirect(failUrl);
              }
            }
          });
        };
        authenticate();
        }
      });
    };
    authenticate();
    } else {
      if (req.body.buttonType === "approves") {
        let failUrl = "/EMIentry/fail/" + enBankerId;
        res.redirect(failUrl);
      } else {
        let failUrl = "/LoanPayment/fail/" + enBankerId + "/" + enRequestedAccountNo;
        res.redirect(failUrl);
      }
    }
  }
});

//fail 
app.get("/EMIentry/fail/:BankerId", (req, res) => {
  let reqwithdrawal = "/tab/banker/" + req.params.BankerId + "/EMIApproval";
    res.render("fail", {
      backUrl: reqwithdrawal
    });
});

app.post("/loan/Onepayment/:BankerId/save", (req, res) => {

  const deRequestedAccountNo = req.body.AccountNo;
  const enRequestedAccountNo = encryptText(req.body.AccountNo);
  const enBankerId = req.params.BankerId;
  const deBankerId = decryptText(req.params.BankerId);
  let currentTotalAmount = parseInt(req.body.TotalAmount) - parseInt(req.body.totalAmountwithIntarest);
  let haveToPay = parseInt(req.body.haveToPay);
  let haveToPayK = parseInt(req.body.totalAmountwithIntarest);
  if (currentTotalAmount >= 500 && haveToPayK === haveToPay) {
  const authenticate = async()=>{
    await Customer.updateOne({ AccountNo: deRequestedAccountNo }, { currentTotalAmount: currentTotalAmount }, (err) => {
      if (!err) {
        let day = getOnlyDate();
        let dayNumberk = dayNumber(day);
        const withdrawal = new Transaction({
          transactionTypeMoney: "Cut to Clear The Full Loan Amount",
          transactionAmount: parseInt(req.body.totalAmountwithIntarest),
          totalAmount: currentTotalAmount,
          transactionTime: getDate(),
          transactionBranch: req.body.branchName,
          transactiontype: "withdrawal",
          dayNumber: dayNumberk,
          BankerId: deBankerId
        });
      const authenticate = async()=>{
        await Customer.findOne({ AccountNo: deRequestedAccountNo }, (err, foundCustomer) => {
          if (!err) {
            foundCustomer.transactionEnterys.push(withdrawal);
            foundCustomer.save((err) => {
              if (err) {
                let failUrl = "/LoanPayment/fail/" + enBankerId + "/" + enRequestedAccountNo;
                res.redirect(failUrl);
              } else {
              const authenticate = async()=>{
                await Customer.findOneAndUpdate({ AccountNo: req.body.AccountNo },
                  { $pull: { loanAplicationEntery: { _id: req.body.loanId } } }, (err, customer) => {
                    if (!err) {
                      let mailBody = "withdrwan for Loan clearance";
                      let mailSubject = "Loan clearance BRB Bank";
                      mailGo.sendMail(foundCustomer.email, parseInt(req.body.totalAmountwithIntarest), mailBody, currentTotalAmount, mailSubject)
                      .then((posts)=>{
                        console.log("sucess");
                         })
                      .catch((err)=>{
                        console.log(err);
                      })  
                      let sucessUrl = "/LoanPayment/sucess/" + enBankerId + "/" + enRequestedAccountNo;
                      res.redirect(sucessUrl);
                    }
                  });
              };
              authenticate();
              }
            });
          } else {
            let failUrl = "/LoanPayment/fail/" + enBankerId + "/" + enRequestedAccountNo;
            res.redirect(failUrl);
          }
        });
      };
      authenticate();
      }
    });
  };
  authenticate();
  } else {
    let failUrl = "/LoanPayment/fail/" + enBankerId + "/" + enRequestedAccountNo;
    res.redirect(failUrl);
  }
});

//fail
app.get("/LoanPayment/fail/:BankerId/:AccountNo", (req, res) => {
  const requestedAccountNo = req.params.AccountNo;
  const requestedBanker = req.params.BankerId;
  let reqwithdrawal = "/emiEntry/" + requestedAccountNo + "/" + requestedBanker;
    res.render("fail", {
      backUrl: reqwithdrawal
    });
});

//sucess
app.get("/LoanPayment/sucess/:BankerId/:AccountNo", (req, res) => {
  const requestedBanker = req.params.BankerId;
  let reqwithdrawal = "/tab/banker/" + requestedBanker + "/loan/EMIentry";
    res.render("sucessMsg", {
      backUrl: reqwithdrawal
    });
});

app.post("/loan/paybackPrimeAmountorIntarest/:BankerId/save", (req, res) => {

  const enBankerId = req.params.BankerId;
  const deBankerId = decryptText(req.params.BankerId);
  const enRequestedAccountNo = encryptText(req.body.AccountNo);
  const deRequestedAccountNo = req.body.AccountNo;
  let currentTotalAmount = parseInt(req.body.TotalAmount) - parseInt(req.body.primeAmount)
  if (currentTotalAmount >= 500) {


  const authenticate = async()=>{
    await Customer.updateOne({ AccountNo: deRequestedAccountNo }, { currentTotalAmount: currentTotalAmount }, (err) => {
      if (!err) {
        let day = getOnlyDate();
        let dayNumberk = dayNumber(day);
        const withdrawal = new Transaction({
          transactionTypeMoney: "Cut to Reduce The Loan Amount",
          transactionAmount: parseInt(req.body.primeAmount),
          totalAmount: currentTotalAmount,
          transactionTime: getDate(),
          transactionBranch: req.body.branchName,
          transactiontype: "withdrawal",
          dayNumber: dayNumberk,
          BankerId: deBankerId
        });
      const authenticate = async()=>{
        await Customer.findOne({ AccountNo: deRequestedAccountNo }, (err, foundCustomer) => {
          if (!err) {
            foundCustomer.transactionEnterys.push(withdrawal);
            foundCustomer.save((err) => {
              if (err) {
                let failUrl = "/LoanPayment/fail/" + enBankerId + "/" + enRequestedAccountNo;
                res.redirect(failUrl);
              } else {
                let day1 = foundCustomer.loanAplicationEntery[0].dateToCalculateIntarest;
                let day2 = getOnlyDate();
                let dayDif = DaysBitweentwoDays(day1, day2);
                dayDif = parseInt(dayDif);
                let intarestRate = foundCustomer.loanAplicationEntery[0].loanIntarestRate;
                let totalWithdrawalAmount = parseInt(foundCustomer.loanAplicationEntery[0].totalAmountWithdrawal);
                let r = intarestRate / 100;
                let RbyN = (r / 12) + 1;
                let t = dayDif / 365;
                let TintoN = t * 12;
                let powerget = (RbyN ** TintoN)
                let totalAmountwithIntarest = totalWithdrawalAmount * powerget;
                let withdrawalFromLoan = totalAmountwithIntarest - parseInt(req.body.primeAmount)
              const authenticate = async()=>{ 
                await Customer.findOneAndUpdate(
                  { "AccountNo": deRequestedAccountNo, "loanAplicationEntery._id": req.body.loanId },
                  {
                    "$set": {
                      "loanAplicationEntery.$.totalAmountWithdrawal": withdrawalFromLoan,
                      "loanAplicationEntery.$.dateToCalculateIntarest": getOnlyDate()
                    }
                  },
                  function (err, doc) {
                    if (err) {
                      console.log(err);
                    } else {
                      let mailSubject = "withdrwan for Loan BRB Bank";
                      let mailBody = "for reduce loan amount";
                      mailGo.sendMail(foundCustomer.email, parseInt(req.body.primeAmount), mailBody, currentTotalAmount, mailSubject)
                      .then((posts)=>{
                        console.log("sucess");
                         })
                      .catch((err)=>{
                        console.log(err);
                      })  
                      let sucessUrl = "/LoanPayment/sucess/" + enBankerId + "/" + enRequestedAccountNo;
                      res.redirect(sucessUrl);
                    }
                  }
                );
              };
              authenticate();
              }
            });
          } else {
            let failUrl = "/LoanPayment/fail/" + enBankerId + "/" + enRequestedAccountNo;
            res.redirect(failUrl);
          }
        });
      };
      authenticate();
      }
    });
  };
  authenticate();
  } else {
    let failUrl = "/LoanPayment/fail/" + enBankerId + "/" + enRequestedAccountNo;
    res.redirect(failUrl);
  }
});

//-------------------------------------------------------------------fixed deposit-----------------------------------------------

app.get("/tab/banker/:urlUser/fd", (req, res) => {
  const BankerId = req.params.urlUser;
    res.render("fixedDeposit", {
      fixedDepositBtn: " ",
      customer: " ",
      user: BankerId,
      overviewhm: " ",
      overviewcr: " ",
      overviewd: " ",
      overvieww: " ",
      overviewle: " ",
      overviewee: "uperr",
      overviewfd: "overview",
      overviewra: " ",
      overviewfda: " ",
      overviewla: " ",
      overviewea: " ",
      overviewcd: " ",
      overviewtd: " ",
      overviewld: " ",
      overviewed: " ",
      bghm: " ",
      bgcr: " ",
      bgd: " ",
      bgw: " ",
      bgle: " ",
      bgee: " ",
      bgfd: "bg",
      bgra: " ",
      bgfda: " ",
      bgla: " ",
      bgea: " ",
      bgcd: " ",
      bgtd: " ",
      bgld: " ",
      bged: " "
    });
});

app.get("/fixedDeposit/:urlAccountNo/:BankerId", (req, res) => {
  const deRequestedAccountNo = decryptText(req.params.urlAccountNo);
  const enBankerId = req.params.BankerId;
  const authenticate = async()=>{
    await Customer.findOne({ AccountNo: deRequestedAccountNo }, (err, user) => {
      if (err) {
        res.redirect("/login");
      } else {
        res.render("fixedDeposit", {
          fixedDepositBtn: "fixedDepositBtn",
          customer: user,
          user: enBankerId,
          overviewhm: " ",
          overviewcr: " ",
          overviewd: " ",
          overvieww: " ",
          overviewle: " ",
          overviewee: "uperr",
          overviewfd: "overview",
          overviewra: " ",
          overviewfda: " ",
          overviewla: " ",
          overviewea: " ",
          overviewcd: " ",
          overviewtd: " ",
          overviewld: " ",
          overviewed: " ",
          bghm: " ",
          bgcr: " ",
          bgd: " ",
          bgw: " ",
          bgle: " ",
          bgee: " ",
          bgfd: "bg",
          bgra: " ",
          bgfda: " ",
          bgla: " ",
          bgea: " ",
          bgcd: " ",
          bgtd: " ",
          bgld: " ",
          bged: " "
        })
      }
    });
  };
  authenticate();
});

app.post("/fixedDiposit/save/:BankerId", (req, res) => {
  const enBankerId = req.params.BankerId;
  const deBankerId = decryptText(req.params.BankerId);
  const enRequestedAccountNo = encryptText(req.body.accountNo);
  const deRequestedAccountNo = req.body.accountNo;
  if (req.body.btn === "Cancel") {
  const authenticate = async()=>{  
    await FixedCSDeposit.deleteOne({ _id: req.body.ApplicationId }, (err) => {
      if (!err) {
        urlGo = "/tab/banker/" + enBankerId + "/fdApproval"
        res.redirect(urlGo);
      }
    })
  };
  authenticate();
  } else {
    let currentTotalAmount = parseInt(req.body.activeAmount) - parseInt(req.body.fixedAmount);
    if (currentTotalAmount >= 500) {
      let fixedAmounttak = parseInt(req.body.fixedAmount);
      let interest = parseInt(req.body.interest);
      let duration = parseInt(req.body.duration);
      let finalAmount = fixedAmounttak + ((fixedAmounttak * interest * (duration / 12)) / 100);
      let abFinalAmount = parseInt(finalAmount);
    const authenticate = async()=>{
      await Customer.updateOne({ AccountNo: deRequestedAccountNo }, { currentTotalAmount: currentTotalAmount, isAnyFixedDiposit: "Yes" }, (err) => {
        if (!err) {
          const fixedDiposit = new FixedDeposit({
            primeAmount: parseInt(req.body.fixedAmount),
            finalAmount: abFinalAmount,
            startingDate: getDate(),
            maturitiyDate: getDateAfter(duration),
            BankerId: deBankerId
          });
        const authenticate = async()=>{ 
          await Customer.findOne({ AccountNo: deRequestedAccountNo }, (err, foundCustomer) => {
            if (!err) {
              foundCustomer.fixedDipositEntery.push(fixedDiposit);
              foundCustomer.save((err) => {
                let day = getOnlyDate();
                let dayNumberk = dayNumber(day);
                const withdrawal = new Transaction({
                  transactionTypeMoney: "Lock The Fixed Amount",
                  transactionAmount: parseInt(req.body.fixedAmount),
                  totalAmount: currentTotalAmount,
                  transactionTime: getDate(),
                  transactionBranch: "Nasaratpur",
                  transactiontype: "withdrawal",
                  dayNumber: dayNumberk,
                  BankerId: deBankerId
                });
              const authenticate = async()=>{  
                await Customer.findOne({ AccountNo: deRequestedAccountNo }, (err, foundCustomer) => {
                  if (!err) {
                    foundCustomer.transactionEnterys.push(withdrawal);
                    foundCustomer.save((err) => {
                      if (err) {
                        if (req.body.btn === "Approved") {
                          let failUrl = "/fd/fail/" + enBankerId;
                          res.redirect(failUrl);
                        } else {
                          let failUrl = "/fd/fail/" + enBankerId + "/" + deRequestedAccountNo;
                          res.redirect(failUrl);
                        }
                      } else {
                        if (req.body.btn === "Approved") {
                        const authenticate = async()=>{ 
                          await FixedCSDeposit.deleteOne({ _id: req.body.ApplicationId }, (err) => {
                            if (!err) {
                              let mailSubject = "Fixeddiposit BRB Bank";
                              let mailBody = "Locked for fixeddiposit and maturitiyDate is " + getDateAfter(duration);
                              mailGo.sendMail(foundCustomer.email, parseInt(req.body.fixedAmount), mailBody, currentTotalAmount, mailSubject)
                              .then((posts)=>{
                                console.log("sucess");
                                 })
                              .catch((err)=>{
                                console.log(err);
                              })  
                              let urlGo = "/tab/banker/" + enBankerId + "/fdApproval"
                              res.redirect(urlGo);
                            }
                          })
                        };
                        authenticate();
                        } else {
                          let mailSubject = "Fixeddiposit BRB Bank";
                          let mailBody = "Locked for fixeddiposit and maturitiyDate is " + getDateAfter(duration);
                          mailGo.sendMail(foundCustomer.email, parseInt(req.body.fixedAmount), mailBody, currentTotalAmount, mailSubject)
                          .then((posts)=>{
                            console.log("sucess");
                             })
                          .catch((err)=>{
                            console.log(err);
                          })  
                          let sucessUrl = "/fd/sucess/" + enBankerId + "/" + deRequestedAccountNo;
                          res.redirect(sucessUrl);
                        }
                      }
                    });
                  } else {
                    if (req.body.btn === "Approved") {
                      let failUrl = "/fd/fail/" + enBankerId;
                      res.redirect(failUrl);
                    } else {
                      let failUrl = "/fd/fail/" + enBankerId + "/" + deRequestedAccountNo;
                      res.redirect(failUrl);
                    }
                  }
                });
              };
              authenticate();
              });
            } else {
              if (req.body.btn === "Approved") {
                let failUrl = "/fd/fail/" + enBankerId;
                res.redirect(failUrl);
              } else {
                let failUrl = "/fd/fail/" + enBankerId + "/" + deRequestedAccountNo;
                res.redirect(failUrl);
              }
            }
          });
        };
        authenticate();
        }
        else {
          console.log(err);
        }
      });
    };
    authenticate();
    } else {
      let failUrl = "/fd/fail/" + enBankerId + "/" + deRequestedAccountNo;
      res.redirect(failUrl);
    }
  }
})

//sucess
app.get("/fd/sucess/:BankerId/:accountNo", (req, res) => {
  const requestedBanker = req.params.BankerId;
  let reqwithdrawal = "/tab/banker/" + requestedBanker + "/fd";
    res.render("sucessMsg", {
      backUrl: reqwithdrawal
    });
});
//fail
app.get("/fd/fail/:BankerId/:accountNo", (req, res) => {
  const requestedAccountNo = req.params.accountNo;
  const requestedBanker = req.params.BankerId;
  let reqwithdrawal = "/fixedDeposit/" + requestedAccountNo + "/" + requestedBanker;
    res.render("fail", {
      backUrl: reqwithdrawal
    });
})
//fail
app.get("/fd/fail/:BankerId", (req, res) => {
  const requestedBanker = req.params.BankerId;
  let reqwithdrawal = "/tab/banker/" + requestedBanker + "/fdApproval";
    res.render("fail", {
      backUrl: reqwithdrawal
    });
})

//------------------------------------------------------------Details---------------------------------------------------------

//-----------------------------------------------Customer Details----------------------------------------------

app.get("/tab/banker/:urlUser/cmDetails", (req, res) => {
  const BankerId = req.params.urlUser;
  const authenticate = async()=>{
    await Customer.find((err, customers) => {
      res.render("customerDetails", {
        customerDetailBtn: "all",
        customers: customers,
        customer: " ",
        user: BankerId,
        overviewhm: " ",
        overviewcr: " ",
        overviewd: " ",
        overvieww: " ",
        overviewle: " ",
        overviewee: " ",
        overviewfd: " ",
        overviewra: " ",
        overviewfda: " ",
        overviewla: " ",
        overviewea: " ",
        overviewcd: "overview",
        overviewtd: "lowerr",
        overviewld: " ",
        overviewed: " ",
        bghm: " ",
        bgcr: " ",
        bgd: " ",
        bgw: " ",
        bgle: " ",
        bgee: " ",
        bgfd: " ",
        bgra: " ",
        bgfda: " ",
        bgla: " ",
        bgea: " ",
        bgcd: "bg",
        bgtd: " ",
        bgld: " ",
        bged: " "
      })
    });
  };
  authenticate();
});

app.get("/customerDetails/:urlAccountNo/:BankerId", (req, res) => {
  const deRequestedAccountNo = decryptText(req.params.urlAccountNo);
  const BankerId = req.params.BankerId;
  const authenticate = async()=>{
    await Customer.findOne({ AccountNo: deRequestedAccountNo }, (err, user) => {
      if (err) {
        res.redirect("/login");
      } else {

        if (user && user.transactionEnterys[0]) {
          let transtionArraylen = user.transactionEnterys.length - 1;
          var latesttranstion = user.transactionEnterys[transtionArraylen];
        } else {
          var latesttranstion = " ";
        }
        res.render("customerDetails", {
          customerDetailBtn: "customerDetailBtn",
          customer: user,
          customers: " ",
          user: BankerId,
          latesttranstion: latesttranstion,
          overviewhm: " ",
          overviewcr: " ",
          overviewd: " ",
          overvieww: " ",
          overviewle: " ",
          overviewee: " ",
          overviewfd: " ",
          overviewra: " ",
          overviewfda: " ",
          overviewla: " ",
          overviewea: " ",
          overviewcd: "overview",
          overviewtd: "lowerr",
          overviewld: " ",
          overviewed: " ",
          bghm: " ",
          bgcr: " ",
          bgd: " ",
          bgw: " ",
          bgle: " ",
          bgee: " ",
          bgfd: " ",
          bgra: " ",
          bgfda: " ",
          bgla: " ",
          bgea: " ",
          bgcd: "bg",
          bgtd: " ",
          bgld: " ",
          bged: " "
        })
      }
    });
  };
  authenticate();
});

app.get("/customerDetails/:urlAccountNo/:BankerId/direct", (req, res) => {
  const deRequestedAccountNo = req.params.urlAccountNo;
  const BankerId = req.params.BankerId;
  const authenticate = async()=>{
    await Customer.findOne({ AccountNo: deRequestedAccountNo }, (err, user) => {
      if (err) {
        res.redirect("/login");
      } else {
        if (user.transactionEnterys[0]) {
          let transtionArraylen = user.transactionEnterys.length - 1;
          var latesttranstion = user.transactionEnterys[transtionArraylen];
        } else {
          var latesttranstion = " ";
        }
        res.render("customerDetails", {
          customerDetailBtn: "customerDetailBtn",
          customer: user,
          customers: " ",
          user: BankerId,
          latesttranstion: latesttranstion,
          overviewhm: " ",
          overviewcr: " ",
          overviewd: " ",
          overvieww: " ",
          overviewle: " ",
          overviewee: " ",
          overviewfd: " ",
          overviewra: " ",
          overviewfda: " ",
          overviewla: " ",
          overviewea: " ",
          overviewcd: "overview",
          overviewtd: "lowerr",
          overviewld: " ",
          overviewed: " ",
          bghm: " ",
          bgcr: " ",
          bgd: " ",
          bgw: " ",
          bgle: " ",
          bgee: " ",
          bgfd: " ",
          bgra: " ",
          bgfda: " ",
          bgla: " ",
          bgea: " ",
          bgcd: "bg",
          bgtd: " ",
          bgld: " ",
          bged: " "
        })
      }
    });
  };
  authenticate();
});

//--------------------------------------------transactionDetails-----------------------------------------------
app.get("/tab/banker/:urlUser/transactiondetails", (req, res) => {
  const BankerId = req.params.urlUser;
    res.render("transactiondetails", {
      transactiondetailsBtn: " ",
      customer: " ",
      user: BankerId,
      transactions: " ",
      overviewhm: " ",
      overviewcr: " ",
      overviewd: " ",
      overvieww: " ",
      overviewle: " ",
      overviewee: " ",
      overviewfd: " ",
      overviewra: " ",
      overviewfda: " ",
      overviewla: " ",
      overviewea: " ",
      overviewcd: "uperr",
      overviewtd: "overview",
      overviewld: "lowerr",
      overviewed: " ",
      bghm: " ",
      bgcr: " ",
      bgd: " ",
      bgw: " ",
      bgle: " ",
      bgee: " ",
      bgfd: " ",
      bgra: " ",
      bgfda: " ",
      bgla: " ",
      bgea: " ",
      bgcd: " ",
      bgtd: "bg",
      bgld: " ",
      bged: " "
    })
});

app.get("/transactiondetails/:urlAccountNo/:BankerId", (req, res) => {
  const deRequestedAccountNo = decryptText(req.params.urlAccountNo);
  const BankerId = req.params.BankerId;
  const authenticate = async()=>{
    await Customer.findOne({ AccountNo: deRequestedAccountNo }, (err, user) => {
      if (err) {
        res.redirect("/login");
      } else {
        if (user) {
          let fromDay = 18824;
          let day = getOnlyDate();
          let toDay = dayNumber(day);
          let current = new Date();
          let currentYear = current.getFullYear();
          res.render("transactiondetails", {
            transactiondetailsBtn: "transactiondetailsBtn",
            customer: user,
            user: BankerId,
            transactions: user.transactionEnterys,
            fromDay: fromDay,
            toDay: toDay,
            currentYear: currentYear,
            fromDayV: "17",
            fromMonthV: "2",
            fromYearV: " ",
            toDayV: "17",
            toMonthV: "2",
            toYearV: " ",
            overviewhm: " ",
            overviewcr: " ",
            overviewd: " ",
            overvieww: " ",
            overviewle: " ",
            overviewee: " ",
            overviewfd: " ",
            overviewra: " ",
            overviewfda: " ",
            overviewla: " ",
            overviewea: " ",
            overviewcd: "uperr",
            overviewtd: "overview",
            overviewld: "lowerr",
            overviewed: " ",
            bghm: " ",
            bgcr: " ",
            bgd: " ",
            bgw: " ",
            bgle: " ",
            bgee: " ",
            bgfd: " ",
            bgra: " ",
            bgfda: " ",
            bgla: " ",
            bgea: " ",
            bgcd: " ",
            bgtd: "bg",
            bgld: " ",
            bged: " "
          })
        } else {
          res.render("transactiondetails", {
            transactiondetailsBtn: "transactiondetailsBtn",
            customer: user,
            user: BankerId,
            transactions: " ",
            overviewhm: " ",
            overviewcr: " ",
            overviewd: " ",
            overvieww: " ",
            overviewle: " ",
            overviewee: " ",
            overviewfd: " ",
            overviewra: " ",
            overviewfda: " ",
            overviewla: " ",
            overviewea: " ",
            overviewcd: "uperr",
            overviewtd: "overview",
            overviewld: "lowerr",
            overviewed: " ",
            bghm: " ",
            bgcr: " ",
            bgd: " ",
            bgw: " ",
            bgle: " ",
            bgee: " ",
            bgfd: " ",
            bgra: " ",
            bgfda: " ",
            bgla: " ",
            bgea: " ",
            bgcd: " ",
            bgtd: "bg",
            bgld: " ",
            bged: " "
          })
        }
      }
    });
  };
  authenticate();
});

app.post("/transactionDetails/search", (req, res) => {

  if (req.body.transtionSearchBtn === "banker") {
    var goUrlTsearch = "/transactionDetails/" + encryptText(req.body.AccountNo) + "/" + encryptText(req.body.BankerId) + "/" + req.body.fromMonth + "/" + req.body.fromDay + "/" + req.body.fromYear + "/to/" + req.body.toMonth + "/" + req.body.toDay + "/" + req.body.toYear;
  } else if (req.body.transtionSearchBtn === "customer") {
    var goUrlTsearch = "/transactionDetails/" + req.body.AccountNo + "/" + req.body.fromMonth + "/" + req.body.fromDay + "/" + req.body.fromYear + "/to/" + req.body.toMonth + "/" + req.body.toDay + "/" + req.body.toYear;
  }
  res.redirect(goUrlTsearch);
});

app.get("/transactionDetails/:AccountNo/:BankerId/:fromMonth/:fromDay/:fromYear/to/:toMonth/:toDay/:toYear", (req, res) => {
  const deRequestedAccountNo = decryptText(req.params.AccountNo);
  const BankerId = req.params.BankerId;
  const authenticate = async()=>{
    await Customer.findOne({ AccountNo: deRequestedAccountNo }, (err, user) => {
      if (err) {
        res.redirect("/login");
      } else {
        let fromDate = req.params.fromMonth + "/" + req.params.fromDay + "/" + req.params.fromYear;
        let fromDay = dayNumber(fromDate);
        let toDate = req.params.toMonth + "/" + req.params.toDay + "/" + req.params.toYear;
        let toDay = dayNumber(toDate);
        let current = new Date();
        let currentYear = current.getFullYear();
        res.render("transactiondetails", {
          fromDayV: req.params.fromDay,
          fromMonthV: req.params.fromMonth,
          fromYearV: req.params.fromYear,
          toDayV: req.params.toDay,
          toMonthV: req.params.toMonth,
          toYearV: req.params.toYear,
          transactiondetailsBtn: "transactiondetailsBtn",
          customer: user,
          user: BankerId,
          transactions: user.transactionEnterys,
          fromDay: fromDay,
          toDay: toDay,
          currentYear: currentYear,
          overviewhm: " ",
          overviewcr: " ",
          overviewd: " ",
          overvieww: " ",
          overviewle: " ",
          overviewee: " ",
          overviewfd: " ",
          overviewra: " ",
          overviewfda: " ",
          overviewla: " ",
          overviewea: " ",
          overviewcd: "uperr",
          overviewtd: "overview",
          overviewld: "lowerr",
          overviewed: " ",
          bghm: " ",
          bgcr: " ",
          bgd: " ",
          bgw: " ",
          bgle: " ",
          bgee: " ",
          bgfd: " ",
          bgra: " ",
          bgfda: " ",
          bgla: " ",
          bgea: " ",
          bgcd: " ",
          bgtd: "bg",
          bgld: " ",
          bged: " "
        })
      }
    });
  };
  authenticate();
});

//-------------------------------------------------loan Details------------------------------------------------
app.get("/tab/banker/:BankerId/Loandetails", (req, res) => {
  const BankerId = req.params.BankerId;
  const authenticate = async()=>{
    await Customer.find((err, customers) => {
      res.render("loanDetails", {
        customers: customers,
        loanDetailsbtn: "allDetails",
        user: BankerId,
        overviewhm: " ",
        overviewcr: " ",
        overviewd: " ",
        overvieww: " ",
        overviewle: " ",
        overviewee: " ",
        overviewfd: " ",
        overviewra: " ",
        overviewfda: " ",
        overviewla: " ",
        overviewea: " ",
        overviewcd: " ",
        overviewtd: "uperr",
        overviewld: "overview",
        overviewed: "lowerr",
        bghm: " ",
        bgcr: " ",
        bgd: " ",
        bgw: " ",
        bgle: " ",
        bgee: " ",
        bgfd: " ",
        bgra: " ",
        bgfda: " ",
        bgla: " ",
        bgea: " ",
        bgcd: " ",
        bgtd: " ",
        bgld: "bg",
        bged: " "
      })
    });
  };
  authenticate();
});

app.get("/loanDetail/:urlAccountNo/:BankerId", (req, res) => {
  const requestedAccountNo = decryptText(req.params.urlAccountNo);
  const BankerId = req.params.BankerId;
  const authenticate = async()=>{
    await Customer.findOne({ AccountNo: requestedAccountNo }, (err, customer) => {
      if (!err) {
        if (customer) {
          if (customer.loanAplicationEntery[0]) {
            var totalAmountTakenkkk = parseInt(customer.loanAplicationEntery[0].sanctionAmountLoan) - parseInt(customer.loanAplicationEntery[0].totalAmountFromLoan);
          }
          res.render("loanDetails", {
            customer: customer,
            loanDetailsbtn: "loanDetailsbtn",
            user: BankerId,
            totalAmountTaken: totalAmountTakenkkk,
            overviewhm: " ",
            overviewcr: " ",
            overviewd: " ",
            overvieww: " ",
            overviewle: " ",
            overviewee: " ",
            overviewfd: " ",
            overviewra: " ",
            overviewfda: " ",
            overviewla: " ",
            overviewea: " ",
            overviewcd: " ",
            overviewtd: "uperr",
            overviewld: "overview",
            overviewed: "lowerr",
            bghm: " ",
            bgcr: " ",
            bgd: " ",
            bgw: " ",
            bgle: " ",
            bgee: " ",
            bgfd: " ",
            bgra: " ",
            bgfda: " ",
            bgla: " ",
            bgea: " ",
            bgcd: " ",
            bgtd: " ",
            bgld: "bg",
            bged: " "
          })
        } else {
          res.render("loanDetails", {
            customer: customer,
            loanDetailsbtn: "loanDetailsbtn",
            user: BankerId,
            totalAmountTaken: " ",
            overviewhm: " ",
            overviewcr: " ",
            overviewd: " ",
            overvieww: " ",
            overviewle: " ",
            overviewee: " ",
            overviewfd: " ",
            overviewra: " ",
            overviewfda: " ",
            overviewla: " ",
            overviewea: " ",
            overviewcd: " ",
            overviewtd: "uperr",
            overviewld: "overview",
            overviewed: "lowerr",
            bghm: " ",
            bgcr: " ",
            bgd: " ",
            bgw: " ",
            bgle: " ",
            bgee: " ",
            bgfd: " ",
            bgra: " ",
            bgfda: " ",
            bgla: " ",
            bgea: " ",
            bgcd: " ",
            bgtd: " ",
            bgld: "bg",
            bged: " "
          })
        }
      }
    });
  };
  authenticate();
});


app.get("/loanDetail/:urlAccountNo/:BankerId/direct", (req, res) => {
  const requestedAccountNo = req.params.urlAccountNo;
  const BankerId = req.params.BankerId;
  const authenticate = async()=>{
    await Customer.findOne({ AccountNo: requestedAccountNo }, (err, customer) => {
      if (!err) {
        if (customer) {
          if (customer.loanAplicationEntery[0]) {
            var totalAmountTakenkkk = parseInt(customer.loanAplicationEntery[0].sanctionAmountLoan) - parseInt(customer.loanAplicationEntery[0].totalAmountFromLoan);
          }
          res.render("loanDetails", {
            customer: customer,
            loanDetailsbtn: "loanDetailsbtn",
            user: BankerId,
            totalAmountTaken: totalAmountTakenkkk,
            overviewhm: " ",
            overviewcr: " ",
            overviewd: " ",
            overvieww: " ",
            overviewle: " ",
            overviewee: " ",
            overviewfd: " ",
            overviewra: " ",
            overviewfda: " ",
            overviewla: " ",
            overviewea: " ",
            overviewcd: " ",
            overviewtd: "uperr",
            overviewld: "overview",
            overviewed: "lowerr",
            bghm: " ",
            bgcr: " ",
            bgd: " ",
            bgw: " ",
            bgle: " ",
            bgee: " ",
            bgfd: " ",
            bgra: " ",
            bgfda: " ",
            bgla: " ",
            bgea: " ",
            bgcd: " ",
            bgtd: " ",
            bgld: "bg",
            bged: " "
          })
        } else {
          res.render("loanDetails", {
            customer: customer,
            loanDetailsbtn: "loanDetailsbtn",
            user: BankerId,
            totalAmountTaken: " ",
            overviewhm: " ",
            overviewcr: " ",
            overviewd: " ",
            overvieww: " ",
            overviewle: " ",
            overviewee: " ",
            overviewfd: " ",
            overviewra: " ",
            overviewfda: " ",
            overviewla: " ",
            overviewea: " ",
            overviewcd: " ",
            overviewtd: "uperr",
            overviewld: "overview",
            overviewed: "lowerr",
            bghm: " ",
            bgcr: " ",
            bgd: " ",
            bgw: " ",
            bgle: " ",
            bgee: " ",
            bgfd: " ",
            bgra: " ",
            bgfda: " ",
            bgla: " ",
            bgea: " ",
            bgcd: " ",
            bgtd: " ",
            bgld: "bg",
            bged: " "
          })
        }
      }
    });
  };
  authenticate();
});

//--------------------------------------------------emi details------------------------------------------------
app.get("/tab/banker/:BankerId/emidetails", (req, res) => {
  const BankerId = req.params.BankerId;
  const authenticate = async()=>{
    await Customer.find({ isAnyEMIrunning: "yes" }, (err, customers) => {
      res.render("emiDetails", {
        customers: customers,
        emiDetailsbtn: "allDetails",
        user: BankerId,
        overviewhm: " ",
        overviewcr: " ",
        overviewd: " ",
        overvieww: " ",
        overviewle: " ",
        overviewee: " ",
        overviewfd: " ",
        overviewra: " ",
        overviewfda: " ",
        overviewla: " ",
        overviewea: " ",
        overviewcd: " ",
        overviewtd: " ",
        overviewld: "uperr",
        overviewed: "overview",
        bghm: " ",
        bgcr: " ",
        bgd: " ",
        bgw: " ",
        bgle: " ",
        bgee: " ",
        bgfd: " ",
        bgra: " ",
        bgfda: " ",
        bgla: " ",
        bgea: " ",
        bgcd: " ",
        bgtd: " ",
        bgld: " ",
        bged: "bg"
      })
    });
  };
  authenticate();
});

app.get("/emiDetail/:urlAccountNo/:BankerId", (req, res) => {
  const requestedAccountNo = decryptText(req.params.urlAccountNo);
  const BankerId = req.params.BankerId;
  const authenticate = async()=>{
     await Customer.findOne({ AccountNo: requestedAccountNo }, (err, customer) => {
      if (!err) {
        if (customer) {
          if (customer.loanAplicationEntery[0]) {
            var totalAmountTakenkk = parseInt(customer.loanAplicationEntery[0].sanctionAmountLoan) - parseInt(customer.loanAplicationEntery[0].totalAmountFromLoan);
          }
          res.render("emiDetails", {
            customer: customer,
            emiDetailsbtn: "emiDetailsbtn",
            user: BankerId,
            totalAmountTaken: totalAmountTakenkk,
            overviewhm: " ",
            overviewcr: " ",
            overviewd: " ",
            overvieww: " ",
            overviewle: " ",
            overviewee: " ",
            overviewfd: " ",
            overviewra: " ",
            overviewfda: " ",
            overviewla: " ",
            overviewea: " ",
            overviewcd: " ",
            overviewtd: " ",
            overviewld: "uperr",
            overviewed: "overview",
            bghm: " ",
            bgcr: " ",
            bgd: " ",
            bgw: " ",
            bgle: " ",
            bgee: " ",
            bgfd: " ",
            bgra: " ",
            bgfda: " ",
            bgla: " ",
            bgea: " ",
            bgcd: " ",
            bgtd: " ",
            bgld: " ",
            bged: "bg"
          })
        } else {
          res.render("emiDetails", {
            customer: customer,
            emiDetailsbtn: "emiDetailsbtn",
            user: BankerId,
            totalAmountTaken: " ",
            overviewhm: " ",
            overviewcr: " ",
            overviewd: " ",
            overvieww: " ",
            overviewle: " ",
            overviewee: " ",
            overviewfd: " ",
            overviewra: " ",
            overviewfda: " ",
            overviewla: " ",
            overviewea: " ",
            overviewcd: " ",
            overviewtd: " ",
            overviewld: "uperr",
            overviewed: "overview",
            bghm: " ",
            bgcr: " ",
            bgd: " ",
            bgw: " ",
            bgle: " ",
            bgee: " ",
            bgfd: " ",
            bgra: " ",
            bgfda: " ",
            bgla: " ",
            bgea: " ",
            bgcd: " ",
            bgtd: " ",
            bgld: " ",
            bged: "bg"
          })
        }
      }
    });
  };
  authenticate();
});

app.get("/emiDetail/:urlAccountNo/:BankerId/direct", (req, res) => {
  const requestedAccountNo = req.params.urlAccountNo;
  const BankerId = req.params.BankerId;
  const authenticate = async() =>{
    await Customer.findOne({ AccountNo: requestedAccountNo }, (err, customer) => {
      if (!err) {
        if (customer) {
          if (customer.loanAplicationEntery[0]) {
            var totalAmountTakenkk = parseInt(customer.loanAplicationEntery[0].sanctionAmountLoan) - parseInt(customer.loanAplicationEntery[0].totalAmountFromLoan);
          }
          res.render("emiDetails", {
            customer: customer,
            emiDetailsbtn: "emiDetailsbtn",
            user: BankerId,
            totalAmountTaken: totalAmountTakenkk,
            overviewhm: " ",
            overviewcr: " ",
            overviewd: " ",
            overvieww: " ",
            overviewle: " ",
            overviewee: " ",
            overviewfd: " ",
            overviewra: " ",
            overviewfda: " ",
            overviewla: " ",
            overviewea: " ",
            overviewcd: " ",
            overviewtd: " ",
            overviewld: "uperr",
            overviewed: "overview",
            bghm: " ",
            bgcr: " ",
            bgd: " ",
            bgw: " ",
            bgle: " ",
            bgee: " ",
            bgfd: " ",
            bgra: " ",
            bgfda: " ",
            bgla: " ",
            bgea: " ",
            bgcd: " ",
            bgtd: " ",
            bgld: " ",
            bged: "bg"
          })
        } else {
          res.render("emiDetails", {
            customer: customer,
            emiDetailsbtn: "emiDetailsbtn",
            user: BankerId,
            totalAmountTaken: " ",
            overviewhm: " ",
            overviewcr: " ",
            overviewd: " ",
            overvieww: " ",
            overviewle: " ",
            overviewee: " ",
            overviewfd: " ",
            overviewra: " ",
            overviewfda: " ",
            overviewla: " ",
            overviewea: " ",
            overviewcd: " ",
            overviewtd: " ",
            overviewld: "uperr",
            overviewed: "overview",
            bghm: " ",
            bgcr: " ",
            bgd: " ",
            bgw: " ",
            bgle: " ",
            bgee: " ",
            bgfd: " ",
            bgra: " ",
            bgfda: " ",
            bgla: " ",
            bgea: " ",
            bgcd: " ",
            bgtd: " ",
            bgld: " ",
            bged: "bg"
          })
        }
      }
    });
  };
  authenticate();
});

//----------------------------------------------Approval-----------------------------------------------
app.post("/approvalsearch/:BankerId", (req, res) => {
  const BankerId = req.params.BankerId;
  let UrlCr = "/" + req.body.aprovalBtn + "/" + encryptText(req.body.uniqueAccountNo) + "/" + BankerId;
  res.redirect(UrlCr);
});

app.get("/tab/banker/:BankerId/fdApproval", (req, res) => {
  const BankerId = req.params.BankerId;
  const authenticate = async()=>{
    await FixedCSDeposit.find((err, applications) => {
      res.render("fdApprovalList", {
        applications: applications,
        user: BankerId,
        overviewhm: " ",
        overviewcr: " ",
        overviewd: " ",
        overvieww: " ",
        overviewle: " ",
        overviewee: " ",
        overviewfd: " ",
        overviewra: "uperr",
        overviewfda: "overview",
        overviewla: "lowerr",
        overviewea: " ",
        overviewcd: " ",
        overviewtd: " ",
        overviewld: " ",
        overviewed: " ",
        bghm: " ",
        bgcr: " ",
        bgd: " ",
        bgw: " ",
        bgle: " ",
        bgee: " ",
        bgfd: " ",
        bgra: " ",
        bgfda: "bg",
        bgla: " ",
        bgea: " ",
        bgcd: " ",
        bgtd: " ",
        bgld: " ",
        bged: " "
      });
    });
  };
 authenticate();
});

app.get("/fdapproval/:accountNo/:user", (req, res) => {
  const deRequestedAccountNo = decryptText(req.params.accountNo);
  const authenticate = async()=>{
    await FixedCSDeposit.find({ accountNo: deRequestedAccountNo }, (err, applications) => {
      res.render("fdApprovalList", {
        applications: applications,
        user: req.params.user,
        overviewhm: " ",
        overviewcr: " ",
        overviewd: " ",
        overvieww: " ",
        overviewle: " ",
        overviewee: " ",
        overviewfd: " ",
        overviewra: "uperr",
        overviewfda: "overview",
        overviewla: "lowerr",
        overviewea: " ",
        overviewcd: " ",
        overviewtd: " ",
        overviewld: " ",
        overviewed: " ",
        bghm: " ",
        bgcr: " ",
        bgd: " ",
        bgw: " ",
        bgle: " ",
        bgee: " ",
        bgfd: " ",
        bgra: " ",
        bgfda: "bg",
        bgla: " ",
        bgea: " ",
        bgcd: " ",
        bgtd: " ",
        bgld: " ",
        bged: " "
      });
    });
  };
  authenticate();
});

app.get("/tab/banker/:BankerId/LoanApproval", (req, res) => {
  const BankerId = req.params.BankerId;
  const authenticate = async()=>{
    await LoanAplicationCS.find((err, applications) => {
      res.render("loanApproval", {
        applications: applications,
        user: BankerId,
        overviewhm: " ",
        overviewcr: " ",
        overviewd: " ",
        overvieww: " ",
        overviewle: " ",
        overviewee: " ",
        overviewfd: " ",
        overviewra: " ",
        overviewfda: "uperr",
        overviewla: "overview",
        overviewea: "lowerr",
        overviewcd: " ",
        overviewtd: " ",
        overviewld: " ",
        overviewed: " ",
        bghm: " ",
        bgcr: " ",
        bgd: " ",
        bgw: " ",
        bgle: " ",
        bgee: " ",
        bgfd: " ",
        bgra: " ",
        bgfda: " ",
        bgla: "bg",
        bgea: " ",
        bgcd: " ",
        bgtd: " ",
        bgld: " ",
        bged: " "
      });
    });
  };
  authenticate();
});

app.get("/loanapproval/:accountno/:user", (req, res) => {
  const deRequestedAccountNo = decryptText(req.params.accountno);
  const authenticate = async()=>{
    await LoanAplicationCS.find({ AccountNo: deRequestedAccountNo }, (err, applications) => {
      res.render("loanApproval", {
        applications: applications,
        user: req.params.user,
        overviewhm: " ",
        overviewcr: " ",
        overviewd: " ",
        overvieww: " ",
        overviewle: " ",
        overviewee: " ",
        overviewfd: " ",
        overviewra: " ",
        overviewfda: "uperr",
        overviewla: "overview",
        overviewea: "lowerr",
        overviewcd: " ",
        overviewtd: " ",
        overviewld: " ",
        overviewed: " ",
        bghm: " ",
        bgcr: " ",
        bgd: " ",
        bgw: " ",
        bgle: " ",
        bgee: " ",
        bgfd: " ",
        bgra: " ",
        bgfda: " ",
        bgla: "bg",
        bgea: " ",
        bgcd: " ",
        bgtd: " ",
        bgld: " ",
        bged: " "
      });
    });
  };
  authenticate();
});

app.get("/loanApplication/:urlAccountNo/:urlId/:BankerID/approval", (req, res) => {
  const loanApplicationID = req.params.urlId;
  const loanApplicationAccountNo = req.params.urlAccountNo;
  const BankerId = req.params.BankerID;
  const authenticate = async()=>{
    await Customer.findOne({ AccountNo: loanApplicationAccountNo }, (err, customer) => {
      if (!err) {
      const authenticate = async()=>{
        await LoanAplicationCS.findOne({ _id: loanApplicationID }, (err, application) => {
          if (!err) {
            res.render("singleLoanApply", {
              application: application,
              customer: customer,
              user: BankerId,
              loanApplicationID: loanApplicationID,
              overviewhm: " ",
              overviewcr: " ",
              overviewd: " ",
              overvieww: " ",
              overviewle: " ",
              overviewee: " ",
              overviewfd: " ",
              overviewra: " ",
              overviewfda: "uperr",
              overviewla: "overview",
              overviewea: "lowerr",
              overviewcd: " ",
              overviewtd: " ",
              overviewld: " ",
              overviewed: " ",
              bghm: " ",
              bgcr: " ",
              bgd: " ",
              bgw: " ",
              bgle: " ",
              bgee: " ",
              bgfd: " ",
              bgra: " ",
              bgfda: " ",
              bgla: "bg",
              bgea: " ",
              bgcd: " ",
              bgtd: " ",
              bgld: " ",
              bged: " "
            });
          }
        });
      };
      authenticate();
      }
    });
  };
  authenticate();
});

app.get("/tab/banker/:BankerId/EMIApproval", (req, res) => {
  const BankerId = req.params.BankerId;

  const authenticate = async()=>{
    await LoanEmiCS.find((err, applications) => {
      res.render("emiApproval", {
        applications: applications,
        user: BankerId,
        overviewhm: " ",
        overviewcr: " ",
        overviewd: " ",
        overvieww: " ",
        overviewle: " ",
        overviewee: " ",
        overviewfd: " ",
        overviewra: " ",
        overviewfda: " ",
        overviewla: "uperr",
        overviewea: "overview",
        overviewcd: " ",
        overviewtd: " ",
        overviewld: " ",
        overviewed: " ",
        bghm: " ",
        bgcr: " ",
        bgd: " ",
        bgw: " ",
        bgle: " ",
        bgee: " ",
        bgfd: " ",
        bgra: " ",
        bgfda: " ",
        bgla: " ",
        bgea: "bg",
        bgcd: " ",
        bgtd: " ",
        bgld: " ",
        bged: " "
      });
    });
  };
  authenticate();
});

app.get("/emiapproval/:accountno/:BankerId", (req, res) => {
  const BankerId = req.params.BankerId;
  const deRequestedAccountNo = decryptText(req.params.accountno);
  const authenticate = async()=>{ 
    await LoanEmiCS.find({ loanAccountNumber: deRequestedAccountNo }, (err, applications) => {
      res.render("emiApproval", {
        applications: applications,
        user: BankerId,
        overviewhm: " ",
        overviewcr: " ",
        overviewd: " ",
        overvieww: " ",
        overviewle: " ",
        overviewee: " ",
        overviewfd: " ",
        overviewra: " ",
        overviewfda: " ",
        overviewla: "uperr",
        overviewea: "overview",
        overviewcd: " ",
        overviewtd: " ",
        overviewld: " ",
        overviewed: " ",
        bghm: " ",
        bgcr: " ",
        bgd: " ",
        bgw: " ",
        bgle: " ",
        bgee: " ",
        bgfd: " ",
        bgra: " ",
        bgfda: " ",
        bgla: " ",
        bgea: "bg",
        bgcd: " ",
        bgtd: " ",
        bgld: " ",
        bged: " "
      });
    });
  };
  authenticate();
});

app.get("/emiApplication/:urlAccountNo/:urlId/:BankerID/approval", (req, res) => {
  const loanApplicationID = req.params.urlId;
  const loanApplicationAccountNo = req.params.urlAccountNo;
  const BankerId = req.params.BankerID;
  const authenticate = async()=>{
    await Customer.findOne({ AccountNo: loanApplicationAccountNo }, (err, customer) => {
      if (!err) {


      const authenticate = async()=>{
        await LoanEmiCS.findOne({ _id: loanApplicationID }, (err, application) => {
          if (!err) {
            let day1 = customer.loanAplicationEntery[0].dateToCalculateIntarest;
            let day2 = getOnlyDate();
            let dayDif = DaysBitweentwoDays(day1, day2);
            dayDif = parseInt(dayDif);
            let intarestRate = customer.loanAplicationEntery[0].loanIntarestRate;
            let totalWithdrawalAmount = parseInt(customer.loanAplicationEntery[0].totalAmountWithdrawal);
            let r = intarestRate / 100;
            let RbyN = (r / 12) + 1;
            let t = dayDif / 365;
            let TintoN = t * 12;
            let powerget = (RbyN ** TintoN)
            let totalAmountwithIntarest = totalWithdrawalAmount * powerget;
            let intarestNow = totalAmountwithIntarest - totalWithdrawalAmount;

            let emi1t, emi2t, emi3t, emi4t, emi5t, emi6t, emi7t, emi8t, emi9t, emi10t, emi11t, emi12t, emi13t, emi14t;
            let ints1t, ints2t, ints3t, ints4t, ints5t, ints6t, ints7t, ints8t, ints9t, ints10t, ints11t, ints12t, ints13t, ints14t;

            emi1t = IntarestWithPeriod(totalAmountwithIntarest, r, 0.5) / 6;
            emi2t = IntarestWithPeriod(totalAmountwithIntarest, r, 1) / 12;
            emi3t = IntarestWithPeriod(totalAmountwithIntarest, r, 1.5) / 18;
            emi4t = IntarestWithPeriod(totalAmountwithIntarest, r, 2) / 24;
            emi5t = IntarestWithPeriod(totalAmountwithIntarest, r, 2.5) / 30;
            emi6t = IntarestWithPeriod(totalAmountwithIntarest, r, 3) / 36;
            emi7t = IntarestWithPeriod(totalAmountwithIntarest, r, 3.5) / 42;
            emi8t = IntarestWithPeriod(totalAmountwithIntarest, r, 4) / 48;
            emi9t = IntarestWithPeriod(totalAmountwithIntarest, r, 4.5) / 54;
            emi10t = IntarestWithPeriod(totalAmountwithIntarest, r, 5) / 60;
            emi11t = IntarestWithPeriod(totalAmountwithIntarest, r, 5.5) / 66;
            emi12t = IntarestWithPeriod(totalAmountwithIntarest, r, 6) / 72;
            emi13t = IntarestWithPeriod(totalAmountwithIntarest, r, 6.5) / 78;
            emi14t = IntarestWithPeriod(totalAmountwithIntarest, r, 7) / 84;


            ints1t = IntarestWithPeriod(totalAmountwithIntarest, r, 0.5) - totalWithdrawalAmount;
            ints2t = IntarestWithPeriod(totalAmountwithIntarest, r, 1) - totalWithdrawalAmount;
            ints3t = IntarestWithPeriod(totalAmountwithIntarest, r, 1.5) - totalWithdrawalAmount;
            ints4t = IntarestWithPeriod(totalAmountwithIntarest, r, 2) - totalWithdrawalAmount;
            ints5t = IntarestWithPeriod(totalAmountwithIntarest, r, 2.5) - totalWithdrawalAmount;
            ints6t = IntarestWithPeriod(totalAmountwithIntarest, r, 3) - totalWithdrawalAmount;
            ints7t = IntarestWithPeriod(totalAmountwithIntarest, r, 3.5) - totalWithdrawalAmount;
            ints8t = IntarestWithPeriod(totalAmountwithIntarest, r, 4) - totalWithdrawalAmount;
            ints9t = IntarestWithPeriod(totalAmountwithIntarest, r, 4.5) - totalWithdrawalAmount;
            ints10t = IntarestWithPeriod(totalAmountwithIntarest, r, 5) - totalWithdrawalAmount;
            ints11t = IntarestWithPeriod(totalAmountwithIntarest, r, 5.5) - totalWithdrawalAmount;
            ints12t = IntarestWithPeriod(totalAmountwithIntarest, r, 6) - totalWithdrawalAmount;
            ints13t = IntarestWithPeriod(totalAmountwithIntarest, r, 6.5) - totalWithdrawalAmount;
            ints14t = IntarestWithPeriod(totalAmountwithIntarest, r, 7) - totalWithdrawalAmount;

            res.render("singleEmiApplication", {
              user: BankerId,
              application: application,
              customer: customer,
              loanApplicationID: loanApplicationID,
              emi1t: parseInt(emi1t),
              emi2t: parseInt(emi2t),
              emi3t: parseInt(emi3t),
              emi4t: parseInt(emi4t),
              emi5t: parseInt(emi5t),
              emi6t: parseInt(emi6t),
              emi7t: parseInt(emi7t),
              emi8t: parseInt(emi8t),
              emi9t: parseInt(emi9t),
              emi10t: parseInt(emi10t),
              emi11t: parseInt(emi11t),
              emi12t: parseInt(emi12t),
              emi13t: parseInt(emi13t),
              emi14t: parseInt(emi14t),
              ints1t: ints1t,
              ints2t: ints2t,
              ints3t: ints3t,
              ints4t: ints4t,
              ints5t: ints5t,
              ints6t: ints6t,
              ints7t: ints7t,
              ints8t: ints8t,
              ints9t: ints9t,
              ints10t: ints10t,
              ints11t: ints11t,
              ints12t: ints12t,
              ints13t: ints13t,
              ints14t: ints14t,
              totalWithdrawalAmount: parseInt(totalWithdrawalAmount),
              intarestNow: parseInt(intarestNow),
              totalAmountwithIntarest: parseInt(totalAmountwithIntarest),
              overviewhm: " ",
              overviewcr: " ",
              overviewd: "",
              overvieww: " ",
              overviewle: " ",
              overviewee: " ",
              overviewfd: " ",
              overviewra: " ",
              overviewfda: " ",
              overviewla: "uperr",
              overviewea: "overview",
              overviewcd: " ",
              overviewtd: " ",
              overviewld: " ",
              overviewed: " ",
              bghm: " ",
              bgcr: " ",
              bgd: " ",
              bgw: " ",
              bgle: " ",
              bgee: " ",
              bgfd: " ",
              bgra: " ",
              bgfda: " ",
              bgla: " ",
              bgea: "bg",
              bgcd: " ",
              bgtd: " ",
              bgld: " ",
              bged: " "
            })
          }
        });
      };
      authenticate();  
      }
    });
  };
  authenticate();
});

//------------------------------------------------------------------------cutomer-----------------------------------------------------------------
//cutomer details
app.get("/tab/customer/:urlUser/home", (req, res) => {
  const enrequestedAccountNo = req.params.urlUser;
  const derequestedAccountNo = decryptText(req.params.urlUser);
  const authenticate = async ()=>{
    await Customer.findOne({ AccountNo: derequestedAccountNo }, (err, user) => {
      if (err) {
        res.redirect("/login");
      } else {
        res.render("customerHome", {
          customer: user,
          user: enrequestedAccountNo,
          fixedDiposits: user.fixedDipositEntery
        })
      }
    });
  };
  authenticate();
});


//forget password
app.get("/customer/forgetpasseord", (req, res) => {
  res.render("customerSingUp", {
    otpMatch: " ",
    signUp: " ",
    updatepass: "yes"
  });
});

app.post("/forgetpassword/OtpSend", (req, res) => {
  let otp = Math.floor(100000 + Math.random() * 900000);
  let AccountNo = req.body.username;
 const authenticate = async()=>{
  await Customer.findOne({ AccountNo: AccountNo }, (err, user) => {
    if (user) {
      Admin.findOne({ username: AccountNo, userType: "customer" }, (err, userk) => {
        if (userk) {
          mailGo.sendMailOtp(user.email, otp)
          .then((posts)=>{
            console.log("sucess");
             })
          .catch((err)=>{
            console.log(err);
          })  
          let passWord = req.body.password;
          res.render("otpCheckForSignUp", {
            AccountNo: AccountNo,
            passWord: passWord,
            OTP: otp,
            userExist: "yes",
            passwordUpdate: "yes",
            signUp: " "
          });
        } else {
          res.redirect("/customersingup");
        }
      })
    } else {
      res.render("otpCheckForSignUp", {
        AccountNo: AccountNo,
        userExist: "no",
        passwordUpdate: "yes",
        signUp: " "
      });
    }
  });
};
authenticate();
});

app.post("/forgetpassword/checkingOTP", (req, res) => {
  if (req.body.userOtp == req.body.serverOTP) {
    let accountNo = req.body.AccountNo;
    let passw = req.body.passWord;
  const authenticate = async()=>{
    await Admin.deleteOne({ username: accountNo }, (err) => {
      if (!err) {
            bcrypt.hash( passw , saltRounds , (err,hash)=>{
             const newUser = new Admin({
              username: accountNo ,
              password: hash,
              userType: "customer"
                });
             const authenticate = async()=>{
              await newUser.save((err)=>{
              if(err){
                console.log(err);
                res.redirect("/login");
              } else {
                res.render("sucessRegisted", {
                  passwordUpdate: "yes",
                  signUp: " "
                });
               }
                })
              };
              authenticate();
           });
      } else {
        console.log(err);
        res.redirect("/login");
      }
    });
  };
  authenticate();
  } else {
    res.render("customerSingUp", {
      otpMatch: "no",
      signUp: " ",
      updatepass: "yes"
    });
  }
});




//transaction details
app.get("/tab/customer/:urlUser/transactiondetails", (req, res) => {
  const enrequestedAccountNo = req.params.urlUser;
  const derequestedAccountNo = decryptText(req.params.urlUser);
  const authenticate = async()=>{ 
    await Customer.findOne({ AccountNo: derequestedAccountNo }, (err, user) => {
      if (err) {
        res.redirect("/login");
      } else {
        let fromDay = 18824;
        let day = getOnlyDate();
        let toDay = dayNumber(day);
        let current = new Date();
        let currentYear = current.getFullYear();
        res.render("customertranstionDetails", {
          user: enrequestedAccountNo,
          transactions: user.transactionEnterys,
          fromDayV: "17",
          fromMonthV: "2",
          fromYearV: " ",
          toDayV: "17",
          toMonthV: "2",
          toYearV: " ",
          fromDay: fromDay,
          toDay: toDay,
          currentYear: currentYear,
        })
      }
    });
  };
  authenticate();
});

app.get("/transactionDetails/:AccountNo/:fromMonth/:fromDay/:fromYear/to/:toMonth/:toDay/:toYear", (req, res) => {
  const enrequestedAccountNo = req.params.AccountNo;
  const derequestedAccountNo = decryptText(req.params.AccountNo);
  const authenticate = async()=>{
    await Customer.findOne({ AccountNo: derequestedAccountNo }, (err, user) => {
      if (err) {
        res.redirect("/login");
      } else {
        let fromDate = req.params.fromMonth + "/" + req.params.fromDay + "/" + req.params.fromYear;
        let fromDay = dayNumber(fromDate);
        let toDate = req.params.toMonth + "/" + req.params.toDay + "/" + req.params.toYear;
        let toDay = dayNumber(toDate);
        let current = new Date();
        let currentYear = current.getFullYear();
        res.render("customertranstionDetails", {
          fromDayV: req.params.fromDay,
          fromMonthV: req.params.fromMonth,
          fromYearV: req.params.fromYear,
          toDayV: req.params.toDay,
          toMonthV: req.params.toMonth,
          toYearV: req.params.toYear,
          fromDay: fromDay,
          toDay: toDay,
          currentYear: currentYear,
          user: enrequestedAccountNo,
          transactions: user.transactionEnterys,
        })
      }
    });
  };
  authenticate();

});

//money Trensfer
app.get("/tab/customer/:urlUser/moneytransfer", (req, res) => {
  const derequestedAccountNo = decryptText(req.params.urlUser);
 const authenticate = async()=>{
  await Customer.findOne({ AccountNo: derequestedAccountNo }, (err, user) => {
    if (user.istransfromOpen == "yes") {
      const requestedAccountNo = req.params.urlUser;
        res.render("moneyTransfer", {
          user: requestedAccountNo,
          customerGet: " ",
        })
    } else {
      const requestedAccountNo = req.params.urlUser;
        res.render("pinCreate", {
          user: requestedAccountNo,
          derequestedAccountNo: derequestedAccountNo,
          wrongOtp: " ",
          createPin: "yes",
          updatePin: " "
        })
    }
  });
 };
 authenticate();
});
app.get("/moneytransfer/forgetPassword/:accountNo", (req, res) => {
  const derequestedAccountNo = decryptText(req.params.accountNo);
  const requestedAccountNo = req.params.accountNo;
    res.render("pinCreate", {
      user: requestedAccountNo,
      derequestedAccountNo: derequestedAccountNo,
      wrongOtp: " ",
      createPin: " ",
      updatePin: "yes"
    })
});

app.post("/transferCm/OtpConfrom/:user", (req, res) => {
  let otp = Math.floor(100000 + Math.random() * 900000);
  let AccountNo = req.body.accountNo;
 const authenticate = async()=>{
  await Customer.findOne({ AccountNo: AccountNo }, (err, user) => {
    if (!err) {
      mailGo.sendMailOtp(user.email, otp)
      .then((posts)=>{
        console.log("sucess");
         })
      .catch((err)=>{
        console.log(err);
      })  
      let TrPin1 = req.body.TrPin1;
      res.render("otpCheckForPin", {
        user: req.params.user,
        AccountNo: AccountNo,
        TrPin1: TrPin1,
        OTP: otp,
      });
    } else {
      res.redirect("/login");
    }
  });
 };
 authenticate();
});

app.post("/transferCm/OtpCheck/:user", (req, res) => {
  if (req.body.enteredOtp == req.body.originalOtp) {
    let pin = encryptText(req.body.TrPin1)
  const authenticate = async()=>{ 
    await Customer.updateOne({ AccountNo: req.body.accountNo }, { transferPIN: pin, istransfromOpen: "yes" }, (err) => {
      if (err) {
        console.log(err);
        res.redirect("/login");
      } else {
        let sucessUrl = "/transferCm/PinUpdated/" + req.params.user + "/sucessfully";
        res.redirect(sucessUrl);
      }
    });
  };
  authenticate();
  } else {
    let failUrl = "/tab/customer/" + req.params.user + "/moneytransfer/tryagain";
    res.redirect(failUrl);
  }
});

app.get("/tab/customer/:urlUser/moneytransfer/tryagain", (req, res) => {
  const derequestedAccountNo = decryptText(req.params.urlUser);
 const authenticate = async()=>{
  await Customer.findOne({ AccountNo: derequestedAccountNo }, (err, user) => {
    const requestedAccountNo = req.params.urlUser;
      res.render("pinCreate", {
        user: requestedAccountNo,
        derequestedAccountNo: derequestedAccountNo,
        wrongOtp: "yes",
        createPin: "yex",
        updatePin: " "
      })
  });
};
authenticate();
});

app.get("/transferCm/PinUpdated/:user/sucessfully", (req, res) => {
    let reqUrl = "/tab/customer/" + req.params.user + "/moneytransfer"
    res.render("sucessMsg", {
      backUrl: reqUrl
    });
});


app.post("/searchCm/transferCm", (req, res) => {
  const authenticate = async()=>{
  await Customer.findOne({ AccountNo: req.body.getCt }, (err, user) => {
    if (user) {
      let requestedUrl = "/transfer/" + encryptText(req.body.getC) + "/" + req.body.sendC + "/send";
      res.redirect(requestedUrl);
    } else {
      let requestedUrl = "/tab/customer/" + req.body.sendC + "/moneytransfer/tryagain";
      res.redirect(requestedUrl);
    }
  });
  };
  authenticate();
});

app.get("/tab/customer/:urlUser/moneytransfer/tryagain", (req, res) => {
  const requestedAccountNo = req.params.urlUser;
    res.render("moneyTransfer", {
      user: requestedAccountNo,
      customerGet: "no",
    })
});



app.get("/transfer/:urlAccG/:urlAccS/send", (req, res) => {
  const derequestedAccountNoG = decryptText(req.params.urlAccG);
  const enrequestedAccountNo = req.params.urlAccS;
  const derequestedAccountNo = decryptText(req.params.urlAccS);
   const authenticate = async()=>{
    await Customer.findOne({ AccountNo: derequestedAccountNoG }, (err, user) => {
      if (err) {
        res.redirect("/login");
      } else {
       const authenticate = async()=>{
        await Customer.findOne({ AccountNo: derequestedAccountNo }, (err, userk) => {
          if (!err) {
            res.render("moneySent", {
              user: enrequestedAccountNo,
              customer: user,
              customerk: userk
            })
          }
        });
       };
       authenticate();
      }
    });
   };
   authenticate();
});

app.post("/transfer/finalsend", (req, res) => {
  //money cut from sender
  const deAccountNos = decryptText(req.body.senderAcc)
const authenticate = async()=>{
  await Customer.findOne({ AccountNo: deAccountNos }, (err, user) => {
    dePin = decryptText(user.transferPIN);
    if (dePin == req.body.pin) {
      if (!err) {
        if (req.body.withdeawalFrom === "Loan") {
          let currentAmountLoan = parseInt(req.body.LoanAmount) - parseInt(req.body.geteram);
          let withdrawalFromLoan = parseInt(req.body.totalLoanAmountWithdrawal) + parseInt(req.body.geteram);
          if (currentAmountLoan >= 0) {
           const authenticate = async()=>{
            await Customer.findOneAndUpdate(
              { "AccountNo": deAccountNos, "loanAplicationEntery._id": req.body.LoanAmountID },
              {
                "$set": {
                  "loanAplicationEntery.$.totalAmountFromLoan": currentAmountLoan,
                  "loanAplicationEntery.$.totalAmountWithdrawal": withdrawalFromLoan
                }
              },
              function (err, doc) {
                if (err) {
                  console.log(err);
                } else {
                  let day = getOnlyDate();
                  let dayNumberk = dayNumber(day);
                  const withdrawal = new Transaction({
                    transactionTypeMoney: "BoB's Online  Banking",
                    transactionAmount: parseInt(req.body.geteram),
                    totalAmount: currentAmountLoan,
                    transactionTime: getDate(),
                    transactionBranch: "Online Banking",
                    transactiontype: "withdrawal Loan",
                    dayNumber: dayNumberk,
                    BankerId: "By Own"
                  });
                const authenticate = async()=>{
                  await Customer.findOne({ AccountNo: deAccountNos }, (err, foundCustomer) => {
                    if (!err) {
                      foundCustomer.transactionEnterys.push(withdrawal);
                      foundCustomer.save((err) => {
                        if (err) {
                          let failUrl = "/BoB'sAcctoAccTranstion/fail/" + req.body.senderAcc;
                          res.redirect(failUrl);
                        } else {
                          let mailSubject = "Online Money Transfer BRB Bank";
                          let mailBody = "withdrawal for online noney transfer from loan amount";
                          mailGo.sendMail(foundCustomer.email, parseInt(req.body.geteram), mailBody, currentAmountLoan, mailSubject)
                          .then((posts)=>{
                            console.log("sucess");
                             })
                          .catch((err)=>{
                            console.log(err);
                          })  
                          // money added in geter's acc
                         const authenticate = async()=>{
                          await Customer.findOne({ AccountNo: req.body.geterAcc }, (err, user) => {
                            if (!err) {
                              let currentTotalAmountk = parseInt(user.currentTotalAmount) + parseInt(req.body.geteram);
                             const authenticate =  async()=>{
                              await Customer.updateOne({ AccountNo: req.body.geterAcc }, { currentTotalAmount: currentTotalAmountk }, (err) => {
                                if (!err) {
                                  let day = getOnlyDate();
                                  let dayNumberk = dayNumber(day);
                                  const withdrawal = new Transaction({
                                    transactionTypeMoney: "BoB's Online  Banking",
                                    transactionAmount: parseInt(req.body.geteram),
                                    totalAmount: currentTotalAmountk,
                                    transactionTime: getDate(),
                                    transactionBranch: "Online Banking",
                                    transactiontype: "Deposit",
                                    dayNumber: dayNumberk,
                                    BankerId: "By Own"
                                  });
                                const authenticate = async()=>{
                                  await Customer.findOne({ AccountNo: req.body.geterAcc }, (err, foundCustomer) => {
                                    if (!err) {
                                      foundCustomer.transactionEnterys.push(withdrawal);
                                      foundCustomer.save((err) => {
                                        if (err) {
                                          let failUrl = "/BoB'sAcctoAccTranstion/fail/" + req.body.senderAcc;
                                          res.redirect(failUrl);
                                        } else {
                                          let mailSubject = "Online Money Transfer BRB Bank";
                                          let mailBody = "diposit by online money transfer ";
                                          mailGo.sendMail(foundCustomer.email, parseInt(req.body.geteram), mailBody, currentTotalAmountk, mailSubject)
                                          .then((posts)=>{
                                            console.log("sucess");
                                             })
                                          .catch((err)=>{
                                            console.log(err);
                                          })  
                                          let sucessUrl = "/BoB'sAcctoAccTranstion/sucess/" + req.body.senderAcc;
                                          res.redirect(sucessUrl);
                                        }
                                      });
                                    } else {
                                      let failUrl = "/BoB'sAcctoAccTranstion/fail/" + req.body.senderAcc;
                                      res.redirect(failUrl);
                                    }
                                  });
                                };
                                authenticate();
                                }
                              });
                            };
                            authenticate();
                            }
                          });
                        };
                        authenticate();
                        }
                      });
                    } else {
                      let failUrl = "/BoB'sAcctoAccTranstion/fail/" + req.body.senderAcc;
                      res.redirect(failUrl);
                    }
                  });
                };
                authenticate();
                }
              }
            );
            };
            authenticate();
          } else {
            let failUrl = "/BoB'sAcctoAccTranstion/fail/" + req.body.senderAcc;
            res.redirect(failUrl);
          }
        } else {
          let currentTotalAmount = parseInt(user.currentTotalAmount) - parseInt(req.body.geteram);
          let transtionam = parseInt(req.body.geteram);
          if (currentTotalAmount >= 500) {
          const authenticate = async()=>{ 
            await Customer.updateOne({ AccountNo: deAccountNos }, { currentTotalAmount: currentTotalAmount }, (err) => {
              if (!err) {
                let day = getOnlyDate();
                let dayNumberk = dayNumber(day);
                const withdrawal = new Transaction({
                  transactionTypeMoney: "BoB's Online  Banking",
                  transactionAmount: transtionam,
                  totalAmount: currentTotalAmount,
                  transactionTime: getDate(),
                  transactionBranch: "Online Banking",
                  transactiontype: "withdrawal",
                  dayNumber: dayNumberk,
                  BankerId: "By Own"
                });
              const authenticate = async()=>{
                await Customer.findOne({ AccountNo: deAccountNos }, (err, foundCustomer) => {
                  if (!err) {
                    foundCustomer.transactionEnterys.push(withdrawal);
                    foundCustomer.save((err) => {
                      if (err) {
                        let failUrl = "/BoB'sAcctoAccTranstion/fail/" + req.body.senderAcc;
                        res.redirect(failUrl);
                      } else {
                        let mailSubject = "Online Money Transfer BRB Bank";
                        let mailBody = "withdrawal for online money transfer";
                        mailGo.sendMail(foundCustomer.email, transtionam, mailBody, currentTotalAmount, mailSubject)
                        .then((posts)=>{
                          console.log("sucess");
                           })
                        .catch((err)=>{
                          console.log(err);
                        })  
                        // money added in geter's acc
                      const authenticate = async ()=>{
                        await Customer.findOne({ AccountNo: req.body.geterAcc }, (err, user) => {
                          if (!err) {
                            let currentTotalAmountk = parseInt(user.currentTotalAmount) + parseInt(req.body.geteram);
                            let transtionamk = parseInt(req.body.geteram);

                          const authenticate = async()=>{
                            await Customer.updateOne({ AccountNo: req.body.geterAcc }, { currentTotalAmount: currentTotalAmountk }, (err) => {
                              if (!err) {
                                let day = getOnlyDate();
                                let dayNumberk = dayNumber(day);

                                const withdrawal = new Transaction({
                                  transactionTypeMoney: "BoB's Online  Banking",
                                  transactionAmount: transtionamk,
                                  totalAmount: currentTotalAmountk,
                                  transactionTime: getDate(),
                                  transactionBranch: "Online Banking",
                                  transactiontype: "Deposit",
                                  dayNumber: dayNumberk,
                                  BankerId: "By Own"
                                });
                                const authenticate = async ()=>{
                                await Customer.findOne({ AccountNo: req.body.geterAcc }, (err, foundCustomer) => {
                                  if (!err) {
                                    foundCustomer.transactionEnterys.push(withdrawal);
                                    foundCustomer.save((err) => {
                                      if (err) {
                                        let failUrl = "/BoB'sAcctoAccTranstion/fail/" + req.body.senderAcc;
                                        res.redirect(failUrl);
                                      } else {
                                        let mailSubject = "Online Money Transfer BRB Bank";
                                        let mailBody = "diposit by online money transfer ";
                                        mailGo.sendMail(foundCustomer.email, transtionamk, mailBody, currentTotalAmountk, mailSubject)
                                        .then((posts)=>{
                                          console.log("sucess");
                                           })
                                        .catch((err)=>{
                                          console.log(err);
                                        })  
                                        let sucessUrl = "/BoB'sAcctoAccTranstion/sucess/" + req.body.senderAcc;
                                        res.redirect(sucessUrl);
                                      }
                                    });
                                  } else {
                                    let failUrl = "/BoB'sAcctoAccTranstion/fail/" + req.body.senderAcc;
                                    res.redirect(failUrl);
                                  }
                                });
                              };
                              authenticate();
                              }
                            });
                          };
                          authenticate();
                          }
                        });
                      };
                      authenticate();
                      }
                    });
                  } else {
                    let failUrl = "/BoB'sAcctoAccTranstion/fail/" + req.body.senderAcc;
                    res.redirect(failUrl);
                  }
                });
              };
              authenticate();
              }
            });
          };
          authenticate();
          } else {
            let failUrl = "/BoB'sAcctoAccTranstion/fail/" + req.body.senderAcc;
            res.redirect(failUrl);
          }
        }
      }
    } else {
      //wrong Pin 
      let failUrl = "/BoB'sAcctoAccTranstion/pinnotmatch/" + req.body.senderAcc;
      res.redirect(failUrl);
    }
  });
};
authenticate();
});

//wrong password
app.get("/BoB'sAcctoAccTranstion/pinnotmatch/:senderAcc", (req, res) => {
  const requestedAccountNo = req.params.senderAcc;
    let reqUrl = "/tab/customer/" + requestedAccountNo + "/moneytransfer";
    res.render("wrongPin", {
      backUrl: reqUrl
    });
});

//sucess
app.get("/BoB'sAcctoAccTranstion/sucess/:senderAcc", (req, res) => {
  const requestedAccountNo = req.params.senderAcc;
    let reqUrl = "/tab/customer/" + requestedAccountNo + "/home"
    res.render("sucessMsg", {
      backUrl: reqUrl
    });
});

//fail
app.get("/BoB'sAcctoAccTranstion/fail/:senderAcc", (req, res) => {
  const requestedAccountNo = req.params.senderAcc;
    let reqUrl = "/tab/customer/" + requestedAccountNo + "/moneytransfer"
    res.render("fail", {
      backUrl: reqUrl
    });
});

//Fixed Diposit
app.get("/tab/customer/:urlUser/fd", (req, res) => {
  const enrequestedAccountNo = req.params.urlUser;
  const derequestedAccountNo = decryptText(req.params.urlUser);
  const authenticate = async ()=>{
    await Customer.findOne({ AccountNo: derequestedAccountNo }, (err, user) => {
      if (err) {
        res.redirect("/login");
      } else {
        res.render("fixedDipositCustomer", {
          user: enrequestedAccountNo,
          customer: user
        });
      }
    });
  };
  authenticate();
});

app.post("/fixedDiposit/request/:userAcc", (req, res) => {
  const Fixed = new FixedCSDeposit({
    primeAmount: req.body.fixedAmount,
    TotalAmount: req.body.activeAmount,
    duration: req.body.duration,
    Datego: getDate(),
    accountNo: req.body.accountNo
  })
  const authenticate = async()=>{
  await Fixed.save((err) => {
    if (!err) {
      let Urlrequsted = "/FdRequestSend/sucess/" + encryptText(req.body.accountNo);
      res.redirect(Urlrequsted);
    } else {
      let Urlrequsted = "/FdRequestSend/fail/" + encryptText(req.body.accountNo);
      res.redirect(Urlrequsted);
    }
  })
 };
 authenticate();
});

//sucess
app.get("/FdRequestSend/sucess/:senderAcc", (req, res) => {
  const requestedAccountNo = req.params.senderAcc;
    let reqUrl = "/tab/customer/" + requestedAccountNo + "/home"
    res.render("sucessMsg", {
      backUrl: reqUrl
    });
});
//fail
app.get("/FdRequestSend/fail/:senderAcc", (req, res) => {
  const requestedAccountNo = req.params.senderAcc;
    let reqUrl = "/tab/customer/" + requestedAccountNo + "/fd"
    res.render("fail", {
      backUrl: reqUrl
    });
});

//loan aplication
app.get("/tab/customer/:urlUser/loanaplication", (req, res) => {
  const enrequestedAccountNo = req.params.urlUser;
  const derequestedAccountNo = decryptText(req.params.urlUser);
  const authenticate = async()=>{
    await Customer.findOne({ AccountNo: derequestedAccountNo }, (err, user) => {
      if (err) {
        res.redirect("/login");
      } else {
        res.render("loanApplication", {
          customer: user,
          user: enrequestedAccountNo
        })
      }
    });
  };
  authenticate();
});

app.post("/loanApplication/:urlUser/applied", (req, res) => {
  const enrequestedAccountNo = req.params.urlUser;
  const derequestedAccountNo = decryptText(req.params.urlUser);
  const loanApplication = new LoanAplicationCS({
    AccountNo: derequestedAccountNo,
    monthlyIncome: req.body.monthlyIncome,
    loanAmount: req.body.loanAmount,
    creditScore: req.body.creditScore,
    FamilyIncome: req.body.FamilyIncome,
    loanPeriod: req.body.loanPeriod,
    loanType: req.body.loanType,
    loanNominee: req.body.loanNominee,
    dateOfApplication: getDate(),
    Purpose: req.body.Purpose
  });
 const authenticate = async()=>{
  await loanApplication.save((err) => {
    if (err) {
      let goUrl = "/loanApplicationCS/fail/" + enrequestedAccountNo;
      res.redirect(goUrl);
    } else {
     const authenticate = async()=>{
      await Customer.findOne({ AccountNo: derequestedAccountNo }, (err, user) => {
        if (!err) {
          appl = "Rs. " + req.body.loanAmount + " loan "
          mailGo.sendMailapply(user.email, appl)
          .then((posts)=>{
            console.log("sucess");
             })
          .catch((err)=>{
            console.log(err);
          })  
        }
      });
     };
     authenticate();
      let goUrl = "/loanApplicationCS/sucess/" + enrequestedAccountNo;
      res.redirect(goUrl);
    }
  });
 };
 authenticate();
});

//sucess
app.get("/loanApplicationCS/sucess/:senderAcc", (req, res) => {
  const requestedAccountNo = req.params.senderAcc;
    let reqUrl = "/tab/customer/" + requestedAccountNo + "/home"
    res.render("sucessMsg", {
      backUrl: reqUrl
    });
});

//fail
app.get("/loanApplicationCS/fail/:senderAcc", (req, res) => {
  const requestedAccountNo = req.params.senderAcc;
    let reqUrl = "/tab/customer/" + requestedAccountNo + "/loanaplication"
    res.render("fail", {
      backUrl: reqUrl
    });
});

//customerEMI
app.get("/tab/customer/:user/loanemi", (req, res) => {
  const enrequestedAccountNo = req.params.user;
  const derequestedAccountNo = decryptText(req.params.user);
   const authenticate = async()=>{
    await Customer.findOne({ AccountNo: derequestedAccountNo }, (err, user) => {
      if (err) {
        res.redirect("/login");
      } else {
        if (user.loanAplicationEntery[0]) {
          let day1 = user.loanAplicationEntery[0].dateToCalculateIntarest;
          let day2 = getOnlyDate();
          let dayDif = DaysBitweentwoDays(day1, day2);
          dayDif = parseInt(dayDif);
          let intarestRate = user.loanAplicationEntery[0].loanIntarestRate;
          let totalWithdrawalAmount = parseInt(user.loanAplicationEntery[0].totalAmountWithdrawal);

          let r = intarestRate / 100;
          let RbyN = (r / 12) + 1;
          let t = dayDif / 365;
          let TintoN = t * 12;
          let powerget = (RbyN ** TintoN)
          let totalAmountwithIntarest = totalWithdrawalAmount * powerget;
          let intarestNow = totalAmountwithIntarest - totalWithdrawalAmount;

          let emi1t, emi2t, emi3t, emi4t, emi5t, emi6t, emi7t, emi8t, emi9t, emi10t, emi11t, emi12t, emi13t, emi14t;
          let ints1t, ints2t, ints3t, ints4t, ints5t, ints6t, ints7t, ints8t, ints9t, ints10t, ints11t, ints12t, ints13t, ints14t;

          emi1t = IntarestWithPeriod(totalAmountwithIntarest, r, 0.5) / 6;
          emi2t = IntarestWithPeriod(totalAmountwithIntarest, r, 1) / 12;
          emi3t = IntarestWithPeriod(totalAmountwithIntarest, r, 1.5) / 18;
          emi4t = IntarestWithPeriod(totalAmountwithIntarest, r, 2) / 24;
          emi5t = IntarestWithPeriod(totalAmountwithIntarest, r, 2.5) / 30;
          emi6t = IntarestWithPeriod(totalAmountwithIntarest, r, 3) / 36;
          emi7t = IntarestWithPeriod(totalAmountwithIntarest, r, 3.5) / 42;
          emi8t = IntarestWithPeriod(totalAmountwithIntarest, r, 4) / 48;
          emi9t = IntarestWithPeriod(totalAmountwithIntarest, r, 4.5) / 54;
          emi10t = IntarestWithPeriod(totalAmountwithIntarest, r, 5) / 60;
          emi11t = IntarestWithPeriod(totalAmountwithIntarest, r, 5.5) / 66;
          emi12t = IntarestWithPeriod(totalAmountwithIntarest, r, 6) / 72;
          emi13t = IntarestWithPeriod(totalAmountwithIntarest, r, 6.5) / 78;
          emi14t = IntarestWithPeriod(totalAmountwithIntarest, r, 7) / 84;

          ints1t = IntarestWithPeriod(totalAmountwithIntarest, r, 0.5) - totalWithdrawalAmount;
          ints2t = IntarestWithPeriod(totalAmountwithIntarest, r, 1) - totalWithdrawalAmount;
          ints3t = IntarestWithPeriod(totalAmountwithIntarest, r, 1.5) - totalWithdrawalAmount;
          ints4t = IntarestWithPeriod(totalAmountwithIntarest, r, 2) - totalWithdrawalAmount;
          ints5t = IntarestWithPeriod(totalAmountwithIntarest, r, 2.5) - totalWithdrawalAmount;
          ints6t = IntarestWithPeriod(totalAmountwithIntarest, r, 3) - totalWithdrawalAmount;
          ints7t = IntarestWithPeriod(totalAmountwithIntarest, r, 3.5) - totalWithdrawalAmount;
          ints8t = IntarestWithPeriod(totalAmountwithIntarest, r, 4) - totalWithdrawalAmount;
          ints9t = IntarestWithPeriod(totalAmountwithIntarest, r, 4.5) - totalWithdrawalAmount;
          ints10t = IntarestWithPeriod(totalAmountwithIntarest, r, 5) - totalWithdrawalAmount;
          ints11t = IntarestWithPeriod(totalAmountwithIntarest, r, 5.5) - totalWithdrawalAmount;
          ints12t = IntarestWithPeriod(totalAmountwithIntarest, r, 6) - totalWithdrawalAmount;
          ints13t = IntarestWithPeriod(totalAmountwithIntarest, r, 6.5) - totalWithdrawalAmount;
          ints14t = IntarestWithPeriod(totalAmountwithIntarest, r, 7) - totalWithdrawalAmount;

          res.render("paybackLoan", {
            customer: user,
            user: enrequestedAccountNo,
            emi1t: parseInt(emi1t),
            emi2t: parseInt(emi2t),
            emi3t: parseInt(emi3t),
            emi4t: parseInt(emi4t),
            emi5t: parseInt(emi5t),
            emi6t: parseInt(emi6t),
            emi7t: parseInt(emi7t),
            emi8t: parseInt(emi8t),
            emi9t: parseInt(emi9t),
            emi10t: parseInt(emi10t),
            emi11t: parseInt(emi11t),
            emi12t: parseInt(emi12t),
            emi13t: parseInt(emi13t),
            emi14t: parseInt(emi14t),
            ints1t: ints1t,
            ints2t: ints2t,
            ints3t: ints3t,
            ints4t: ints4t,
            ints5t: ints5t,
            ints6t: ints6t,
            ints7t: ints7t,
            ints8t: ints8t,
            ints9t: ints9t,
            ints10t: ints10t,
            ints11t: ints11t,
            ints12t: ints12t,
            ints13t: ints13t,
            ints14t: ints14t,
            totalWithdrawalAmount: parseInt(totalWithdrawalAmount),
            intarestNow: parseInt(intarestNow),
            totalAmountwithIntarest: parseInt(totalAmountwithIntarest)
          })
        } else {
          res.render("paybackLoan", {
            customer: user,
            user: enrequestedAccountNo,
          });
        }
      }
    });
  };
  authenticate();
});

app.post('/loan/Onepayment/:user/apply', (req, res) => {
  const enrequestedAccountNo = req.params.user;
  const derequestedAccountNo = decryptText(req.params.user);
  let currentTotalAmount = parseInt(req.body.TotalAmount) - parseInt(req.body.totalAmountwithIntarest);
  let haveToPayK = parseInt(req.body.totalAmountwithIntarest);
  let haveToPay = parseInt(req.body.haveToPay);
  if (currentTotalAmount >= 500 && haveToPay === haveToPayK) {
   const authenticate = async()=>{
    await Customer.updateOne({ AccountNo: derequestedAccountNo }, { currentTotalAmount: currentTotalAmount }, (err) => {
      if (!err) {
        let day = getOnlyDate();
        let dayNumberk = dayNumber(day);
        const withdrawal = new Transaction({
          transactionTypeMoney: "Cut to Clear The Full Loan Amount",
          transactionAmount: parseInt(req.body.totalAmountwithIntarest),
          totalAmount: currentTotalAmount,
          transactionTime: getDate(),
          transactionBranch: "Online Banking",
          transactiontype: "withdrawal",
          dayNumber: dayNumberk,
          BankerId: "By One"
        });
       const authenticate = async()=>{
        await Customer.findOne({ AccountNo: derequestedAccountNo }, (err, foundCustomer) => {
          if (!err) {
            foundCustomer.transactionEnterys.push(withdrawal);
            foundCustomer.save((err) => {
              if (err) {
                let failUrl = "/LoanPayment/fail/" + enrequestedAccountNo;
                res.redirect(failUrl);
              } else {
                const authenticate = async()=>{
                await Customer.findOneAndUpdate({ AccountNo: derequestedAccountNo },
                  { $pull: { loanAplicationEntery: { _id: req.body.loanId } } }, (err, customer) => {
                    if (!err) {
                      let mailBody = "withdrwan for Loan clearance";
                      let mailSubject = "Loan clearance BRB Bank";
                      mailGo.sendMail(foundCustomer.email, parseInt(req.body.totalAmountwithIntarest), mailBody, currentTotalAmount, mailSubject)
                      .then((posts)=>{
                        console.log("sucess");
                         })
                      .catch((err)=>{
                        console.log(err);
                      })  
                      let sucessUrl = "/LoanPayment/sucess/" + enrequestedAccountNo;
                      res.redirect(sucessUrl);
                    }
                  })
                };
                authenticate();
              }
            });
          } else {
            let failUrl = "/LoanPayment/fail/" + enrequestedAccountNo;
            res.redirect(failUrl);
          }
        });
      };
      authenticate();
      }
    });
  };
  authenticate();
  } else {
    let failUrl = "/LoanPayment/fail/" + enrequestedAccountNo;
    res.redirect(failUrl);
  }
});

app.post("/loan/paybackPrimeAmountorIntarest/:user/apply", (req, res) => {
  const enrequestedAccountNo = req.params.user;
  const derequestedAccountNo = decryptText(req.params.user);
  let currentTotalAmount = parseInt(req.body.TotalAmount) - parseInt(req.body.primeAmount)
  if (currentTotalAmount >= 500) {
   const authenticate = async()=>{
    await Customer.updateOne({ AccountNo: derequestedAccountNo }, { currentTotalAmount: currentTotalAmount }, (err) => {
      if (!err) {
        let day = getOnlyDate();
        let dayNumberk = dayNumber(day);
        const withdrawal = new Transaction({
          transactionTypeMoney: "Cut to Reduce The Loan Amount",
          transactionAmount: parseInt(req.body.primeAmount),
          totalAmount: currentTotalAmount,
          transactionTime: getDate(),
          transactionBranch: "Online Banking",
          transactiontype: "withdrawal",
          dayNumber: dayNumberk,
          BankerId: "By Own"
        });
       const authenticate = async()=>{
        await Customer.findOne({ AccountNo: derequestedAccountNo }, (err, foundCustomer) => {
          if (!err) {
            foundCustomer.transactionEnterys.push(withdrawal);
            foundCustomer.save((err) => {
              if (err) {
                let failUrl = "/LoanPayment/fail/" + enrequestedAccountNo;
                res.redirect(failUrl);
              } else {
                let day1 = foundCustomer.loanAplicationEntery[0].dateToCalculateIntarest;
                let day2 = getOnlyDate();
                let dayDif = DaysBitweentwoDays(day1, day2);
                dayDif = parseInt(dayDif);
                let intarestRate = foundCustomer.loanAplicationEntery[0].loanIntarestRate;
                let totalWithdrawalAmount = parseInt(foundCustomer.loanAplicationEntery[0].totalAmountWithdrawal);
                let r = intarestRate / 100;
                let RbyN = (r / 12) + 1;
                let t = dayDif / 365;
                let TintoN = t * 12;
                let powerget = (RbyN ** TintoN)
                let totalAmountwithIntarest = totalWithdrawalAmount * powerget;
                let withdrawalFromLoan = totalAmountwithIntarest - parseInt(req.body.primeAmount)
               const authenticate = async()=>{
                await Customer.findOneAndUpdate(
                  { "AccountNo": derequestedAccountNo, "loanAplicationEntery._id": req.body.loanId },
                  {
                    "$set": {
                      "loanAplicationEntery.$.totalAmountWithdrawal": withdrawalFromLoan,
                      "loanAplicationEntery.$.dateToCalculateIntarest": getOnlyDate()
                    }
                  },
                  function (err, doc) {
                    if (err) {
                      console.log(err);
                    } else {
                      let mailSubject = "withdrwan for Loan BRB Bank";
                      let mailBody = "for reduce loan amount";
                      mailGo.sendMail(foundCustomer.email, parseInt(req.body.primeAmount), mailBody, currentTotalAmount, mailSubject)
                      .then((posts)=>{
                        console.log("sucess");
                         })
                      .catch((err)=>{
                        console.log(err);
                      })  
                      let sucessUrl = "/LoanPayment/sucess/" + enrequestedAccountNo;
                      res.redirect(sucessUrl);
                    }
                  }
                );
                };
                authenticate();
              }
            });
          } else {
            let failUrl = "/LoanPayment/fail/" + enrequestedAccountNo;
            res.redirect(failUrl);
          }
        });
      };
      authenticate();
      }
    });
  };
  authenticate();
  } else {
    let failUrl = "/LoanPayment/fail/" + enrequestedAccountNo;
    res.redirect(failUrl);
  }
});

//sucess 
app.get("/LoanPayment/sucess/:AccountNo", (req, res) => {
  const requestedAccountNo = req.params.AccountNo;
    let reqUrl = "/tab/customer/" + requestedAccountNo + "/home"
    res.render("sucessMsg", {
      backUrl: reqUrl
    });
});
//fail
app.get("/LoanPayment/fail/:AccountNo", (req, res) => {
  const requestedAccountNo = req.params.AccountNo;
    let reqUrl = "/tab/customer/" + requestedAccountNo + "/loanemi"
    res.render("fail", {
      backUrl: reqUrl
    });
});

app.post("/loan/EMIentry/:urlUser/apply", (req, res) => {
  const enrequestedAccountNo = req.params.urlUser;
  const derequestedAccountNo = decryptText(req.params.urlUser);
  const EMIApplication = new LoanEmiCS({
    branchName: req.body.branchName,
    loanAccountNumber: derequestedAccountNo,
    loanPlanCode: req.body.loanPlanCode,
    loanPaymentMode: req.body.noInstallments,
    noInstallments: req.body.noInstallments,
    loanEmiAmount: req.body.loanEmiAmount,
    applyDate: getDate(),
    loanAdvisorName: req.body.loanAdvisorName,
    Narration: req.body.loanNarration
  });

 const authenticate = async()=>{
  await EMIApplication.save((err) => {
    if (err) {
      let goUrl = "/loanEMIApplicationCS/fail/" + enrequestedAccountNo;
      res.redirect(goUrl);
    } else {
     const authenticate = async ()=>{
      await Customer.findOne({ AccountNo: derequestedAccountNo }, (err, user) => {
        if (!err) {
          appl = "Rs. " + req.body.loanEmiAmount + "/month for " + req.body.noInstallments + "month EMI";
          mailGo.sendMailapply(user.email, appl)
          .then((posts)=>{
            console.log("sucess");
             })
          .catch((err)=>{
            console.log(err);
          })  
        }
      });
    };
    authenticate();
      let goUrl = "/loanEMIApplicationCS/sucess/" + enrequestedAccountNo;
      res.redirect(goUrl);
    }
  });
};
authenticate();
});

//sucess 
app.get("/loanEMIApplicationCS/sucess/:requestedAccountNo", (req, res) => {
  const requestedAccountNo = req.params.requestedAccountNo;
    let reqUrl = "/tab/customer/" + requestedAccountNo + "/home"
    res.render("sucessMsg", {
      backUrl: reqUrl
    });
});

//fail
app.get("/loanEMIApplicationCS/fail/:requestedAccountNo", (req, res) => {
  const requestedAccountNo = req.params.requestedAccountNo;
    let reqUrl = "/tab/customer/" + requestedAccountNo + "/loanemi"
    res.render("fail", {
      backUrl: reqUrl
    });
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3500;
}
app.listen(port, () => {
  console.log("server running on port 3500");
});

