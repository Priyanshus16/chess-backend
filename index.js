const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const cloudinary = require("cloudinary").v2;

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// coudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
app.use(cors());
app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ limit: "200mb", extended: true }));

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

const PurchasedCourseSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  purchaseDate: {
    type: Date,
    default: Date.now,
  },
  // paymentStatus: {
  //   type: String,
  //   enum: ["Pending", "Success", "Failed"],
  //   default: "Pending",
  // },
  // transactionId: {
  //   type: String,
  //   required: true,
  // },
});

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    source: { type: String, required: true, enum: ["user", "admin"] },
    purchasedCourses: [PurchasedCourseSchema],
  },
  { timestamps: true }
);

// <------- Schema ADMIN_PANEL -------->

// testimonial
const testimonialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    achievement: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    course: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// testimonial video
const testimonialVideoSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    video: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// testimonial image
const testimonialImageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// curriculum
const curriculumSchema = new mongoose.Schema(
  {
    heading: {
      type: String,
      required: true,
    },
    subHeading: {
      type: String,
      required: true,
    },
    keyPoints: {
      type: [String],
      required: true,
    },
  },
  { timeseries: true }
);

const blogSchema = new mongoose.Schema(
  {
    heading: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    curricullum: {
      type: [String],
    },
    duration: {
      type: String,
    },
    price: {
      type: String,
    },
    image: {
      type: String,
    },
    courseLevel: {
      type: String,
    },
    video: {
      type: String,
    },
    videoName: {
      type: String,
    },
  },
  { timestamps: true }
);

const bannerSchema = new mongoose.Schema(
  {
    heading: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const BeginnerBannerSchema = new mongoose.Schema(
  {
    heading: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const IntermediateBannerSchema = new mongoose.Schema(
  {
    heading: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const AdvanceBannerSchema = new mongoose.Schema(
  {
    heading: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const BeginnerBenefitsSchema = new mongoose.Schema(
  {
    heading: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const IntermediateBenefitsSchema = new mongoose.Schema(
  {
    heading: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const AdvanceBenefitsSchema = new mongoose.Schema(
  {
    heading: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const StoreSchema = new mongoose.Schema(
  {
    heading: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    shortDescription: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// course video
const courseVideoSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    videoUrl: { type: String, required: true },
  },
  { timestamps: true }
);

// OTP schema
const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // ⏰ expires in 5 minutes
  },
});

// <--------   Models  ---------->

const User = mongoose.model("User", userSchema);
const Testimonial = mongoose.model("Testimonial", testimonialSchema);
const Curriculum = mongoose.model("Curriculum", curriculumSchema);
const Blog = mongoose.model("Blog", blogSchema);
const Course = mongoose.model("Course", courseSchema);
const Banner = mongoose.model("Banner", bannerSchema);
const TestimonialVideo = mongoose.model(
  "TestimonialVideo",
  testimonialVideoSchema
);
const TestimonialImage = mongoose.model(
  "TestimonialImage",
  testimonialImageSchema
);
const BeginnerBanner = mongoose.model("BeginnerBanner", BeginnerBannerSchema);
const IntermediateBanner = mongoose.model(
  "IntermediateBanner",
  IntermediateBannerSchema
);
const AdvanceBanner = mongoose.model("AdvanceBanner", AdvanceBannerSchema);
const BeginnerBenefit = mongoose.model(
  "BeginnerBenefit",
  BeginnerBenefitsSchema
);
const IntermediateBenefit = mongoose.model(
  "IntermediateBenefit",
  IntermediateBenefitsSchema
);
const AdvanceBenefit = mongoose.model("AdvanceBenefit", AdvanceBenefitsSchema);
const Store = mongoose.model("Store", StoreSchema);
const CourseVideo = mongoose.model("CourseVideo", courseVideoSchema);
const Otp = mongoose.model("Otp", otpSchema);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.Nodemailer_Username,
    pass: process.env.Nodemailer_Password,
  },
});

// <--------- Nodemailer ---------->
app.post("/send-email", async (req, res) => {
  const { name, email, contact, city, ageGroup, language, device } = req.body;

  const mailOptions = {
    from: process.env.Nodemailer_Username,
    to: `Masterchessclasses@gmail.com`,
    subject: "New Demo Class Booking Request",
    text: `Name: ${name}\nEmail: ${email}\nContact: ${contact}\nCity: ${city}\nAge Group: ${ageGroup}\nPreferred Language: ${language}\nDevice: ${device}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Email sending failed!" });
  }
});

// <--------- Stripe -------------->

app.post("/create-checkout-session", async (req, res) => {
  const { course, userId } = req.body;

  try {
    const courseId = course[0]._id;

    // Check if the course is already purchased
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.purchasedCourses.some((c) => c.courseId.toString() === courseId)) {
      return res
        .status(400)
        .json({ message: "Already enrolled in this course" });
    }

    const lineItems = course.map((product) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: product.title,
          description: product.description,
        },
        unit_amount: Math.round(Number(product.price) * 100),
      },
      quantity: 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
    });

    res.json({ id: session.id });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

// <--------- ROUTES UI ---------->

// Generate a random 6-digit OTP
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// forgot password
app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "Email not found in our records." });
    }

    const otp = generateOTP();

    const mailOptions = {
      from: process.env.Nodemailer_Username,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}`,
    };

    await transporter.sendMail(mailOptions);

    // Remove old OTPs for this email
    await Otp.deleteMany({ email });

    // Save new OTP to DB
    const newOtp = new Otp({ email, otp });
    await newOtp.save();

    res.status(200).json({ message: "OTP sent to email." });
  } catch (err) {
    res.status(500).json({ message: "Error sending OTP", error: err.message });
  }
});

// verify-otp
app.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    const otpRecord = await Otp.findOne({ email });

    if (!otpRecord) {
      return res.status(400).json({ message: "OTP expired or not found" });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // OTP verified successfully, remove it
    await Otp.deleteOne({ _id: otpRecord._id });

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// change password
app.post("/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res
      .status(400)
      .json({ message: "Email and new password are required." });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json("Password updated successfully.");
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

//  Register
app.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User already exists", existingUser });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      source: "user",
    });
    await newUser.save();
    res.status(200).send("User registered successfully");
  } catch (err) {
    console.log(err);
    return res.status(500).send("Error registering user: " + err.message);
  }
});

//login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).send("Invalid credentials");

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1h",
    });

    res.status(200).json({ message: "Login successful", token, user });
  } catch (err) {
    res.status(500).json({ message: "Error logging in" });
  }
});

