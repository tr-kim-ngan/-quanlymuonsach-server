const mongoose = require('mongoose');

const donHangSchema = new mongoose.Schema({
  MaDocGia: { type: mongoose.Schema.Types.ObjectId, ref: 'DocGia', required: true },
  items: [
    {
      MaSach: { type: mongoose.Schema.Types.ObjectId, ref: 'Sach', required: true },
      soLuong: { type: Number, required: true, min: 1 },
    },
  ],
  tongTien: { type: Number, required: true },
  trangThai: { 
    type: String, 
    enum: ['Chờ xử lý', 'Đang mượn', 'Đã trả', 'Đã hủy'], 
    default: 'Chờ xử lý' 
  },
  ngayTao: { type: Date, default: Date.now },
  ngayCapNhat: { type: Date, default: Date.now },
}, { collection: 'DonHang' }); // Đặt tên collection là 'DonHang'

module.exports = mongoose.model('DonHang', donHangSchema);
