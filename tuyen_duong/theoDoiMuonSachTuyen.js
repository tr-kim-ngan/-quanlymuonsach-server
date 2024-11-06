// theoDoiMuonSachTuyen.js
const express = require('express');
const tuyen = express.Router();
const TheoDoiMuonSach = require('../mo_hinh/TheoDoiMuonSach');

// Lấy tất cả lịch sử mượn sách
tuyen.get('/', async (req, res) => {
  try {
    const theoDoi = await TheoDoiMuonSach.find().populate('MaDocGia MaSach');
    res.json(theoDoi);
  } catch (loi) {
    res.status(500).json({ message: loi.message });
  }
});

// Thêm lịch sử mượn sách mới
tuyen.post('/', async (req, res) => {
  const theoDoi = new TheoDoiMuonSach(req.body);
  try {
    const theoDoiMoi = await theoDoi.save();
    res.status(201).json(theoDoiMoi);
  } catch (loi) {
    res.status(400).json({ message: loi.message });
  }
});

// Lấy thông tin mượn sách theo ID
tuyen.get('/:id', async (req, res) => {
  try {
    const theoDoi = await TheoDoiMuonSach.findById(req.params.id).populate('MaDocGia MaSach');
    if (!theoDoi) return res.status(404).json({ message: 'Không tìm thấy lịch sử mượn sách' });
    res.json(theoDoi);
  } catch (loi) {
    res.status(500).json({ message: loi.message });
  }
});

// Cập nhật thông tin mượn sách
tuyen.put('/:id', async (req, res) => {
  try {
    const theoDoiCapNhat = await TheoDoiMuonSach.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(theoDoiCapNhat);
  } catch (loi) {
    res.status(400).json({ message: loi.message });
  }
});

// Xóa lịch sử mượn sách
tuyen.delete('/:id', async (req, res) => {
  try {
    await TheoDoiMuonSach.findByIdAndDelete(req.params.id);
    res.json({ message: 'Lịch sử mượn sách đã bị xóa' });
  } catch (loi) {
    res.status(500).json({ message: loi.message });
  }
});

module.exports = tuyen;
