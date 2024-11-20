
const mongoose = require('mongoose');

const theoDoiMuonSachSchema = new mongoose.Schema({
  MaDocGia: { type: mongoose.Schema.Types.ObjectId, ref: 'DocGia', required: true },
  MaSach: { type: mongoose.Schema.Types.ObjectId, ref: 'Sach', required: true },
  NgayMuon: { type: Date, default: Date.now, required: true },
  NgayTra: { type: Date } ,
  soLuong: { type: Number, required: true },
  TrangThai: { type: String, enum: ['Đang mượn', 'Chờ xác nhận', 'Đã trả'], default: 'Đang mượn' } // Thêm trạng thái

}, { collection: 'TheoDoiMuonSach' });

module.exports = mongoose.model('TheoDoiMuonSach', theoDoiMuonSachSchema);
