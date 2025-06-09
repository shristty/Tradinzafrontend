require("dotenv").config();
let express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const PORT = process.env.PORT || 3002;
const uri = process.env.MONGO_URL;
const { HoldingsModel } = require("./model/HoldingsModel");
const { PositionsModel } = require("./model/PositionsModel");
const { OrdersModel } = require("./model/OrdersModel");
const bodyParser = require("body-parser");
const cors = require("cors");

const userModel = require("./model/userModel");


let app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json()); //Converts JSON request bodies into JavaScript objects.
app.use(express.urlencoded({ extended: true })); //Parses Form Data: Converts URL-encoded data into a JavaScript object.
app.use(cookieParser()); //Parses the Cookie header and stores values in req.cookies.


app.post("/signup", async (req, res) => {
  try {
    let { name, email, password } = req.body;
    let user = await userModel.findOne({ name: name });
    
    if (user) {
      return res.status(400).json({ message: "sorry user exist with same name" }); } 

    else {
      let salt = await bcrypt.genSalt(10);
      let hash = await bcrypt.hash(password, salt); //yha hmara pw dale to hash m convert ho gya
      let newUser = new userModel({
        name: name,
        email: email,
        password: hash,
      });
      
      await newUser.save();

      let token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET_KEY, {expiresIn: "1h"});
    
   res.cookie("token", token, {
   httpOnly: true,
   maxAge: 7 * 24 * 60 * 60 * 1000, 
 });
      res.json({ token });
    }
  } catch (e) {
    console.error("signup error", e.message);
    res.status(500).send("server error");
  }
});




app.post("/login", async (req, res) => {
  let { email, password } = req.body;

  let requser = await userModel.findOne({ email: email });
  if (!requser) {
  
    res.status(400).json({ message: "invalid credentials" });
  }

  const isMatch = await bcrypt.compare(req.body.password, requser.password);
  if (isMatch) {
    
    try {
      
      let token = jwt.sign({ id: requser._id }, process.env.JWT_SECRET_KEY, {
        expiresIn: "7d",
      });
      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, 
      });
      console.log("cookie is", token);
      res.json({ token, userId: requser._id });
    } catch (e) {
      console.error("error during login", e.message);
      res.status(500).send("login error");
    }
  } else {
    
    res.status(400).json({ message: "invalid credentials" });
  }


});



// app.get("/addHoldings",async (req,res)=>{
// let tempHoldings = [
//     {
//       name: "BHARTIARTL",
//       qty: 2,
//       avg: 538.05,
//       price: 541.15,
//       net: "+0.58%",
//       day: "+2.99%",
//     },
//     {
//       name: "HDFCBANK",
//       qty: 2,
//       avg: 1383.4,
//       price: 1522.35,
//       net: "+10.04%",
//       day: "+0.11%",
//     },
//     {
//       name: "HINDUNILVR",
//       qty: 1,
//       avg: 2335.85,
//       price: 2417.4,
//       net: "+3.49%",
//       day: "+0.21%",
//     },
//     {
//       name: "INFY",
//       qty: 1,
//       avg: 1350.5,
//       price: 1555.45,
//       net: "+15.18%",
//       day: "-1.60%",
//       isLoss: true,
//     },
//     {
//       name: "ITC",
//       qty: 5,
//       avg: 202.0,
//       price: 207.9,
//       net: "+2.92%",
//       day: "+0.80%",
//     },
//     {
//       name: "KPITTECH",
//       qty: 5,
//       avg: 250.3,
//       price: 266.45,
//       net: "+6.45%",
//       day: "+3.54%",
//     },
//     {
//       name: "M&M",
//       qty: 2,
//       avg: 809.9,
//       price: 779.8,
//       net: "-3.72%",
//       day: "-0.01%",
//       isLoss: true,
//     },
//     {
//       name: "RELIANCE",
//       qty: 1,
//       avg: 2193.7,
//       price: 2112.4,
//       net: "-3.71%",
//       day: "+1.44%",
//     },
//     {
//       name: "SBIN",
//       qty: 4,
//       avg: 324.35,
//       price: 430.2,
//       net: "+32.63%",
//       day: "-0.34%",
//       isLoss: true,
//     },
//     {
//       name: "SGBMAY29",
//       qty: 2,
//       avg: 4727.0,
//       price: 4719.0,
//       net: "-0.17%",
//       day: "+0.15%",
//     },
//     {
//       name: "TATAPOWER",
//       qty: 5,
//       avg: 104.2,
//       price: 124.15,
//       net: "+19.15%",
//       day: "-0.24%",
//       isLoss: true,
//     },
//     {
//       name: "TCS",
//       qty: 1,
//       avg: 3041.7,
//       price: 3194.8,
//       net: "+5.03%",
//       day: "-0.25%",
//       isLoss: true,
//     },
//     {
//       name: "WIPRO",
//       qty: 4,
//       avg: 489.3,
//       price: 577.75,
//       net: "+18.08%",
//       day: "+0.32%",
//     },
//   ];

