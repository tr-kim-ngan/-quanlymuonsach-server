const mongoose = require('mongoose');

const theoDoiMuonSachSchema = new mongoose.Schema({
  MaDocGia: { type: mongoose.Schema.Types.ObjectId, ref: 'DocGia', required: true },
  MaSach: { type: mongoose.Schema.Types.ObjectId, ref: 'Sach', required: true },
  NgayMuon: { type: Date, required: true },
  NgayTra: { type: Date },
}, { collection: 'TheoDoiMuonSach' });

module.exports = mongoose.model('TheoDoiMuonSach', theoDoiMuonSachSchema);
