const mongoose = require('mongoose');
const docGiaSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  HoLot: { type: String, required: true },
  Ten: { type: String, required: true },
  NgaySinh: { type: Date, required: true },
  Phai: { type: String, enum: ['Nam', 'Nữ'], required: true },
  DiaChi: { type: String, required: true },
  DienThoai: { type: String, required: true },
  Password: { type: String, required: true },
  role: { type: String, default: 'customer' }  
}, { collection: 'DocGia' });

module.exports = mongoose.model('DocGia', docGiaSchema);
