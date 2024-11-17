
const mongoose = require('mongoose');

const theoDoiMuonSachSchema = new mongoose.Schema({
  MaDocGia: { type: mongoose.Schema.Types.ObjectId, ref: 'DocGia', required: true },
  MaSach: { type: mongoose.Schema.Types.ObjectId, ref: 'Sach', required: true },
  NgayMuon: { type: Date, default: Date.now, required: true },
  NgayTra: { type: Date } ,// Ngày trả có thể để trống nếu chưa trả
  soLuong: { type: Number, required: true }
}, { collection: 'TheoDoiMuonSach' });

module.exports = mongoose.model('TheoDoiMuonSach', theoDoiMuonSachSchema);
