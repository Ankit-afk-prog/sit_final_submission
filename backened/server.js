const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');


const PORT = 5000;
const MONGO_URI = 'mongodb://localhost:27017/appointmentDB'; // REPLACE WITH YOUR MONGODB URI
const JWT_SECRET = 'YOUR_SUPER_SECRET_KEY'; // REPLACE WITH A STRONG SECRET


const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

connectDB();


const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

// Middleware to hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', UserSchema);

// Appointment Schema
const AppointmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
  },
  description: {
    type: String,
    default: '',
  }
}, {
  timestamps: true,
});

const Appointment = mongoose.model('Appointment', AppointmentSchema);



const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: '30d',
  });
};


const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      
      token = req.headers.authorization.split(' ')[1];

      
      const decoded = jwt.verify(token, JWT_SECRET);

      
      req.user = await User.findById(decoded.id).select('-password');

      if (req.user) {
         next();
      } else {
        res.status(401).json({ message: 'Not authorized, user not found' });
      }

    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};



const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const user = await User.create({
    username,
    email,
    password,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      message: 'Registration successful',
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

const authUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};


const getAppointments = async (req, res) => {
  const appointments = await Appointment.find({ user: req.user._id }).sort({ date: 1 });
  res.json(appointments);
};

const createAppointment = async (req, res) => {
  const { title, date, description } = req.body;

  if (!title || !date) {
    return res.status(400).json({ message: 'Please add a title and a date' });
  }

  const appointment = new Appointment({
    user: req.user._id,
    title,
    date,
    description,
  });

  const createdAppointment = await appointment.save();
  res.status(201).json(createdAppointment);
};

const deleteAppointment = async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return res.status(404).json({ message: 'Appointment not found' });
  }

  
  if (appointment.user.toString() !== req.user._id.toString()) {
    return res.status(401).json({ message: 'Not authorized to delete this appointment' });
  }

  await Appointment.deleteOne({ _id: appointment._id });
  res.json({ message: 'Appointment removed' });
};



const app = express();


app.use(cors()); 
app.use(express.json()); 


app.post('/api/auth/signup', registerUser);

app.post('/api/auth/login', authUser);


app.get('/api/appointments', protect, getAppointments);

app.post('/api/appointments', protect, createAppointment);

app.delete('/api/appointments/:id', protect, deleteAppointment);


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));