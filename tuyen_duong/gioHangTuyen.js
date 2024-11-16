// gioHangTuyen.js
const express = require('express');
const tuyen = express.Router();
const GioHang = require('../mo_hinh/GioHang');
const Sach = require('../mo_hinh/Sach');

// Lấy tất cả các mục trong giỏ hàng của một độc giả
// Lấy tất cả các mục trong giỏ hàng của một độc giả
tuyen.get('/:MaDocGia', async (req, res) => {
  try {
    const gioHang = await GioHang.findOne({ MaDocGia: req.params.MaDocGia }).populate('items.MaSach');
    if (!gioHang) {
      return res.status(404).json({ message: 'Không tìm thấy giỏ hàng cho độc giả này' });
    }
    res.json(gioHang);
  } catch (loi) {
    res.status(500).json({ message: loi.message });
  }
});



// Cập nhật số lượng của một mục trong giỏ hàng
tuyen.put('/:id', async (req, res) => {
  const { soLuong } = req.body;

  // Kiểm tra số lượng hợp lệ
  if (!soLuong || soLuong <= 0) {
    return res.status(400).json({ message: 'Số lượng không hợp lệ!' });
  }

  try {
    // Cập nhật số lượng mục trong giỏ hàng
    const gioHang = await GioHang.findOneAndUpdate(
      { 'items._id': req.params.id }, // Tìm mục trong giỏ hàng
      { $set: { 'items.$.soLuong': soLuong } }, // Cập nhật số lượng
      { new: true } // Lấy dữ liệu mới sau khi cập nhật
    ).populate('items.MaSach');

    if (!gioHang) {
      return res.status(404).json({ message: 'Không tìm thấy mục trong giỏ hàng' });
    }

    res.json(gioHang);
  } catch (error) {
    console.error('Lỗi khi cập nhật giỏ hàng:', error);
    res.status(500).json({ message: 'Không thể cập nhật giỏ hàng. Vui lòng thử lại sau.' });
  }
});



// Xóa một mục trong giỏ hàng
tuyen.delete('/:id', async (req, res) => {
  try {
    const gioHang = await GioHang.findOneAndUpdate(
      { 'items._id': req.params.id }, // Tìm mục có `_id` khớp
      { $pull: { items: { _id: req.params.id } } }, // Xóa mục đó khỏi `items`
      { new: true } // Lấy lại bản cập nhật sau khi xóa
    );

    if (!gioHang) {
      return res.status(404).json({ message: 'Không tìm thấy mục trong giỏ hàng để xóa' });
    }

    res.json({ message: 'Đã xóa mục khỏi giỏ hàng', gioHang });
  } catch (loi) {
    console.error('Lỗi khi xóa mục khỏi giỏ hàng:', loi);
    res.status(500).json({ message: 'Không thể xóa mục khỏi giỏ hàng' });
  }
});

// Xóa toàn bộ giỏ hàng của một độc giả
// Xóa tất cả các mục trong giỏ hàng của một độc giả
tuyen.delete('/xoa-het/:MaDocGia', async (req, res) => {
  try {
    const MaDocGia = req.params.MaDocGia;
    const gioHang = await GioHang.findOne({ MaDocGia });

    if (!gioHang) {
      return res.status(404).json({ message: 'Không tìm thấy giỏ hàng cho độc giả này' });
    }

    // Sử dụng updateOne để thiết lập mảng items về rỗng mà không vi phạm yêu cầu validation
    await GioHang.updateOne(
      { MaDocGia },
      { $set: { items: [], ngayCapNhat: Date.now() } }
    );

    res.json({ message: 'Tất cả các mục trong giỏ hàng đã được xóa' });
  } catch (loi) {
    res.status(500).json({ message: loi.message });
  }
});

tuyen.post('/', async (req, res) => {
   console.log("Dữ liệu nhận từ frontend:", req.body);
  const { MaDocGia, MaSach, soLuong } = req.body;

  // Kiểm tra dữ liệu đầu vào
  if (!MaDocGia || !MaSach || !soLuong || soLuong <= 0) {
    console.error("Dữ liệu không hợp lệ:", req.body);
    return res.status(400).json({ message: 'Thiếu thông tin cần thiết hoặc số lượng không hợp lệ!' });
  }

  try {
    // Kiểm tra giỏ hàng của độc giả
    let gioHang = await GioHang.findOne({ MaDocGia });

    if (!gioHang) {
      // Tạo giỏ hàng mới nếu chưa tồn tại
      gioHang = new GioHang({ MaDocGia, items: [] });
    }

    // Kiểm tra sản phẩm đã tồn tại trong giỏ hàng chưa
    const existingItemIndex = gioHang.items.findIndex(item => item.MaSach.toString() === MaSach);

    if (existingItemIndex > -1) {
      // Tăng số lượng nếu sản phẩm đã tồn tại
      gioHang.items[existingItemIndex].soLuong += soLuong;
    } else {
      // Thêm mới nếu sản phẩm chưa tồn tại
      gioHang.items.push({ MaSach, soLuong });
    }

    // Cập nhật ngày
    gioHang.ngayCapNhat = Date.now();
    const savedGioHang = await gioHang.save();
    res.status(201).json(savedGioHang);
  } catch (error) {
    console.error('Lỗi khi thêm vào giỏ hàng:', error);
    res.status(500).json({ message: 'Không thể thêm vào giỏ hàng. Vui lòng thử lại sau.' });
  }
});








module.exports = tuyen;
