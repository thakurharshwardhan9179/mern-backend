const mongoose=require("mongoose")
const DB="mongodb+srv://gymadmin:gym123123@cluster0.muvhqbx.mongodb.net/"


mongoose.connect(DB,{

}).then(()=>console.log("mongodb connected")).catch((error)=>{
    console.log(error.message)
}
)