// HoaDon.js
const mongoose = require('mongoose');

const hoaDonSchema = new mongoose.Schema({
  MaDocGia: { type: mongoose.Schema.Types.ObjectId, ref: 'DocGia', required: true },
  items: [
    {
      MaSach: { type: mongoose.Schema.Types.ObjectId, ref: 'Sach', required: true },
      soLuong: { type: Number, required: true, min: 1 },
      donGia: { type: Number, required: true }
    },
  ],
  tongTien: { type: Number, required: true },
  ngayTao: { type: Date, default: Date.now },
  trangThai: { type: String, enum: ['Chưa thanh toán', 'Đã thanh toán'], default: 'Chưa thanh toán' }
}, { collection: 'HoaDon' });

module.exports = mongoose.model('HoaDon', hoaDonSchema);