// get users
app.get(`/users`, async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ message: "data fetch succesfully", users });
  } catch (error) {
    res.status(500).json({ message: "error while getting data" });
  }
});

// get testimonial
app.get(`/testimonial`, async (req, res) => {
  try {
    const testimonial = await Testimonial.find();
    const testimonialVideo = await TestimonialVideo.find();
    res.status(200).json({
      message: "testimonial send successfull",
      testimonial,
      testimonialVideo,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "there was problem while fetching testimonial" });
  }
});

// get testimonial image
app.get(`/testimonialImage`, async (req, res) => {
  try {
    const testimonialImage = await TestimonialImage.find();
    res
      .status(200)
      .json({ message: "testimonial send successfull", testimonialImage });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "there was problem while fetching testimonial" });
  }
});

// get curriculum
app.get(`/curriculum`, async (req, res) => {
  try {
    const curriculum = await Curriculum.find();
    res.status(200).json({ message: "data received successfully", curriculum });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "there was error while sending data" });
  }
});

// get blog
app.get(`/blogs`, async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.status(200).json({ message: "data fetch successfull", blogs });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "there was problem while getting data" });
  }
});

// get Course
app.get(`/courses`, async (req, res) => {
  try {
    const courses = await Course.find();
    res.status(200).json({ message: `data fetch successfully`, courses });
  } catch (error) {
    return res.status(500).json({ message: `error while fetching data` });
  }
});

app.get("/admin/users/:userId/purchased-courses", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).populate("purchasedCourses.courseId");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const purchasedCourses = user.purchasedCourses
      .map((item) => {
        // Ensure courseId is populated
        return typeof item.courseId === "object" ? item.courseId : null;
      })
      .filter(Boolean); // remove nulls

    return res.status(200).json({
      message: "Purchased courses fetched successfully",
      purchasedCourses,
    });
  } catch (error) {
    console.error("Error fetching purchased courses:", error);
    return res.status(500).json({ message: "Error while fetching purchased courses" });
  }
});

