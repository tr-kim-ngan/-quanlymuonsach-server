const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const nhaXuatBanSchema = new Schema({
  TenNXB: { type: String, required: true },
  DiaChi: { type: String, required: true },
   Gmail: {
    type: String,
    required: true,
    unique: true, // Đảm bảo email không bị trùng
    validate: {
      validator: function (v) {
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
      },
      message: props => `${props.value} không phải là một địa chỉ email hợp lệ!`
    }
  },
}, { collection: 'NhaXuatBan' });

module.exports = mongoose.model('NhaXuatBan', nhaXuatBanSchema);
