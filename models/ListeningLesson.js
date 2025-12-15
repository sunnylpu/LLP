const mongoose = require('mongoose');

const listeningLessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    audio: {
      type: String,
      required: true,
      trim: true,
    },
    transcript: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    category: {
      type: String,
      enum: ['Story', 'Conversation', 'Podcast', 'Practice', 'Real-life'],
      required: true,
    },
    duration: {
      type: Number, // seconds
      default: null,
    },
    quiz: [
      {
        question: { type: String },
        options: [{ type: String }],
        answer: { type: String },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('ListeningLesson', listeningLessonSchema);

