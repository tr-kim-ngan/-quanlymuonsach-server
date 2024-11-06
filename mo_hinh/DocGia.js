const mongoose = require('mongoose');
const docGiaSchema = new mongoose.Schema({
  HoLot: { type: String, required: true },
  Ten: { type: String, required: true },
  NgaySinh: { type: Date, required: true },
  Phai: { type: String, enum: ['Nam', 'Nữ'], required: true },
  DiaChi: { type: String, required: true },
  DienThoai: { type: String, required: true }
}, { collection: 'DocGia' });

module.exports = mongoose.model('DocGia', docGiaSchema);
