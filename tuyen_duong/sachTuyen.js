// Import thư viện cần thiết
const express = require('express');
const tuyen = express.Router();
const Sach = require('../mo_hinh/Sach');
const multer = require('multer');
const path = require('path');
const DonHang = require('../mo_hinh/DonHang');
const HoaDon = require('../mo_hinh/HoaDon');
const TheoDoiMuonSach = require('../mo_hinh/TheoDoiMuonSach');



// Cấu hình multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

// Thêm sách mới
tuyen.post('/', upload.single('Anh'), async (req, res) => {
    try {
        const sachData = {
            ...req.body,
            Anh: req.file ? req.file.filename : null, // Lưu tên file ảnh
          NgayHanMuon: req.body.NgayHanMuon
          };
        const sach = new Sach(sachData);
        const sachMoi = await sach.save();
        res.status(201).json(sachMoi);
    } catch (loi) {
        console.error("Lỗi khi thêm sách:", loi);
        res.status(400).json({ message: loi.message });
    }
});

// Lấy tất cả sách
tuyen.get('/', async (req, res) => {
  try {
    const sachs = await Sach.find().populate('MaNXB');
    res.json(sachs);
  } catch (loi) {
    res.status(500).json({ message: loi.message });
  }
});



// Lấy thông tin sách theo ID
tuyen.get('/:id', async (req, res) => {
  try {
    const sach = await Sach.findById(req.params.id).populate('MaNXB');
    if (!sach) return res.status(404).json({ message: 'Không tìm thấy Sách' });
    res.json(sach);
  } catch (loi) {
    res.status(500).json({ message: loi.message });
  }
});

// Cập nhật thông tin sách
tuyen.put('/:id', upload.single('Anh'), async (req, res) => {
    try {
        // Tìm sách theo ID
        const sach = await Sach.findById(req.params.id);
        if (!sach) {
            return res.status(404).json({ message: 'Không tìm thấy Sách' });
        }

        // Cập nhật các trường thông tin từ req.body
        sach.TenSach = req.body.TenSach;
        sach.DonGia = req.body.DonGia;
        sach.SoQuyen = req.body.SoQuyen;
        sach.NamXuatBan = req.body.NamXuatBan;
        sach.MaNXB = req.body.MaNXB;
        
        sach.MoTa = req.body.MoTa;
         sach.TacGia = req.body.TacGia;
         sach.NgayHanMuon = req.body.NgayHanMuon;

        // Kiểm tra nếu có ảnh mới được upload
        if (req.file) {
            sach.Anh = req.file.filename; // Cập nhật tên file mới cho ảnh
        }

        // Lưu thay đổi
        const sachCapNhat = await sach.save();
        res.json(sachCapNhat);
    } catch (loi) {
        console.error("Lỗi khi cập nhật sách:", loi);
        res.status(400).json({ message: loi.message });
    }
});

// Xóa sách
tuyen.delete('/:id', async (req, res) => {
  try {
    const sachId = req.params.id;

    // Log ID của sách để kiểm tra
    console.log(`Đang xóa sách có ID: ${sachId}`);

    // Kiểm tra nếu sách này có trong đơn hàng
    const donHangCoSach = await DonHang.findOne({ 'items.MaSach': sachId });
    if (donHangCoSach) {
      console.log('Sách có trong đơn hàng, không thể xóa.');
      return res.status(400).json({ message: 'Không thể xóa sách vì có trong đơn hàng.' });
    }

    // Kiểm tra nếu sách này có trong hóa đơn
    const hoaDonCoSach = await HoaDon.findOne({ 'items.MaSach': sachId });
    if (hoaDonCoSach) {
      console.log('Sách có trong hóa đơn, không thể xóa.');
      return res.status(400).json({ message: 'Không thể xóa sách vì có trong hóa đơn.' });
    }

    // Kiểm tra nếu sách này có trong bảng theo dõi mượn sách
    const theoDoiMuonSachCoSach = await TheoDoiMuonSach.findOne({ MaSach: sachId });
    if (theoDoiMuonSachCoSach) {
      console.log('Sách có trong bảng theo dõi mượn sách, không thể xóa.');
      return res.status(400).json({ message: 'Không thể xóa sách vì có trong bảng theo dõi mượn sách.' });
    }

    // Nếu không có ràng buộc nào, tiến hành xóa sách
    await Sach.findByIdAndDelete(sachId);
    res.json({ message: 'Sách đã bị xóa thành công!' });
  } catch (loi) {
    console.error('Lỗi khi xóa sách:', loi);
    res.status(500).json({ message: loi.message });
  }
});






module.exports = tuyen;
