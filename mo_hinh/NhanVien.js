const mongoose = require('mongoose');

const nhanVienSchema = new mongoose.Schema({
  HoTenNV: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  Password: { type: String, required: true },
  role: { type: String, default: 'admin' },
  ChucVu: { type: String, required: true },
  DiaChi: { type: String, required: true },
  SoDienThoai: { type: String, required: true }
}, { collection: 'NhanVien' });

module.exports = mongoose.model('NhanVien', nhanVienSchema);
