const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const ADMIN_API_PREFIX = '/api/v1/admin'
const UI_API_PREFIX = '/api/v1'

// database connection

const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log(`DB connected`);
  } catch (error) {
    console.log(`error while Db connection`, error);
  }
};
dbConnect();

// <--------- Schema for UI ---------->

// <------ Users ------->
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
},{ timestamps: true });


// <------- Schema ADMIN_PANEL -------->

// testimonial 
const testimonialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  achievement: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  course: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  }
},{ timestamps: true })

// curriculum
const curriculumSchema = new mongoose.Schema({
  heading:{
    type: String,
    required:true
  },
  subHeading:{
    type: String,
    required: true
  },
  keyPoints: {
    type: [String],
    required:true
  }
},{timeseries:true})

const blogSchema = new mongoose.Schema({
  heading: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  }
},{timestamps:true})

// <--------   Models  ---------->

const User = mongoose.model("User", userSchema);
const Testimonial = mongoose.model('Testimonial', testimonialSchema)
const Curriculum = mongoose.model('Curriculum', curriculumSchema)
const Blog = mongoose.model('Blog', blogSchema);



// <--------- ROUTES UI ---------->

//  Register 
app.post(`${UI_API_PREFIX}/register`, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if(!name || !email || !password) {
      return res.status(204).json({message:'empty data received'})
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log(`user already exists`);
      return res.status(409).json({ message: `user already exists` });
    }

    const newUser = User({
      name,
      email,
      password,
    });
    await newUser.save();
    res.status(200).json({ message: `user registerd successfully` });
  } catch (error) {
    res.status(500).json({ message: `Internal server error` });
  }
});

//  Login
app.post(`${UI_API_PREFIX}/login`, async(req, res) => {
  try {
    const {email, password} = req.body;

    if(!email || !password) {
      return res.status(204).json({message:'empty data received'})
    }

    const validateUser = await User.findOne({email})

    // console.log(validateUser)

    if(!validateUser) {
      return res.status(404).json({message:'No user found'})
    }

    if(validateUser.password !== password) {
      return res.status(401).json({message:'invalid password'});
    }

    res.status(200).json({message:'user authenticate', validateUser})

  } catch (error) {
    res.status(500).json({message:'problem validating user'});
  }
  
})

// get testimonial
app.get(`${UI_API_PREFIX}/testimonial`, async(req,res) => {
  try {
    const testimonial = await Testimonial.find();
    res.status(200).json({message:'testimonial send successfull', testimonial});
  } catch (error) {
    return res.status(500).json({message:'there was problem while fetching testimonial'})
  }
})

// get curriculum
app.get(`${UI_API_PREFIX}/curriculum`, async(req, res) => {
  try {
    const curriculum = await Curriculum.find();
    res.status(200).json({message:'data received successfully', curriculum});
  } catch (error) {
    return res.status(500).json({message:'there was error while sending data'});
  }

})

// get blog
app.get(`${UI_API_PREFIX}/blogs`, async(req, res) => {
  try {
    const blogs = await Blog.find();
    res.status(200).json({message:'data fetch successfull', blogs});
  } catch (error) {
    return res.status(500).json({message:'there was problem while getting data'});
  }
})



// <------- ROUTES ADMIN PANEL -------->

//  User Data save
app.get(`${ADMIN_API_PREFIX}/users`, async(req, res) => {
  try {
      const users = await User.find();
      res.status(200).json({message:'data fetch succesfully',users})
  } catch (error) {
      res.status(500).json({message:'error while getting data'});
  }
})

// Delete User 
app.delete(`${ADMIN_API_PREFIX}/users/:id`, async(req, res) => {
  try {
    const {id} = req.params;
    console.log(id);
    const deletedUser = await User.findByIdAndDelete(id)

    if(!deletedUser) {
      res.status(404).json({message:'user not found'});
    }

    res.status(200).json({message:'user delete successfully',deletedUser})
  } catch (error) {
    res.status(500).json({message:'error while deleting', error})
  }
})

