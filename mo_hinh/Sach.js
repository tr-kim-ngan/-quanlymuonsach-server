const mongoose = require('mongoose');


const sachSchema = new mongoose.Schema({
 
  TenSach: { type: String, required: true },  
  DonGia: { type: Number, required: true },
  SoQuyen: { type: Number, required: true },
  NamXuatBan: { type: Number, required: true },
  MaNXB: { type: mongoose.Schema.Types.ObjectId, ref: 'NhaXuatBan', required: true },
  TacGia: { type: String, required: true },
  MoTa: { type: String, required: true },
  Anh: { type: String }, // Đường dẫn ảnh
  NgayHanMuon: { type: Number, required: true }
}, { collection: 'Sach' });

module.exports = mongoose.model('Sach', sachSchema);
