// Import thư viện cần thiết
const express = require('express');
const tuyen = express.Router();
const Sach = require('../mo_hinh/Sach');
const multer = require('multer');
const path = require('path');

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
            Anh: req.file ? req.file.filename : null // Lưu tên file ảnh
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
    await Sach.findByIdAndDelete(req.params.id);
    res.json({ message: 'Sách đã bị xóa' });
  } catch (loi) {
    res.status(500).json({ message: loi.message });
  }
});

module.exports = tuyen;
