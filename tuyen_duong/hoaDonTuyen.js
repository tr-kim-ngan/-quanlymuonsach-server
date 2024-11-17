const express = require('express');
const tuyen = express.Router();
const mongoose = require('mongoose'); 
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
// Cập nhật trạng thái hóa đơn (xác nhận thanh toán)
tuyen.put('/:id', async (req, res) => {
  try {
    const { trangThai } = req.body;
    if (!trangThai) {
      return res.status(400).json({ message: 'Thiếu trạng thái cần cập nhật' });
    }

    const hoaDon = await HoaDon.findById(req.params.id).populate('items.MaSach');
    if (!hoaDon) {
      return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
    }

    hoaDon.trangThai = trangThai;

    // Nếu trạng thái là "Đã thanh toán", tạo bản ghi trong bảng TheoDoiMuonSach
    if (trangThai === 'Đã thanh toán') {
      console.log("Dữ liệu hóa đơn trước khi lưu TheoDoiMuonSach:", hoaDon);

      // Tạo bản ghi TheoDoiMuonSach cho từng sách trong hóa đơn
      for (const item of hoaDon.items) {
        const theoDoiMuonData = {
          MaDocGia: hoaDon.MaDocGia,
          MaSach: item.MaSach._id || item.MaSach,
          NgayMuon: new Date(),
          soLuong: item.soLuong // Lấy soLuong từ item của hóa đơn
        };

        console.log("Dữ liệu theo dõi mượn sách chuẩn bị lưu:", theoDoiMuonData);

        try {
          const theoDoiMuon = new TheoDoiMuonSach(theoDoiMuonData);
          await theoDoiMuon.save();
          console.log(`Đã lưu TheoDoiMuonSach thành công cho sách: ${item.MaSach._id || item.MaSach}`);
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



// Lấy chi tiết hóa đơn
// Lấy chi tiết hóa đơn
tuyen.get('/:id', async (req, res) => {
    try {
        const hoaDonId = req.params.id;

        // Kiểm tra nếu hoaDonId không phải là một ObjectId hợp lệ
        if (!mongoose.Types.ObjectId.isValid(hoaDonId)) {
            return res.status(400).json({ message: 'ID hóa đơn không hợp lệ' });
        }

        // Populate thêm MaDonHang để lấy thông tin người nhận
        const hoaDon = await HoaDon.findById(hoaDonId)
            .populate('items.MaSach')
            .populate('MaDocGia')
            .populate({
                path: 'MaDonHang',
                select: 'tenNguoiNhan soDienThoai diaChi'
            }); // Populate MaDonHang để lấy thông tin người nhận

        console.log("Chi tiết hóa đơn sau khi populate:", hoaDon);

        if (!hoaDon) {
            return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
        }

        // Nếu có thông tin từ MaDonHang, gán vào chi tiết hóa đơn
        if (hoaDon.MaDonHang) {
            hoaDon.set('tenNguoiNhan', hoaDon.MaDonHang.tenNguoiNhan || "Không có thông tin", { strict: false });
            hoaDon.set('soDienThoai', hoaDon.MaDonHang.soDienThoai || "Không có thông tin", { strict: false });
            hoaDon.set('diaChi', hoaDon.MaDonHang.diaChi || "Không có thông tin", { strict: false });
        } else {
            console.log("Không tìm thấy thông tin từ MaDonHang để populate.");
        }

        res.json(hoaDon);
    } catch (error) {
        console.error('Lỗi khi lấy chi tiết hóa đơn:', error);
        res.status(500).json({ message: 'Không thể lấy chi tiết hóa đơn' });
    }
});




// Tạo hóa đơn mới (sử dụng thông tin từ DonHang)
tuyen.post('/', async (req, res) => {
  try {
    const { MaDocGia, MaDonHang, items, tongTien, trangThai } = req.body;

    // Kiểm tra xem DonHang có tồn tại không
    const donHang = await DonHang.findById(MaDonHang);
    if (!donHang) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    // Tạo hóa đơn mới
    const hoaDon = new HoaDon({
      MaDocGia,
      MaDonHang,
      items,
      tongTien,
      trangThai,
      tenNguoiNhan: donHang.tenNguoiNhan,
      soDienThoai: donHang.soDienThoai,
      diaChi: donHang.diaChi,
    });

    await hoaDon.save();

    res.status(201).json({ message: 'Tạo hóa đơn thành công', hoaDon });
  } catch (error) {
    console.error('Lỗi khi tạo hóa đơn:', error);
    res.status(500).json({ message: 'Không thể tạo hóa đơn' });
  }
});

// Cập nhật trả hàng (trả lại sản phẩm về kho)
tuyen.put('/tra/:id', async (req, res) => {
    try {
        const hoaDonId = req.params.id;

        // Kiểm tra nếu hoaDonId không phải là một ObjectId hợp lệ
        if (!mongoose.Types.ObjectId.isValid(hoaDonId)) {
            return res.status(400).json({ message: 'ID hóa đơn không hợp lệ' });
        }

        // Tìm hóa đơn dựa trên ID
        const hoaDon = await HoaDon.findById(hoaDonId).populate('items.MaSach');
        if (!hoaDon) {
            return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
        }

        // Kiểm tra nếu hóa đơn chưa thanh toán hoặc đã trả
        if (hoaDon.trangThai !== 'Đã thanh toán') {
            return res.status(400).json({ message: 'Hóa đơn này chưa được thanh toán hoặc không thể trả lại' });
        }

        // Cập nhật số lượng sản phẩm trong kho
        for (const item of hoaDon.items) {
            const sach = await Sach.findById(item.MaSach._id);
            if (sach) {
                sach.SoQuyen += item.soLuong; // Cộng lại số lượng sách
                await sach.save();
            }
        }

        // Cập nhật trạng thái hóa đơn thành "Đã trả"
        hoaDon.trangThai = 'Đã trả';
        await hoaDon.save();

        res.json({ message: 'Trả sản phẩm thành công và cập nhật số lượng sách', hoaDon });
    } catch (error) {
        console.error('Lỗi khi trả sản phẩm:', error);
        res.status(500).json({ message: 'Không thể trả sản phẩm' });
    }
});



module.exports = tuyen;
