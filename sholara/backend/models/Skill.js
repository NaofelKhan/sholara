const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    title:      { type: String, required: true, trim: true },
    category:   { type: String, required: true, trim: true },
    image:      { type: String, required: true },
    topRated:   { type: Boolean, default: false },
    rating:     { type: Number, default: 0, min: 0, max: 5 },
    price:      { type: String, default: 'Free' },         // "Free" | "৳ 1,200/mo" etc.
    tutor: {
      name:     { type: String, required: true },
      role:     { type: String },
      avatar:   { type: String },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Skill', skillSchema);