// course enroll
app.post("/enroll", async (req, res) => {
  try {
    const { userId, courseId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if the course is already purchased
    if (user.purchasedCourses.some((c) => c.courseId.toString() === courseId)) {
      return res
        .status(400)
        .json({ message: "Already enrolled in this course" });
    }

    // Add course to purchasedCourses
    user.purchasedCourses.push({
      courseId,
      // transactionId: `txn_${Date.now()}`, // Generate a unique transaction ID
      // paymentStatus: "Success",
    });

    await user.save();
    res.json({
      message: "Course enrolled successfully!",
      purchasedCourses: user.purchasedCourses,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error });
  }
});

// get banner
app.get(`/banner`, async (req, res) => {
  try {
    const banners = await Banner.find();
    res.status(200).json({ message: "data fetch successfully", banners });
  } catch (error) {
    return res.status(500).json({ message: "error while fetching data" });
  }
});

// get Beginner banner
app.get(`/beginnerBanner`, async (req, res) => {
  try {
    const beginnerBanner = await BeginnerBanner.find();
    const coachingCards = await BeginnerBenefit.find();
    res.status(200).json({
      message: "data fetch successfully",
      beginnerBanner,
      coachingCards,
    });
  } catch (error) {
    return res.status(500).json({ message: "error while fetching data" });
  }
});

// get intermediate banner
app.get(`/intermediateBanner`, async (req, res) => {
  try {
    const intermediateBanner = await IntermediateBanner.find();
    const coachingCards = await IntermediateBenefit.find();
    res.status(200).json({
      message: "data fetch successfully",
      intermediateBanner,
      coachingCards,
    });
  } catch (error) {
    return res.status(500).json({ message: "error while fetching data" });
  }
});

// get advance banner
app.get(`/advanceBanner`, async (req, res) => {
  try {
    const advanceBanner = await AdvanceBanner.find();
    const coachingCards = await AdvanceBenefit.find();
    res.status(200).json({
      message: "data fetch successfully",
      advanceBanner,
      coachingCards,
    });
  } catch (error) {
    return res.status(500).json({ message: "error while fetching data" });
  }
});

// get store item
app.get(`/store`, async (req, res) => {
  try {
    const items = await Store.find();
    res.status(200).json({ message: "data fetch successfully", items });
  } catch (error) {
    res.status(500).json({ message: "problem while fetching data" });
  }
});

// <------- ROUTES ADMIN PANEL -------->

// add User by admin
app.post("/admin/addUser", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(404).json({ message: "user details not found" });
    }

    const userExists = await User.find({ email });
    if (userExists.length > 0) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      source: "user",
    });
    await newUser.save();
    res.status(200).json({ message: "user save successfully", newUser });
  } catch (error) {
    console.error("Error while saving data:", error);
    return res.status(500).json({ message: "problem while saving data" });
  }
});

// add admin by admin

app.post("/admin/addAdmin", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(404).json({ message: "user details not found" });
    }

    const userExists = await User.find({ email });
    if (userExists.length > 0) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      source: "admin",
    });
    await newUser.save();
    res.status(200).json({ message: "user save successfully", newUser });
  } catch (error) {
    return res.status(500).json({ message: "problem while saving data" });
  }
});

//  get user
app.get(`/admin/users`, async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ message: "data fetch succesfully", users });
  } catch (error) {
    res.status(500).json({ message: "error while getting data" });
  }
});

// Delete User
app.delete(`/admin/users/:id`, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      res.status(404).json({ message: "user not found" });
    }

    res.status(200).json({ message: "user delete successfully", deletedUser });
  } catch (error) {
    res.status(500).json({ message: "error while deleting", error });
  }
});

//edit user
app.put(`/admin/users/:id`, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email },
      { new: true }
    );
    res.status(200).json({ message: "User updated", updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error });
  }
});

// Add Testimonials save in db
app.post(`/admin/addTestimonials`, async (req, res) => {
  try {
    const { name, achievement, description, course, image } = req.body;

    if (!name || !achievement || !description || !course || !image) {
      return res.status(204).json({ message: "empty data received" });
    }

    const newtestimonial = new Testimonial({
      name,
      achievement,
      description,
      course,
      image,
    });
    await newtestimonial.save();
    res.status(200).json({ message: "testimonial data send successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "there was problem while saving data" });
  }
});

// Get Testimonial
app.get(`/admin/testimonials`, async (req, res) => {
  try {
    const testimonials = await Testimonial.find();
    res
      .status(200)
      .json({ message: "testimonial data fetch successfull", testimonials });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "problem while fetching testimonial data" });
  }
});

