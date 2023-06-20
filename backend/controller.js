const usermodel = require('./schema')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const  Jwt = require('jsonwebtoken')
const Post = require('./postschema')
const secret = process.env.JWT_KEYS;
const otpGenerator = require('otp-generator')
const { json } = require('express')
const multer = require('multer')
const sharp = require('sharp');
const fs = require('fs');

const register =async(req,res)=>{ 
    try{
        const {name,email,password} = req.body;
        const usernew = await usermodel.findOne({ email: req.body.email});
            if(usernew){
                
                res.send({msg: "User already registerd"})
               
            }
            else{   console.log("password checking")
                    if(password){
                        console.log("Password hashing")
                        bcrypt.hash(password,10)
                        .then(hashedpassword =>{
                            console.log("Schema Creating new vala")
                            const user = new usermodel({
                                name,
                                email,
                                password:hashedpassword,
                                address:"Edit Your Address....",
                                about:"Edit your About....",
                                age:""
                            });
                            console.log("user create hone ka baad")
                            //return save result as a response
                            user.save()
                            .then(result => res.status(201).send({msg:"User registerd succesfuuly Please Login Now"}))
                            .catch(error=>res.status(500).send({error}))
                        }).catch(error =>{
                            return res.status(500).send({
                                error:"Enable to hashed password"
                            })
                        })
                    }
        
               
            }
    } catch(error){
        return res.status(500).send(error);
    }
}

const login = async(req,res) =>{
    const {email,password} = req.body;

    try{
        await usermodel.findOne({ email: req.body.email})
       .then(user =>{
        bcrypt.compare(password,user.password)
        .then(passwordcheck=>{
            if(!passwordcheck) return res.status(400).send({error:"Password Does not match"})

            //create jwt token
            console.log("Toekn ka kaam chalta hua")
            const token = Jwt.sign({
                userid: user._id,
                email:user.email,
            },process.env.JWT_KEYS,{expiresIn:"24h"});
            console.log("Token ka kaam khatam")
            return res.status(200).send({
                msg:"Login Successful",
                token,user
            });
        })
        .catch(error =>{
            return res.status(400).send({error:"Password Does not match"})
        })
       })
       .catch(error =>{
        return res.status(404).send({error:"User Does not registered yet"})
       })
    }catch(error){
        return res.status(500).send({error});
    }
}
// for verify of the user

const verifyuser = async(req,res,next)=>{
    try{
        const {email} = req.method == "GET" ? req.query : req.body;
        console.log("Verifying User")
        //existence of the userr
        console.log(email)
        let exist = await usermodel.findOne({email});
        if(!exist){
            return res.status(404).send({error:"Cant find the user"});
        }
        console.log("Verified User")
        next();
    } catch(error){
        return res.status(404).send({error:"Authentication failed"})
    }
}
const getuser = async(req,res)=>{
    try{
        const {email} = req.method == "GET" ? req.query : req.body;


        await usermodel.findOne({email})
       .then(user =>{
        return res.status(200).send({
            msg:"Getting User Profile",user
        });
       })
       .catch(error =>{
        return res.status(404).send({error:"User Does not registered yet"})
       })
    }
    catch(error){
        res.status(404).send({error})
    }
}

