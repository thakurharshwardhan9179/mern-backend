const express = require("express");
const router = express.Router();
const Contact = require("../Model/Contact");


// SAVE MESSAGE
router.post("/contact", async (req, res) => {
  try {

    const contact = new Contact(req.body);

    await contact.save();

    res.json({
      success:true,
      message:"Message saved"
    });

  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});


// GET ALL MESSAGES (ADMIN)
router.get("/contact", async (req,res)=>{

  try{

    const messages = await Contact.find().sort({createdAt:-1});

    res.json(messages);

  }catch(err){
    res.status(500).json(err);
  }

});


module.exports = router;
