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
    const nhaXuatBanTonTai = await NhaXuatBan.findOne({ Gmail });
    if (nhaXuatBanTonTai) {
      return res.status(400).json({ message: 'Gmail này đã tồn tại trong hệ thống.' });
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
    const nhaXuatBanCapNhat = await NhaXuatBan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(nhaXuatBanCapNhat);
  } catch (loi) {
    res.status(400).json({ message: loi.message });
  }
});

// Xóa nhà xuất bản
// tuyen.delete('/:id', async (req, res) => {
//   try {
//     const nhaXuatBanId = req.params.id;
//     console.log("Đang kiểm tra sách liên quan đến nhà xuất bản:", nhaXuatBanId);
//     // Kiểm tra xem nhà xuất bản có sách liên quan không
//     const sachLienQuan = await Sach.findOne({ nhaXuatBan: nhaXuatBanId });
//     console.log("Kết quả kiểm tra sách liên quan:", sachLienQuan);
//     if (sachLienQuan) {
//       // Nếu có sách liên quan, không cho phép xóa
//       return res.status(400).json({ message: 'Không thể xóa nhà xuất bản, có sách liên quan.' });
//     }

//     // Nếu không có sách liên quan, tiếp tục xóa
//     await NhaXuatBan.findByIdAndDelete(nhaXuatBanId);
//     res.json({ message: 'Xóa nhà xuất bản thành công.' });
//   } catch (loi) {
//     console.error("Lỗi khi xóa nhà xuất bản:", loi);
//     res.status(500).json({ message: loi.message });
//   }
// });

// Xóa nhà xuất bản
tuyen.delete('/:id', async (req, res) => {
    try {
        const nhaXuatBanId = req.params.id;

        // Kiểm tra xem nhà xuất bản có được tham chiếu bởi sách nào không
        const sachLienQuan = await Sach.find({ MaNXB: nhaXuatBanId });
        if (sachLienQuan.length > 0) {
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
