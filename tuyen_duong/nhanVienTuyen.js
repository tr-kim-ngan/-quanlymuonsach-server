// nhanVienTuyen.js
const express = require('express');
const tuyen = express.Router();
const NhanVien = require('../mo_hinh/NhanVien');

// Lấy tất cả nhân viên
tuyen.get('/', async (req, res) => {
  try {
    const nhanViens = await NhanVien.find();
    res.json(nhanViens);
  } catch (loi) {
    res.status(500).json({ message: loi.message });
  }
});

// Thêm nhân viên mới
tuyen.post('/', async (req, res) => {
  const nhanVien = new NhanVien(req.body);
  try {
    const nhanVienMoi = await nhanVien.save();
    res.status(201).json(nhanVienMoi);
  } catch (loi) {
    res.status(400).json({ message: loi.message });
  }
});

// Lấy thông tin nhân viên theo ID
tuyen.get('/:id', async (req, res) => {
  try {
    const nhanVien = await NhanVien.findById(req.params.id);
    if (!nhanVien) return res.status(404).json({ message: 'Không tìm thấy Nhân Viên' });
    res.json(nhanVien);
  } catch (loi) {
    res.status(500).json({ message: loi.message });
  }
});

// Cập nhật thông tin nhân viên
tuyen.put('/:id', async (req, res) => {
  try {
    const nhanVienCapNhat = await NhanVien.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(nhanVienCapNhat);
  } catch (loi) {
    res.status(400).json({ message: loi.message });
  }
});

// Xóa nhân viên
tuyen.delete('/:id', async (req, res) => {
  try {
    await NhanVien.findByIdAndDelete(req.params.id);
    res.json({ message: 'Nhân Viên đã bị xóa' });
  } catch (loi) {
    res.status(500).json({ message: loi.message });
  }
});

module.exports = tuyen;
