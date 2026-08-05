const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    poster:      { type: String, required: true },
    icon:        { type: String, default: 'code' },
    iconBg:      { type: String, default: '#adc7f7' },
    iconColor:   { type: String, default: '#002045' },
    budget:      { type: String, default: 'Open' },
    btnLabel:    { type: String, default: 'Help' },
    status:      { type: String, enum: ['open', 'in-progress', 'closed'], default: 'open' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Request', requestSchema);
