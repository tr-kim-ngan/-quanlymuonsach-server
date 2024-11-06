// docGiaTuyen.js
const express = require('express');
const tuyen = express.Router();
const DocGia = require('../mo_hinh/DocGia');

// Lấy tất cả độc giả
tuyen.get('/', async (req, res) => {
  try {
    const docGias = await DocGia.find();
    res.json(docGias);
  } catch (loi) {
    res.status(500).json({ message: loi.message });
  }
});

// Thêm độc giả mới
tuyen.post('/', async (req, res) => {
  const docGia = new DocGia(req.body);
  try {
    const docGiaMoi = await docGia.save();
    res.status(201).json(docGiaMoi);
  } catch (loi) {
    res.status(400).json({ message: loi.message });
  }
});

// Lấy thông tin độc giả theo ID
tuyen.get('/:id', async (req, res) => {
  try {
    const docGia = await DocGia.findById(req.params.id);
    if (!docGia) return res.status(404).json({ message: 'Không tìm thấy Độc Giả' });
    res.json(docGia);
  } catch (loi) {
    res.status(500).json({ message: loi.message });
  }
});

// Cập nhật thông tin độc giả
tuyen.put('/:id', async (req, res) => {
  try {
    const docGiaCapNhat = await DocGia.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(docGiaCapNhat);
  } catch (loi) {
    res.status(400).json({ message: loi.message });
  }
});

// Xóa độc giả
tuyen.delete('/:id', async (req, res) => {
  try {
    await DocGia.findByIdAndDelete(req.params.id);
    res.json({ message: 'Độc Giả đã bị xóa' });
  } catch (loi) {
    res.status(500).json({ message: loi.message });
  }
});

module.exports = tuyen;