// Delete testimonial
app.delete(`/admin/testimonials/:id`, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedItem = await Testimonial.findByIdAndDelete(id);
    if (!deletedItem) {
      res.status(404).json({ message: "user not found" });
    }

    res.status(200).json({ message: "user delete successfully", deletedItem });
  } catch (error) {
    res.status(500).json({ message: "error while deleting", error });
  }
});

// edit testimonial
app.put(`/admin/testimonials/:id`, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, achievement, description, image } = req.body;

    const testimonialExists = await Testimonial.findById(id);
    if (!testimonialExists) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    const updatedTestimonial = await Testimonial.findByIdAndUpdate(
      id,
      { name, achievement, description, image },
      { new: true }
    );

    res
      .status(200)
      .json({ message: "Testimonial updated", updatedTestimonial });
  } catch (error) {
    console.error("Error updating testimonial:", error);
    res.status(500).json({ message: "Error updating testimonial", error });
  }
});

// add testimonial video
app.post(`/admin/addTestimonialVideo`, async (req, res) => {
  try {
    const { name, video } = req.body;

    if (!name || !video) {
      return res.status(204).json({ message: "empty data received" });
    }

    const newtestimonialVideo = new TestimonialVideo({
      name,
      video,
    });
    await newtestimonialVideo.save();
    res.status(200).json({ message: "testimonial data send successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "there was problem while saving data" });
  }
});

// get testimonial Video
app.get(`/admin/testimonialVideo`, async (req, res) => {
  try {
    const testimonialVideo = await TestimonialVideo.find();
    res.status(200).json({
      message: "testimonial data fetch successfull",
      testimonialVideo,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "problem while fetching testimonial data" });
  }
});

// delete testimonial video
app.delete(`/admin/testimonialVideo/:id`, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedItem = await TestimonialVideo.findByIdAndDelete(id);
    if (!deletedItem) {
      res.status(404).json({ message: "user not found" });
    }

    res.status(200).json({ message: "user delete successfully", deletedItem });
  } catch (error) {
    res.status(500).json({ message: "error while deleting", error });
  }
});

// add testimonial image
app.post(`/admin/addTestimonialImage`, async (req, res) => {
  try {
    const { name, image } = req.body;

    if (!name || !image) {
      return res.status(204).json({ message: "empty data received" });
    }

    const newtestimonialImage = new TestimonialImage({
      name,
      image,
    });
    await newtestimonialImage.save();
    res.status(200).json({ message: "testimonial data send successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "there was problem while saving data" });
  }
});

// get testimonial image
app.get(`/admin/testimonialImage`, async (req, res) => {
  try {
    const testimonialImage = await TestimonialImage.find();
    res.status(200).json({
      message: "testimonial data fetch successfull",
      testimonialImage,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "problem while fetching testimonial data" });
  }
});

// delete testimonial image
app.delete(`/admin/testimonialImage/:id`, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedItem = await TestimonialImage.findByIdAndDelete(id);
    if (!deletedItem) {
      res.status(404).json({ message: "user not found" });
    }

    res.status(200).json({ message: "user delete successfully", deletedItem });
  } catch (error) {
    res.status(500).json({ message: "error while deleting", error });
  }
});

// add curruculum
app.post(`/admin/addCurriculum`, async (req, res) => {
  try {
    const { heading, subHeading, keyPoints } = req.body;

    if (!heading || !subHeading || !keyPoints) {
      return res.status(204).json({ message: "empty data received" });
    }
    const newCurriculum = new Curriculum({
      heading,
      subHeading,
      keyPoints,
    });
    await newCurriculum.save();
    res.status(200).json({ message: "data save succesfully", newCurriculum });
  } catch (error) {
    return res.status(500).json({ message: "problem while saving data in db" });
  }
});

//get curriculum
app.get(`/admin/curriculum`, async (req, res) => {
  try {
    const curriculum = await Curriculum.find();
    res.status(200).json({ message: "data fetch successfully", curriculum });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "there was problem while getting data" });
  }
});

// delete curriculum
app.delete(`/admin/curriculum/:id`, async (req, res) => {
  try {
    const { id } = req.params;
    const deleteCurriculum = await Curriculum.findByIdAndDelete(id);
    res
      .status(200)
      .json({ message: "data delete successfully", deleteCurriculum });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "there was problem while deleting" });
  }
});

// edit curriculum
app.put(`/admin/curriculum/:id`, async (req, res) => {
  try {
    const { id } = req.params;
    const { heading, subHeading, keyPoints } = req.body;
    const updatedUser = await Curriculum.findByIdAndUpdate(
      id,
      { heading, subHeading, keyPoints },
      { new: true }
    );
    res.status(200).json({ message: "User updated", updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error });
  }
});

