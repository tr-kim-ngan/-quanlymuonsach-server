const mongoose = require('mongoose');

// Xóa cache của mô hình nếu đã tồn tại
if (mongoose.models['DonHang']) {
  delete mongoose.models['DonHang'];
}

const donHangSchema = new mongoose.Schema({
  MaDocGia: { type: mongoose.Schema.Types.ObjectId, ref: 'DocGia', required: true },
  items: [
    {
      MaSach: { type: mongoose.Schema.Types.ObjectId, ref: 'Sach', required: true },
      soLuong: { type: Number, required: true },
    },
  ],
  tongTien: { type: Number, required: true },
  trangThai: {
    type: String,
    enum: ['Chờ xử lý', 'Đang giao', 'Đã hoàn thành', 'Đã hủy'], // Các giá trị hợp lệ cho trạng thái đơn hàng
    default: 'Chờ xử lý',
  },
  ngayTao: { type: Date, default: Date.now },
  ngayCapNhat: { type: Date, default: Date.now },
}, { collection: 'DonHang' });

module.exports = mongoose.models.DonHang || mongoose.model('DonHang', donHangSchema);
