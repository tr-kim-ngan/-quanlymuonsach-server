const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const nhaXuatBanSchema = new Schema({
  TenNXB: { type: String, required: true },
  DiaChi: { type: String, required: true },
   Gmail: { type: String, required: true, unique: true } 
}, { collection: 'NhaXuatBan' });

module.exports = mongoose.model('NhaXuatBan', nhaXuatBanSchema);
