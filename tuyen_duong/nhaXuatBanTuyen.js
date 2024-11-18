// nhaXuatBanTuyen.js
const express = require('express');
const tuyen = express.Router();
const NhaXuatBan = require('../mo_hinh/NhaXuatBan');
const Sach = require('../mo_hinh/Sach');

// Lấy tất cả nhà xuất bản
tuyen.get('/', async (req, res) => {
  try {
    const nhaXuatBans = await NhaXuatBan.find();
    res.json(nhaXuatBans);
  } catch (loi) {
    res.status(500).json({ message: loi.message });
  }
});

// Thêm nhà xuất bản mới
tuyen.post('/', async (req, res) => {
  try {
    // Kiểm tra xem Gmail đã tồn tại hay chưa
    const { Gmail } = req.body;
    // Kiểm tra tính hợp lệ của Gmail
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(Gmail)) {
      return res.status(400).json({ message: 'Địa chỉ Gmail không hợp lệ.' });
    }


    const nhaXuatBanTonTai = await NhaXuatBan.findOne({ Gmail });
    if (nhaXuatBanTonTai) {
      return res.status(400).json({ message: 'Gmail này đã tồn tại ' });
    }

    // Tạo mới nhà xuất bản nếu Gmail chưa tồn tại
    const nhaXuatBan = new NhaXuatBan(req.body);
    const nhaXuatBanMoi = await nhaXuatBan.save();
    res.status(201).json(nhaXuatBanMoi);
  } catch (loi) {
    console.error("Lỗi khi thêm nhà xuất bản:", loi);
    res.status(400).json({ message: loi.message });
  }
});
// Lấy thông tin nhà xuất bản theo ID
tuyen.get('/:id', async (req, res) => {
  try {
    const nhaXuatBan = await NhaXuatBan.findById(req.params.id);
    if (!nhaXuatBan) return res.status(404).json({ message: 'Không tìm thấy Nhà Xuất Bản' });
    res.json(nhaXuatBan);
  } catch (loi) {
    res.status(500).json({ message: loi.message });
  }
});

// Cập nhật thông tin nhà xuất bản
tuyen.put('/:id', async (req, res) => {
  try {
    const { Gmail, TenNXB, DiaChi } = req.body;

    // Kiểm tra tính hợp lệ của Gmail
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(Gmail)) {
      return res.status(400).json({ message: 'Địa chỉ Gmail không hợp lệ.' });
    }

    // Kiểm tra xem Gmail đã tồn tại ở nhà xuất bản khác
    const nhaXuatBanTonTai = await NhaXuatBan.findOne({ Gmail, _id: { $ne: req.params.id } });
    if (nhaXuatBanTonTai) {
      return res.status(400).json({ message: 'Gmail này đã tồn tại' });
    }

    // Cập nhật thông tin
    const nhaXuatBanCapNhat = await NhaXuatBan.findByIdAndUpdate(req.params.id, { TenNXB, DiaChi, Gmail }, { new: true });
    res.json(nhaXuatBanCapNhat);
  } catch (loi) {
    console.error("Lỗi khi cập nhật nhà xuất bản:", loi);
    res.status(400).json({ message: loi.message });
  }
});


// Xóa nhà xuất bản
tuyen.delete('/:id', async (req, res) => {
    try {
        const nhaXuatBanId = req.params.id;

        // Kiểm tra xem nhà xuất bản có được tham chiếu bởi sách nào không
        const sachLienQuan = await Sach.find({ MaNXB: nhaXuatBanId });
        console.log("Sách liên quan:", sachLienQuan); // Log thông tin sách liên quan

        if (sachLienQuan.length > 0) {
            // Trả về mã trạng thái 400 và thông báo cụ thể
            return res.status(400).json({ message: 'Không thể xóa nhà xuất bản vì có sách liên quan.' });
        }

        // Nếu không có sách liên quan, cho phép xóa
        await NhaXuatBan.findByIdAndDelete(nhaXuatBanId);
        res.status(200).json({ message: 'Xóa nhà xuất bản thành công.' });
    } catch (error) {
        console.error("Lỗi khi xóa nhà xuất bản:", error);
        res.status(500).json({ message: 'Có lỗi xảy ra khi xóa nhà xuất bản.' });
    }
});








module.exports = tuyen;
