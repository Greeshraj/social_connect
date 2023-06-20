const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const morgan = require('morgan')
// const  Auth = require('./auth')
require('dotenv').config()
const app = express()
app.use(cors())
app.use(express.json())
app.use(morgan('tiny'))
// app.use('/api',router)
app.disable('x-powered-by')
const {register,login,registermail,genotp,verifyotp,createreset,updateuser,resetpassword, verifyuser,Auth,localvariable,getuser,feedpost,users,logout} = require('./controller');
const {profile} = require('./Pages/profile')
const { Posts } = require('../frontend/src/dummydata')
// app.use('/api/workouts',workoutRoutes)

mongoose.connect(process.env.MONGO_URI)

.then(()=>{

    app.listen(process.env.PORT,()=>{
        console.log("Run at port 4000")
    })
    
})
.catch((error)=>{
    console.log(error)
})

app.get("/",(req,res)=>{
res.send("My Backend started")
})

app.post('/register',register);
app.post('/login',verifyuser,login)
app.post('/authenticate',verifyuser,(req,res)=> res.end());
app.post('/registermail',registermail)
app.post('/verifyuser',verifyuser)
app.post('/posts',Auth,feedpost);

app.get('/logout',logout)
app.get('/getuser',verifyuser,getuser)
app.get('/verifyotp',verifyuser,verifyotp)
app.get('/generateotp',verifyuser,localvariable,genotp)
app.get('/createreset',createreset)
app.get('/users',users)
// app.get('/profile',verifyuser,profile);

app.put('/updateuser',Auth,updateuser)
app.put('/resetpassword',resetpassword)



