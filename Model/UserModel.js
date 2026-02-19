const mongoose =require('mongoose')
const userSchema=new mongoose.Schema({
    name:{
        type:String,  //data ka type
        required:true
    },
    email:{
        type:String,
        required:true,   //field compulsory
        unique:true  //dubliucate nhi  honi chaiye
    },
    
  password:{
    type:String,
    required:true,  //mast require and strong password

  },
  role:{
    type:String,
    enum:["admin","member"],  // limited values
    default:"member"
  }
    
})
module.exports = mongoose.model("User", userSchema);