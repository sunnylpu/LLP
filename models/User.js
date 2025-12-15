const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    minlength: 6,
  },

  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  avatar: {
    type: String,
    default: '',
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local',
  },


  lastScore: {
    type: Number,
    default:0
  },
  bestScore:{
    type: Number,
    default:0
  },
  scoreHistory:[{
    score: Number,
    date:{type:Date,default: Date.now}
  }
  ],
  currentStreak:{
    type:Number,
    default:0
  },
  longestStreak:{
    type:Number,
    default:0
  },
  lastActiveDate:{
    type:Date,
    default:null
  },



  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },

  enrolledCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
  }],
  progress: {
    type: Map,
    of: {
      lessonsCompleted: { type: Number, default: 0 },
      vocabularyLearned: { type: Number, default: 0 },
      fluency: { type: Number, default: 0 },
    },
  },
  practiceTime: {
    type: Number,
    default: 0, // in minutes
  },
}, {
  timestamps: true,
});

// Hash password before saving (only if password exists and is modified)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

