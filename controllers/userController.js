const User=require('../models/userModel')
const Chat=require('../models/chatModel')
const bcrypt=require('bcrypt')
const { reset } = require('nodemon')



const registerLoad=async(req,res)=>{
    try {
        res.render('register')
        
    } catch (error) {
        console.log(error.message)
        
    }
}
const register = async (req, res) => {
    try {
        console.log(req.body);
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.render('register', { message1: "Email already exists. Please use a different email address." });
        }
        const passwordHash = await bcrypt.hash(req.body.password, 10);
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            image: 'images/' + req.file.filename,
            password: passwordHash
        });

        await user.save();
        
            return res.redirect('/dashboard'); 
        
    } catch (error) {
        console.log(error.message);
        return res.status(500).send("Internal Server Error");
    }
};

const loadLogin=async(req,res)=>{
    try {
        res.render('login')
        
    } catch (error) {
        console.log(error.message);
        
    }
}
const login = async (req, res) => {
    try {
        console.log(req.body);
        const email = req.body.email;
        const password = req.body.password;
        const userData = await User.findOne({ email: email });

        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);

            if (passwordMatch) {
                req.session.user = userData;
                return res.redirect('/dashboard');
            } else {
                return res.render('login', { message: "Email or Password is Incorrect" });
            }
        } else {
           return  res.render('login', { message: "Email or Password is Incorrect" });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};

const logout=async(req,res)=>{
    try {
        req.session.destroy()
        res.redirect('/')
        
    } catch (error) {
        console.log(error.message);
        
    }
}
const loadDashboard=async(req,res)=>{
    try {
        const user=await User.find({_id:{$nin:[req.session.user._id]}})
    
        res.render('dashboard',{user:req.session.user,users:user})
        
    } catch (error) {
        console.log(error.message);
        
    }
}
const saveChat=async(req,res)=>{
    console.log(req.body);
    try {

        var chat=new Chat({
            sender_id:req.body.sender_id,
            receiver_id:req.body.receiver_id,
            message:req.body.message
        })
        console.log(chat);
       var newChat= await chat.save()
        res.status(200).send({success:true,msg:'chat inserted',data:newChat})
        
        
    } catch (error) {
        console.log(error);
        reset.status(400).send({success:false,msg:error.message})
        
    }
}

module.exports={
    register,
    registerLoad,
    loadLogin,
    loadDashboard,
    logout,
    login,
    saveChat
}