const updateuser = async(req,res)=>{
    console.log("Inside the update try function")
    try{
        // const id = req.query.id;
        const {userid} = req.user;
        
        console.log("checking id id present or not ")
        if(userid){
            const body = req.body;
            console.log("Inside the id ");
            console.log(userid)
            console.log(req.body.name)
            usermodel.updateOne ( {
                _id:userid
            },{"name":req.body.name,"address":req.body.address,"age":req.body.age,"about":req.body.about,"role":req.body.role})
            .then((obj)=>{
                console.log("Updatted")
                res.status(200).send({msg:"Update successfull"})
            })
            .catch((err)=>{
                console.log(err);
                res.status(404).send({err})
            })
        }
     
        else{
            return res.status(401).send({error:"User not found"})
        }
         

    }catch(error){
        console.log("Bahar aa gya re apiun")
        return res.status(401).send({error})
    }
}
const Auth = async(req,res,next) =>{
    try{
        const token = req.headers.authorization.split(" ")[1];
        console.log("Inside the auth function and token is",token)
        // retriew the user details 
        const decodedtoken = await Jwt.verify(token,process.env.JWT_KEYS);
        req.user = decodedtoken;
        // res.json(decodedtoken); 
        console.log("Auth Done")  
        next()

    }catch(error){
        res.status(401).json({error:"Authentication Failed"})
    }  
}
const genotp = async(req,res)=>{
     req.app.locals.OTP = await otpGenerator.generate(6,{lowerCaseAlphabets:false,upperCaseAlphabets:false,specialChars:false});
     let code = req.app.locals.OTP;
     res.status(201).send({code})
    
}   
const verifyotp = async(req,res)=>{
    const {code} = req.query;
    if(parseInt(req.app.locals.OTP) === parseInt(code)){
        req.app.locals.OTP = null;
        req.app.locals.resetSession = true;
        return res.status(201).send({msg:"Veriifed"})
    }
    else{
        return res.status(404).send({msg:"Invalid OTP"})
    }

}
const localvariable = async(req,res,next)=>{
    console.log("inside the local variable")
    req.app.locals = {
        OTP:null,
        resSession:false
    }
    next();
}

 
 
const registermail = async(req,res)=>{

}


const createreset = async(req,res)=>{
    if(req.app.locals.resSession){
        req.app.locals.resetSession = false;
        return res.status(201).send({msg:"Access Granted"})
    }
    return res.status(440).send({error:"Session Expired"})
}

const resetpassword = async(req,res)=>{ 
   try{
    const {email,password} = req.body;
    try{
        usermodel.findOne({email})
        .then(user =>{
            bcrypt.hash(password,10)
            .then(hashedpassword =>{
                usermodel.updateOne({email:user.email},{password:hashedpassword},function(err,data){
                    if(err) throw err;
                    return res.status(201).send({msg:"Record Updated Successfully...."})
                })
            })
            .catch(error =>{
                return res.status(500).send({
                    error:"Enable to hashed password"
                })
            })
        })
        .catch(error =>{
            return res.status(404).send({error:"Email Not Found"})
        })
    }
    catch(error){
        return res.status(500).send({error})
    }
   }
   catch(error) {
    return res.status(401).send({error})
   }
}


const upload = multer({ dest: 'uploads/' });
const feedpost =async(req,res)=>{
    try{
        console.log(req.body.newPost)
        console.log(req.body.email)
        const email= req.body.email
        const content = req.body.newPost;
        const address = req.body.address;
        const name = req.body.name;
        const time = req.body.time;

        // Path ke ;ivkejhs 
        // const processedImageBuffer = await sharp(req.file.path)
        // .resize(800, 600)
        // .toBuffer();


        // if (!fs.existsSync('images')) {
        //     fs.mkdirSync('images');
        //   }
        //   console.log("After the cheking fs.existing etc...")
        // Save the processed image to a specific directory or cloud storage
        // const imagePath = 'images/processedImage.jpg';
        // fs.writeFileSync(imagePath, processedImageBuffer);
        // console.log("writing the file sync image path etccc")
        const usercheck = await usermodel.findOne({ email: req.body.email});
        console.log(usercheck)

        if(usercheck){
            console.log("We get email from another database")
                const userdata = new Post({
                    email,content,address,name,time
                });
                console.log("userdata create hone ka baad")
                //return save result as a response
                userdata.save()
                .then(result => res.status(201).send({msg:"Userdata Uploaded"}))
                .catch(error=>res.status(500).send({error}))

                // fs.unlinkSync(req.file.path);  
        }


         
        console.log("done")
        // res.status(201).send(json(newPost));
    }
    catch(error){
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
}
// const users = async(req,res)=>{
//     console.log("Inside the users function")
//     await usermodel.find({},(err,users)=>{
//         if (err) {
//             console.error(err);
//             res.status(500).json({ error: 'Failed to fetch users' });
//           } else {
//             return res.json(users);
//           }
//     });
// }

const users = async(req,res)=>{
    try {
        const users = await Post.find();
        return res.json(users);
      } catch (error) {
        console.log('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
}
const logout = async(req,res)=>{
     
         
     
}

module.exports={
   register,login,registermail,verifyuser,genotp,verifyotp,createreset,updateuser,resetpassword,Auth,localvariable,getuser,feedpost,users,logout
}

