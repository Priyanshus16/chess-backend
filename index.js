const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer")
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

const PORT = process.env.PORT || 5000;
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

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}); 

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 }, // OTP expires in 5 minutes
});

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

const courseSchema = new mongoose.Schema({
  title:{
    type: String,
    required: true
  },
  description:{
    type: String,
    required: true
  },
  duration:{
    type: String,
    required: true
  },
  price:{
    type: String,
    required: true
  },
  image:{
    type: String,
    required: true
  },
  courseLevel: {
    type: String,
    required:true
  }
},{timestamps:true});

// <--------   Models  ---------->

const User = mongoose.model("User", userSchema);
const Testimonial = mongoose.model('Testimonial', testimonialSchema)
const Curriculum = mongoose.model('Curriculum', curriculumSchema)
const Blog = mongoose.model('Blog', blogSchema);
const OTP = mongoose.model("OTP", otpSchema);
const Course = mongoose.model("Course", courseSchema);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.Nodemailer_Username, 
    pass: process.env.Nodemailer_Password,
  },
});


// <--------- ROUTES UI ---------->

//  Register 
app.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword, name });
    await newUser.save();
    res.status(201).send("User registered successfully");
  } catch (err) {
    res.status(400).send("Error registering user: " + err.message);
  }
});


//login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({message:"User not found"});

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send("Invalid credentials");

    res.status(200).send("Login successful");
  } catch (err) {
    res.status(500).send("Error logging in: " + err.message);
  }
});

app.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send("User not found");

    const otp = crypto.randomInt(100000, 999999).toString();
    const newOtp = new OTP({ email, otp });
    await newOtp.save();

    await transporter.sendMail({
      from: "support@gmail.com",
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP is ${otp}`,
    });

    res.status(200).send({message:"OTP sent to email",otp:otp});
  } catch (err) {
    res.status(500).send("Error sending OTP: " + err.message);
  }
});

app.post("/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updateOne({ email }, { password: hashedPassword });

    res.status(200).send("Password reset successful");
  } catch (err) {
    res.status(500).send("Error resetting password: " + err.message);
  }
});

// get testimonial
app.get(`/testimonial`, async(req,res) => {
  try {
    const testimonial = await Testimonial.find();
    res.status(200).json({message:'testimonial send successfull', testimonial});
  } catch (error) {
    return res.status(500).json({message:'there was problem while fetching testimonial'})
  }
})

// get curriculum
app.get(`/curriculum`, async(req, res) => {
  try {
    const curriculum = await Curriculum.find();
    res.status(200).json({message:'data received successfully', curriculum});
  } catch (error) {
    return res.status(500).json({message:'there was error while sending data'});
  }

})

// get blog
app.get(`/blogs`, async(req, res) => {
  try {
    const blogs = await Blog.find();
    res.status(200).json({message:'data fetch successfull', blogs});
  } catch (error) {
    return res.status(500).json({message:'there was problem while getting data'});
  }
})

// get Course
app.get(`/courses`, async(req,res) => {
  try {
    const courses = await Course.find();
    res.status(200).json({message:`data fetch successfully`, courses});
  } catch (error) {
    return res.status(500).json({message:`error while fetching data`});
  }
})



// <------- ROUTES ADMIN PANEL -------->

//  User Data save
app.get(`/admin/users`, async(req, res) => {
  try {
      const users = await User.find();
      res.status(200).json({message:'data fetch succesfully',users})
  } catch (error) {
      res.status(500).json({message:'error while getting data'});
  }
})

// Delete User 
app.delete(`/admin/users/:id`, async(req, res) => {
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
app.post(`/admin/addTestimonials`, async(req, res) => {
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
app.get(`/admin/testimonials`, async(req, res) => {
  try {
    const testimonials = await Testimonial.find();
    res.status(200).json({message:'testimonial data fetch successfull', testimonials});
  } catch (error) {
    return res.status(500).json({message:'problem while fetching testimonial data'});
  }
})

// Delete testimonial
app.delete(`/admin/testimonials/:id`, async(req, res) => {
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
app.post(`/admin/addCurriculum`, async(req,res) => {

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
app.get(`/admin/curriculum`, async(req, res) => {
  try {
    const curriculum = await Curriculum.find();
    res.status(200).json({message:'data fetch successfully',curriculum});
  } catch (error) {
    return res.status(500).json({message:'there was problem while getting data'})
  }
  
})

// delete curriculum
app.delete(`/admin/curriculum/:id`, async(req, res) => {
  try {
    const {id} = req.params
    const deleteCurriculum = await Curriculum.findByIdAndDelete(id);
    res.status(200).json({message:'data delete successfully', deleteCurriculum});
  } catch (error) {
    return res.status(500).json({message:'there was problem while deleting'});
  }

})

// add blog
app.post(`/admin/addBlog`, async(req,res) => {
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
app.get(`/admin/blogs`, async(req, res) => {
  try {
    const blogs = await Blog.find(); 
    res.status(200).json({message:'data send successfully', blogs});
  } catch (error) {
    return res.status(500).json({message:'there is problem while sending data'});
  }
})

// delete blog
app.delete(`/admin/blogs/:id`, async(req,res) => {
  try {
    const {id} = req.params;
    const deleteBlog = await Blog.findByIdAndDelete(id);
    res.status(200).json({message:'blog delete successfull', deleteBlog});
  } catch (error) {
    return res.status(500).json({message:'error while deleting blog'});
  }

})

// add courses
app.post(`/admin/addCourses`, async(req, res) => {
  try {
    const {title, description, duration, price, image, courseLevel} = req.body;

    const newCourse = new Course({
      title,
      description,
      duration,
      price,
      image,
      courseLevel
    });
    await newCourse.save();
    res.status(200).json({message:'data save successfully', newCourse});
  } catch (error) {
    res.status(500).json({message:'problem while saving data'});
  }
  

})

// get course
app.get(`/admin/course`, async(req, res) => {
  try {
    const courses = await Course.find();
    res.status(200).json({message:'data send successfully', courses});
  } catch (error) {
    return res.status(500).json({message:'problem while sending data'});
  }
})

// delete course
app.delete(`/admin/course/:id`, async(req, res) => {
  try {
    const {id} = req.params;
    const deleteCourse = await Course.findByIdAndDelete(id);
    res.status(200).status({message:'course delete successfully', deleteCourse});
  } catch (error) {
    return res.status(500).json({message:'problem while deleting course'});
  }
})

app.listen(PORT, () => {
  console.log(`server is listening on ${PORT}`);
});