//   tempHoldings.forEach(async(item)=>{
// let newHolding = new HoldingsModel({
//     name: item.name,
//       qty: item.qty,
//       avg: item.avg,
//       price: item.price,
//       net: item.net,
//       day: item.day,
// });

// await newHolding.save()
//   });

// res.send("Done");

// });

// app.get("/addPositions",async (req,res)=>{
// let tempPositions = [
//     {
//       product: "CNC",
//       name: "EVEREADY",
//       qty: 2,
//       avg: 316.27,
//       price: 312.35,
//       net: "+0.58%",
//       day: "-1.24%",
//       isLoss: true,
//     },
//     {
//       product: "CNC",
//       name: "JUBLFOOD",
//       qty: 1,
//       avg: 3124.75,
//       price: 3082.65,
//       net: "+10.04%",
//       day: "-1.35%",
//       isLoss: true,
//     },
//   ];

//   tempPositions.forEach(async (item)=>{

// let newPosition = new PositionsModel(
//     {
//         product: item.product,
//       name: item.name,
//       qty: item.qty,
//       avg: item.avg,
//       price: item.price,
//       net: item.net,
//       day: item.day,
//       isLoss: item.isLoss,
//     });

// await newPosition.save();
//   });

//   res.send("yeah");
// });

// app.post("/signup",async(req,res)=>{

//             const  {email,name,password} =req.body;
//       const newUser = new userModel({email,name,password});
//   const registeredUser=  await userModel.register(newUser,password);
//   console.log(registeredUser);
//   res.send("lyeah!");

// });

// app.post("/getdata",async(req,res)=>{
//      let {name} = req.body;
//        let datas=await userModel.find({});
//        let info=  datas.map((data)=> data["username"]);
//         for(let i=0;i<info.length;i++){
//             if(username == info[i]){
//                   console.log("yyyy");
//                   res.send("match");
//             }

//         }
//           res.send("sorry");});

//       app.post("/login",passport.authenticate("local",{
//         failureRedirect:"/login",
//         failureFlash:true,
//       }
//       ),
//       async(req,res)=>{

//       })    ;

// });
// app.get("/demouser",async(req,res)=>{
// let fakeUser = new User({
// email:"shyamji850@gmail.com",
// username:"Shyamji",
// });
// let registeredUser=await User.register(fakeUser,"HelloWorld");
// res.send(registeredUser);
// });

app.get("/allPositions", async (req, res) => {
  let allPositions = await PositionsModel.find({});
  res.json(allPositions);
});

app.get("/allHoldings", async (req, res) => {
  let allHoldings = await HoldingsModel.find({});
  res.json(allHoldings);
});

app.get("/allOrders", async (req, res) => {
  let allOrders = await OrdersModel.find({});
  res.json(allOrders);
});

app.post("/newOrders", async (req, res) => {
  let newOrder = new OrdersModel({
    name: req.body.name,
    qty: req.body.qty,
    price: req.body.price,
    mode: req.body.mode,
  });
  await newOrder.save();
  res.send("Orders saved!");
});


 app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.json("Logged out");});

  app.get("/",(req,res)=>{
    res.send("root");
  })

app.listen(PORT, () => {
  console.log("app is listening on port");
  mongoose.connect(uri);
  console.log("DB Connected");
});
