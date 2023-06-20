const mongoose = require('mongoose');

// Define the schema for a post
const postSchema = new mongoose.Schema({
  email:{
    type:String,
    required:true

  },
  content: {
    type: String,
    required: true,
  },
  time:{
    type:String,
    required:true
  },
  address:{
    type:String,
    required:true
  },
  name:{
    type:String,
    required:true
  },
  // imagepath:{type:String,required:false}
  
  // Additional fields for the post
  // ...
});

// Create a model based on the schema
const Post = mongoose.model('Post', postSchema);

module.exports = Post;