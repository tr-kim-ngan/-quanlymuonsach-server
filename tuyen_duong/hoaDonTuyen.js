const express = require('express');
const tuyen = express.Router();
const HoaDon = require('../mo_hinh/HoaDon');
const TheoDoiMuonSach = require('../mo_hinh/TheoDoiMuonSach');


// Lấy tất cả hóa đơn (admin), có thể lọc theo trạng thái
tuyen.get('/', async (req, res) => {
  try {
    const { trangThai } = req.query;

    let query = {};
    if (trangThai) {
      query.trangThai = trangThai;
    }

    const hoaDons = await HoaDon.find(query).populate('items.MaSach MaDocGia');
    res.json(hoaDons);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách hóa đơn:', error);
    res.status(500).json({ message: 'Không thể lấy danh sách hóa đơn' });
  }
});

// Lấy danh sách hóa đơn của một độc giả
tuyen.get('/docgia/:MaDocGia', async (req, res) => {
  try {
    const hoaDons = await HoaDon.find({ MaDocGia: req.params.MaDocGia }).populate('items.MaSach MaDocGia');
    res.json(hoaDons);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách hóa đơn:', error);
    res.status(500).json({ message: 'Không thể lấy danh sách hóa đơn' });
  }
});

// Cập nhật trạng thái hóa đơn (xác nhận thanh toán)
tuyen.put('/:id', async (req, res) => {
  try {
   // const hoaDon = await HoaDon.findById(req.params.id);

   const { trangThai } = req.body;
     if (!trangThai) {
      return res.status(400).json({ message: 'Thiếu trạng thái cần cập nhật' });
    }
    const hoaDon = await HoaDon.findById(req.params.id).populate('items.MaSach');
    if (!hoaDon) {
      return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
    }

    //hoaDon.trangThai = req.body.trangThai;
    // await hoaDon.save();
    // Nếu trạng thái là "Đã thanh toán", tạo bản ghi trong bảng TheoDoiMuonSach
    hoaDon.trangThai = trangThai;
    if (trangThai === 'Đã thanh toán') {
      console.log("Dữ liệu hóa đơn trước khi lưu TheoDoiMuonSach:", hoaDon);

      // Tạo bản ghi TheoDoiMuonSach cho từng sách trong hóa đơn
      for (const item of hoaDon.items) {
        const theoDoiMuonData = {
          MaDocGia: hoaDon.MaDocGia,
          MaSach: item.MaSach._id || item.MaSach,
          NgayMuon: new Date(),
        };

        console.log("Dữ liệu theo dõi mượn sách chuẩn bị lưu:", theoDoiMuonData);

        try {
          const theoDoiMuon = new TheoDoiMuonSach(theoDoiMuonData);
          await theoDoiMuon.save();
          console.log(`Đã lưu TheoDoiMuonSach thành công cho sách: ${item.MaSach._id}`);
        } catch (error) {
          console.error("Lỗi khi lưu TheoDoiMuonSach:", error);
        }
      }
    }
    await hoaDon.save();

    res.json({ message: 'Cập nhật trạng thái thành công', hoaDon });
  } catch (error) {
    console.error('Lỗi khi cập nhật hóa đơn:', error);
    res.status(500).json({ message: 'Không thể cập nhật hóa đơn' });
  }
});

module.exports = tuyen;
