// // GioHang.js
// const mongoose = require('mongoose');

// const gioHangSchema = new mongoose.Schema({
//   MaDocGia: { type: mongoose.Schema.Types.ObjectId, ref: 'DocGia', required: true },
//   MaSach: { type: mongoose.Schema.Types.ObjectId, ref: 'Sach', required: true }, // Đảm bảo `ref` là 'Sach'
//   soLuong: { type: Number, required: true },
//   ngayCapNhat: { type: Date, default: Date.now }
// }, { collection: 'GioHang' });

// module.exports = mongoose.model('GioHang', gioHangSchema);

const mongoose = require('mongoose');

const gioHangSchema = new mongoose.Schema(
  {
    MaDocGia: { type: mongoose.Schema.Types.ObjectId, ref: 'DocGia', required: true },
    items: [
      {
        MaSach: { type: mongoose.Schema.Types.ObjectId, ref: 'Sach', required: true },
        soLuong: { type: Number, required: true, min: 1 },
      },
    ],
    ngayCapNhat: { type: Date, default: Date.now },
  },
  {
    collection: 'GioHang', // Khai báo rõ tên bảng là 'GioHang'
  }
);

module.exports = mongoose.model('GioHang', gioHangSchema);