// add blog
app.post(`/admin/addBlog`, async (req, res) => {
  try {
    const { heading, description, image } = req.body;
    const newBlog = new Blog({
      heading,
      description,
      image,
    });
    await newBlog.save();
    res.status(200).json({ message: "data saved successfully", newBlog });
  } catch (error) {
    return res.status(500).json({ message: "error while saving data" });
  }
});

// get blog
app.get(`/admin/blogs`, async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.status(200).json({ message: "data send successfully", blogs });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "there is problem while sending data" });
  }
});

// delete blog
app.delete(`/admin/blogs/:id`, async (req, res) => {
  try {
    const { id } = req.params;
    const deleteBlog = await Blog.findByIdAndDelete(id);
    res.status(200).json({ message: "blog delete successfull", deleteBlog });
  } catch (error) {
    return res.status(500).json({ message: "error while deleting blog" });
  }
});

// edit blog
app.put(`/admin/blogs/:id`, async (req, res) => {
  try {
    const { id } = req.params;
    const { heading, description } = req.body;

    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      { heading, description },
      { new: true }
    );

    res.status(200).json({ message: "Blog updated", updatedBlog });
  } catch (error) {
    console.error("Error updating Blog:", error);
    res.status(500).json({ message: "Error updating Blog", error });
  }
});

// add courses
app.post(`/admin/addCourses`, async (req, res) => {
  try {
    const {
      title,
      description,
      curricullum,
      duration,
      price,
      image,
      courseLevel,
      video,
      videoName,
    } = req.body;

    const newCourse = new Course({
      title,
      description,
      duration,
      price,
      image,
      courseLevel,
      curricullum,
      video,
      videoName,
    });
    await newCourse.save();
    res.status(200).json({ message: "data save successfully", newCourse });
  } catch (error) {
    res.status(500).json({ message: "problem while saving data" });
  }
});

// get course
app.get(`/admin/course`, async (req, res) => {
  try {
    const courses = await Course.find();
    res.status(200).json({ message: "data send successfully", courses });
  } catch (error) {
    return res.status(500).json({ message: "problem while sending data" });
  }
});

// delete course
app.delete(`/admin/course/:id`, async (req, res) => {
  try {
    const { id } = req.params;
    const deleteCourse = await Course.findByIdAndDelete(id);
    return res
      .status(200)
      .json({ message: "course delete successfully", deleteCourse });
  } catch (error) {
    return res.status(500).json({ message: "problem while deleting course" });
  }
});

// edit course
app.put(`/admin/course/:id`, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, duration, price, courseLevel } = req.body;

    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      { title, description, duration, price, courseLevel },
      { new: true }
    );

    res.status(200).json({ message: "Course updated", updatedCourse });
  } catch (error) {
    console.error("Error updating Course:", error);
    res.status(500).json({ message: "Error updating Course", error });
  }
});