// Add Testimonials save in db 
app.post(`${ADMIN_API_PREFIX}/addTestimonials`, async(req, res) => {
  try {
    const {name,achievement,description,course,image} = req.body;

    if(!name || !achievement || !description || !course || !image) {
      return res.status(204).json({message:'empty data received'})
    }

    const newtestimonial = new Testimonial({
      name,
      achievement,
      description,
      course,
      image
    });
    await newtestimonial.save();
    res.status(200).json({message:'testimonial data send successfully'})
  } catch (error) {
    return res.status(500).json({message:'there was problem while saving data'});
  }
})

// Get Testimonial 
app.get(`${ADMIN_API_PREFIX}/testimonials`, async(req, res) => {
  try {
    const testimonials = await Testimonial.find();
    res.status(200).json({message:'testimonial data fetch successfull', testimonials});
  } catch (error) {
    return res.status(500).json({message:'problem while fetching testimonial data'});
  }
})

// Delete testimonial
app.delete(`${ADMIN_API_PREFIX}/testimonials/:id`, async(req, res) => {
  try {
    const {id} = req.params;
    const deletedItem = await Testimonial.findByIdAndDelete(id);
    if(!deletedItem) {
      res.status(404).json({message:'user not found'});
    }
  
    res.status(200).json({message:'user delete successfully',deletedItem})
  } catch (error) {
    res.status(500).json({message:'error while deleting', error})
  }
})

// add curruculum
app.post(`${ADMIN_API_PREFIX}/addCurriculum`, async(req,res) => {

  try {
    const {heading, subHeading, keyPoints} = req.body; 
    
    if(!heading || !subHeading || !keyPoints) {
      return res.status(204).json({message:'empty data received'})
    } 
    const newCurriculum = new Curriculum({
      heading,
      subHeading,
      keyPoints
    })
    await newCurriculum.save();
    res.status(200).json({message:'data save succesfully', newCurriculum})
  } catch (error) {
    return res.status(500).json({message:'problem while saving data in db'});
  }
})

//get curriculum
app.get(`${ADMIN_API_PREFIX}/curriculum`, async(req, res) => {
  try {
    const curriculum = await Curriculum.find();
    res.status(200).json({message:'data fetch successfully',curriculum});
  } catch (error) {
    return res.status(500).json({message:'there was problem while getting data'})
  }
  
})

// delete curriculum
app.delete(`${ADMIN_API_PREFIX}/curriculum/:id`, async(req, res) => {
  try {
    const {id} = req.params
    const deleteCurriculum = await Curriculum.findByIdAndDelete(id);
    res.status(200).json({message:'data delete successfully', deleteCurriculum});
  } catch (error) {
    return res.status(500).json({message:'there was problem while deleting'});
  }

})

// add blog
app.post(`${ADMIN_API_PREFIX}/addBlog`, async(req,res) => {
  try {
    const {heading, description, image} = req.body
    const newBlog = new Blog({
      heading,
      description,
      image
    });
    await newBlog.save();
    res.status(200).json({message:'data saved successfully',newBlog});
  } catch (error) {
    return res.status(500).json({message:'error while saving data'});
  }
  
})

// get blog
app.get(`${ADMIN_API_PREFIX}/blogs`, async(req, res) => {
  try {
    const blogs = await Blog.find(); 
    res.status(200).json({message:'data send successfully', blogs});
  } catch (error) {
    return res.status(500).json({message:'there is problem while sending data'});
  }
})

// delete blog
app.delete(`${ADMIN_API_PREFIX}/blogs/:id`, async(req,res) => {
  try {
    const {id} = req.params;
    const deleteBlog = await Blog.findByIdAndDelete(id);
    res.status(200).json({message:'blog delete successfull', deleteBlog});
  } catch (error) {
    return res.status(500).json({message:'error while deleting blog'});
  }

})


app.listen(PORT, () => {
  console.log(`server is listening on ${PORT}`);
});
