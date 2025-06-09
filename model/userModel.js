let mongoose= require("mongoose");

let userSchema=  require("../schemas/userSchema.js");
let userModel = mongoose.model("user",userSchema);
module.exports=userModel;