app.post("/admin/course/video/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, videoUrl } = req.body;

    const video = new CourseVideo({
      courseId,
      title,
      description,
      videoUrl,
    });

    await video.save();
    res.status(201).json({ message: "Video uploaded successfully", video });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all videos for a course
app.get("/admin/course/video/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;
    const videos = await CourseVideo.find({ courseId }).sort({ createdAt: -1 });
    res.json({ videos });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

function extractCloudinaryPublicId(url) {
  try {
    const parts = url.split("/");
    const fileName = parts[parts.length - 1]; // my_video.mp4
    const publicId = fileName.substring(0, fileName.lastIndexOf(".")); // my_video
    return parts[parts.length - 2] + "/" + publicId; // optional: include folder if used
  } catch (err) {
    console.error("Failed to extract Cloudinary public_id:", err);
    return null;
  }
}

// Delete a video
app.delete("/admin/course/video/:courseId/:videoId", async (req, res) => {
  try {
    const { videoId } = req.params;
    const video = await CourseVideo.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    const videoUrl = video.videoUrl;
    const publicId = extractCloudinaryPublicId(videoUrl);

    // Delete from Cloudinary
    if (publicId) {
      await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
    }

    await CourseVideo.findByIdAndDelete(videoId);
    res.json({ message: "Video deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
// add banner
app.post("/admin/addBanner", async (req, res) => {
  try {
    const { heading, description, image } = req.body;
    if (!heading || !description || !image) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const newBanner = new Banner({
      heading,
      description,
      image,
    });
    await newBanner.save();
    res.status(200).json({ message: "Banner added successfully", newBanner });
  } catch (error) {
    console.error("Error adding banner:", error);
    res.status(500).json({ message: "Error adding banner" });
  }
});

// get banner
app.get(`/admin/banner`, async (req, res) => {
  try {
    const banners = await Banner.find();
    res.status(200).json({ message: "data send successfully", banners });
  } catch (error) {
    return res.status(500).json({ message: "problem while sending data" });
  }
});

// delete banner
app.delete(`/admin/banner/:id`, async (req, res) => {
  try {
    const { id } = req.params;
    const deleteBanner = await Banner.findByIdAndDelete(id);
    res
      .status(200)
      .json({ message: "banner delete successfully", deleteBanner });
  } catch (error) {
    return res.status(500).json({ message: "problem while deleting banner" });
  }
});

// edit banner
app.put(`/admin/banner/:id`, async (req, res) => {
  try {
    const { id } = req.params;
    const { heading, description, image } = req.body;

    const updatedBanner = await Banner.findByIdAndUpdate(
      id,
      { heading, description, image },
      { new: true }
    );

    res.status(200).json({ message: "Banner updated", updatedBanner });
  } catch (error) {
    console.error("Error updating Banner:", error);
    res.status(500).json({ message: "Error updating Banner", error });
  }
});

// add Beginner banner
app.post("/admin/addBeginnerBanner", async (req, res) => {
  try {
    const { heading, description, image } = req.body;
    if (!heading || !description || !image) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const newBeginnerBanner = new BeginnerBanner({
      heading,
      description,
      image,
    });
    await newBeginnerBanner.save();
    res
      .status(200)
      .json({ message: "Banner added successfully", newBeginnerBanner });
  } catch (error) {
    console.error("Error adding banner:", error);
    res.status(500).json({ message: "Error adding banner" });
  }
});

// get Beginner banner
app.get(`/admin/BeginnerBanner`, async (req, res) => {
  try {
    const beginnerBanner = await BeginnerBanner.find();
    res.status(200).json({ message: "data send successfully", beginnerBanner });
  } catch (error) {
    return res.status(500).json({ message: "problem while sending data" });
  }
});

// delete beginner banner
app.delete(`/admin/BeginnerBanner/:id`, async (req, res) => {
  try {
    const { id } = req.params;
    const deleteBeginnerBanner = await BeginnerBanner.findByIdAndDelete(id);
    res
      .status(200)
      .json({ message: "banner delete successfully", deleteBeginnerBanner });
  } catch (error) {
    return res.status(500).json({ message: "problem while deleting banner" });
  }
});

// edit banner
app.put(`/admin/BeginnerBanner/:id`, async (req, res) => {
  try {
    const { id } = req.params;
    const { heading, description, image } = req.body;

    const updatedBeginnerBanner = await BeginnerBanner.findByIdAndUpdate(
      id,
      { heading, description, image },
      { new: true }
    );

    res.status(200).json({ message: "Banner updated", updatedBeginnerBanner });
  } catch (error) {
    console.error("Error updating Banner:", error);
    res.status(500).json({ message: "Error updating Banner", error });
  }
});

// add intermediate banner
app.post("/admin/addIntermediateBanner", async (req, res) => {
  try {
    const { heading, description, image } = req.body;
    if (!heading || !description || !image) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const newIntermediateBanner = new IntermediateBanner({
      heading,
      description,
      image,
    });
    await newIntermediateBanner.save();
    res
      .status(200)
      .json({ message: "Banner added successfully", newIntermediateBanner });
  } catch (error) {
    console.error("Error adding banner:", error);
    res.status(500).json({ message: "Error adding banner" });
  }
});

// get intermediate banner
app.get(`/admin/IntermediateBanner`, async (req, res) => {
  try {
    const intermediateBanner = await IntermediateBanner.find();
    res
      .status(200)
      .json({ message: "data send successfully", intermediateBanner });
  } catch (error) {
    return res.status(500).json({ message: "problem while sending data" });
  }
});

// delete beginner banner
app.delete(`/admin/IntermediateBanner/:id`, async (req, res) => {
  try {
    const { id } = req.params;
    const deleteIntermediateBanner = await IntermediateBanner.findByIdAndDelete(
      id
    );
    res.status(200).json({
      message: "banner delete successfully",
      deleteIntermediateBanner,
    });
  } catch (error) {
    return res.status(500).json({ message: "problem while deleting banner" });
  }
});

// edit banner
app.put(`/admin/IntermediateBanner/:id`, async (req, res) => {
  try {
    const { id } = req.params;
    const { heading, description, image } = req.body;

    const updatedIntermediateBanner =
      await IntermediateBanner.findByIdAndUpdate(
        id,
        { heading, description, image },
        { new: true }
      );

    res
      .status(200)
      .json({ message: "Banner updated", updatedIntermediateBanner });
  } catch (error) {
    console.error("Error updating Banner:", error);
    res.status(500).json({ message: "Error updating Banner", error });
  }
});

// add advance banner
app.post("/admin/addAdvanceBanner", async (req, res) => {
  try {
    const { heading, description, image } = req.body;
    if (!heading || !description || !image) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const newAdvanceBanner = new AdvanceBanner({
      heading,
      description,
      image,
    });
    await newAdvanceBanner.save();
    res
      .status(200)
      .json({ message: "Banner added successfully", newAdvanceBanner });
  } catch (error) {
    console.error("Error adding banner:", error);
    res.status(500).json({ message: "Error adding banner" });
  }
});

// get advance banner
app.get(`/admin/advanceBanner`, async (req, res) => {
  try {
    const advanceBanner = await AdvanceBanner.find();
    res.status(200).json({ message: "data send successfully", advanceBanner });
  } catch (error) {
    return res.status(500).json({ message: "problem while sending data" });
  }
});

// delete advance banner
app.delete(`/admin/advanceBanner/:id`, async (req, res) => {
  try {
    const { id } = req.params;
    const deleteAdvanceBanner = await AdvanceBanner.findByIdAndDelete(id);
    res
      .status(200)
      .json({ message: "banner delete successfully", deleteAdvanceBanner });
  } catch (error) {
    return res.status(500).json({ message: "problem while deleting banner" });
  }
});

// edit advance banner
app.put(`/admin/advanceBanner/:id`, async (req, res) => {
  try {
    const { id } = req.params;
    const { heading, description, image } = req.body;

    const updatedAdvanceBanner = await AdvanceBanner.findByIdAndUpdate(
      id,
      { heading, description, image },
      { new: true }
    );

    res.status(200).json({ message: "Banner updated", updatedAdvanceBanner });
  } catch (error) {
    console.error("Error updating Banner:", error);
    res.status(500).json({ message: "Error updating Banner", error });
  }
});

// add beginner benefit
app.post(`/admin/addBeginnerBenefit`, async (req, res) => {
  try {
    const { heading, description } = req.body;
    const newCard = new BeginnerBenefit({
      heading,
      description,
    });
    await newCard.save();
    res.status(200).json({ message: "data send successfull", newCard });
  } catch (error) {
    res
      .status(500)
      .json({ message: "there was error while saving data", error });
  }
});

// get beginner benefit
app.get(`/admin/beginnerBenefit`, async (req, res) => {
  try {
    const beginnerCard = await BeginnerBenefit.find();
    res.status(200).json({ message: "data send successfull", beginnerCard });
  } catch (error) {
    res.status(500).json({ message: "problem while sending data", error });
  }
});

// delete beginner benefit
app.delete(`/admin/beginnerBenefit/:id`, async (req, res) => {
  try {
    const { id } = req.params;
    const deleteBeginnerCard = await BeginnerBenefit.findByIdAndDelete(id);
    res
      .status(200)
      .json({ message: "card delete successfully", deleteBeginnerCard });
  } catch (error) {
    res.status(500).json({ message: "error while deleting" });
  }
});

// edit beginner benefit
app.put(`/admin/beginnerBenefit/:id`, async (req, res) => {
  try {
    const { id } = req.params;
    const { heading, description } = req.body;
    const editBeginnerBenefit = await BeginnerBenefit.findByIdAndUpdate(
      id,
      { heading, description },
      { new: true }
    );
    res
      .status(200)
      .json({ message: "card edit successfully", editBeginnerBenefit });
  } catch (error) {
    res.status(500).json({ message: "error while editing card" });
  }
});

// add intermediate benefit
app.post(`/admin/addIntermediateBenefit`, async (req, res) => {
  try {
    const { heading, description } = req.body;
    const newCard = new IntermediateBenefit({
      heading,
      description,
    });
    await newCard.save();
    res.status(200).json({ message: "data send successfull", newCard });
  } catch (error) {
    res
      .status(500)
      .json({ message: "there was error while saving data", error });
  }
});

// get intermediate benefit
app.get(`/admin/intermediateBenefit`, async (req, res) => {
  try {
    const intermediateCard = await IntermediateBenefit.find();
    res
      .status(200)
      .json({ message: "data send successfull", intermediateCard });
  } catch (error) {
    res.status(500).json({ message: "problem while sending data", error });
  }
});

// delete intermediate benefit
app.delete(`/admin/intermediateBenefit/:id`, async (req, res) => {
  try {
    const { id } = req.params;
    const deleteIntermediateCard = await IntermediateBenefit.findByIdAndDelete(
      id
    );
    res
      .status(200)
      .json({ message: "card delete successfully", deleteIntermediateCard });
  } catch (error) {
    res.status(500).json({ message: "error while deleting" });
  }
});

// edit intermediate benefit
app.put(`/admin/intermediateBenefit/:id`, async (req, res) => {
  try {
    const { id } = req.params;
    const { heading, description } = req.body;
    const editIntermediateBenefit = await IntermediateBenefit.findByIdAndUpdate(
      id,
      { heading, description },
      { new: true }
    );
    res
      .status(200)
      .json({ message: "card edit successfully", editIntermediateBenefit });
  } catch (error) {
    res.status(500).json({ message: "error while editing card" });
  }
});

// add advance benefit
app.post(`/admin/addAdvanceBenefit`, async (req, res) => {
  try {
    const { heading, description } = req.body;
    const newCard = new AdvanceBenefit({
      heading,
      description,
    });
    await newCard.save();
    res.status(200).json({ message: "data send successfull", newCard });
  } catch (error) {
    res
      .status(500)
      .json({ message: "there was error while saving data", error });
  }
});

// get advance benefit
app.get(`/admin/advanceBenefit`, async (req, res) => {
  try {
    const advanceCard = await AdvanceBenefit.find();
    res.status(200).json({ message: "data send successfull", advanceCard });
  } catch (error) {
    res.status(500).json({ message: "problem while sending data", error });
  }
});

// delete advance benefit
app.delete(`/admin/advanceBenefit/:id`, async (req, res) => {
  try {
    const { id } = req.params;
    const deleteAdvanceCard = await AdvanceBenefit.findByIdAndDelete(id);
    res
      .status(200)
      .json({ message: "card delete successfully", deleteAdvanceCard });
  } catch (error) {
    res.status(500).json({ message: "error while deleting" });
  }
});

// edit advance benefit
app.put(`/admin/advanceBenefit/:id`, async (req, res) => {
  try {
    const { id } = req.params;
    const { heading, description } = req.body;
    const editAdvanceBenefit = await AdvanceBenefit.findByIdAndUpdate(
      id,
      { heading, description },
      { new: true }
    );
    res
      .status(200)
      .json({ message: "card edit successfully", editAdvanceBenefit });
  } catch (error) {
    res.status(500).json({ message: "error while editing card" });
  }
});

// add item in store
app.post("/admin/addItem", async (req, res) => {
  try {
    const {
      heading,
      description,
      category,
      price,
      image,
      link,
      shortDescription,
    } = req.body;
    const newItem = new Store({
      heading,
      description,
      price,
      category,
      link,
      image,
      shortDescription,
    });
    await newItem.save();
    res.status(200).json({ message: "data save successfully", newItem });
  } catch (error) {
    res.status(500).json({ message: "problem while saving data" });
  }
});

// get item
app.get(`/admin/store`, async (req, res) => {
  try {
    const item = await Store.find();
    res.status(200).json({ message: "data fetch successfully", item });
  } catch (error) {
    res.status(500).json({ message: "there was problem while getting data" });
  }
});

// delete item
app.delete("/admin/store/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleteItem = await Store.findByIdAndDelete(id);
    res.status(200).json({ message: "item delete successfull", deleteItem });
  } catch (error) {
    res.status(500).json({ message: "problem while deleting item" });
  }
});

app.put(`/admin/store/:id`, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      heading,
      description,
      category,
      price,
      image,
      link,
      shortDescription,
    } = req.body;
    const editItem = await Store.findByIdAndUpdate(
      id,
      { heading, description, price, category, link, image, shortDescription },
      { new: true }
    );
    res.status(200).json({ message: "card edit successfully", editItem });
  } catch (error) {
    res.status(500).json({ message: "error while editing card" });
  }
});

app.listen(PORT, () => {
  console.log(`server is listening on ${PORT}`);
});
