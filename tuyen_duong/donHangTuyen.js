const express = require('express');
const tuyen = express.Router();
const DonHang = require('../mo_hinh/DonHang'); // Đường dẫn đến mô hình đơn hàng
const Sach = require('../mo_hinh/Sach'); // Đường dẫn đến mô hình sách
const HoaDon = require('../mo_hinh/HoaDon');


// Lấy danh sách các giá trị trạng thái trong cơ sở dữ liệu
tuyen.get('/distinct-trangThai', async (req, res) => {
  try {
    console.log('Bắt đầu truy vấn danh sách trạng thái...');
    const trangThaiValues = await DonHang.distinct('trangThai');
    console.log('Kết quả:', trangThaiValues);
    res.json({ trangThai: trangThaiValues });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách trạng thái:', error);
    res.status(500).json({ message: 'Không thể lấy danh sách đơn hàng.' });
  }
});

// Tạo đơn hàng mới
tuyen.post('/', async (req, res) => {
  try {
    const { MaDocGia, items, tongTien, tenNguoiNhan, soDienThoai, diaChi } = req.body;

    if (!MaDocGia || !items || !tongTien || !tenNguoiNhan || !soDienThoai || !diaChi) {
      return res.status(400).json({ message: 'Thiếu thông tin cần thiết' });
    }

    // Kiểm tra và cập nhật số lượng tồn kho
    for (const item of items) {
      const sach = await Sach.findById(item.MaSach);

      if (!sach) {
        return res.status(404).json({ message: `Không tìm thấy sách với ID: ${item.MaSach}` });
      }

      if (sach.SoQuyen < item.soLuong) {
        return res.status(400).json({
          message: `Số lượng sách "${sach.TenSach}" không đủ. Chỉ còn ${sach.SoQuyen} quyển.`,
        });
      }

      // Cập nhật số lượng tồn kho
      sach.SoQuyen -= item.soLuong;
      await sach.save();
       item.donGia = sach.DonGia; // Lưu giá sách vào item
    }

    // Tạo đơn hàng mới
    const donHang = new DonHang({
      MaDocGia,
      items,
      tongTien,
      trangThai: 'Chờ xử lý',
      tenNguoiNhan,
      soDienThoai,
      diaChi
    });

    const donHangDaLuu = await donHang.save();
    res.status(201).json(donHangDaLuu);
  } catch (error) {
    console.error('Lỗi khi tạo đơn hàng:', error);
    res.status(500).json({ message: 'Không thể tạo đơn hàng' });
  }
});

// Lấy danh sách đơn hàng của một độc giả (có phân trang)
tuyen.get('/:MaDocGia', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const donHangs = await DonHang.find({ MaDocGia: req.params.MaDocGia })
      .populate('items.MaSach') // Lấy thông tin sách
      .sort({ ngayTao: -1 }) // Sắp xếp theo ngày tạo, mới nhất lên trước
      .skip(skip)
      .limit(Number(limit));

    if (!donHangs || donHangs.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng nào' });
    }

    res.json(donHangs);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách đơn hàng:', error);
    res.status(500).json({ message: 'Không thể lấy danh sách đơn hàng' });
  }
});


// Cập nhật trạng thái đơn hàng
tuyen.put('/:id', async (req, res) => {
  try {
    const { trangThai } = req.body;

    if (!trangThai) {
      return res.status(400).json({ message: 'Thiếu trạng thái cần cập nhật' });
    }

    // Tìm đơn hàng
    const donHang = await DonHang.findById(req.params.id).populate('items.MaSach');
    if (!donHang) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    // Kiểm tra giá trị trạng thái hợp lệ
    const validStatuses = ['Chờ xử lý', 'Đang giao', 'Đã hoàn thành', 'Đã hủy'];
    if (!validStatuses.includes(trangThai)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ.' });
    }
    if (trangThai === 'Đã hủy') {
          for (const item of donHang.items) {
            const sach = await Sach.findById(item.MaSach);
            if (sach) {
              sach.SoQuyen += item.soLuong; // Cộng lại số lượng sách
              await sach.save();
            }
          }
    }

    // Cập nhật trạng thái và ngày cập nhật
    donHang.trangThai = trangThai;
    donHang.ngayCapNhat = Date.now();
    // Nếu trạng thái là "Đã hoàn thành", tạo hóa đơn
    if (trangThai === 'Đã hoàn thành') {
      console.log("Dữ liệu đơn hàng trước khi tạo hóa đơn:", donHang);

      const hoaDonData = {
        MaDocGia: donHang.MaDocGia,
        MaDonHang: donHang._id,
        items: donHang.items.map(item => ({
          MaSach: item.MaSach._id || item.MaSach,
          soLuong: item.soLuong,
          donGia: item.MaSach.DonGia || 0
        })),
        tongTien: donHang.tongTien,
        trangThai: 'Chưa thanh toán',
        
      };

      console.log("Dữ liệu hóa đơn chuẩn bị lưu:", hoaDonData);

      try {
        const hoaDon = new HoaDon(hoaDonData);
        await hoaDon.save();
        console.log(`Đã lưu hóa đơn thành công cho đơn hàng: ${donHang._id}`);
      } catch (error) {
        console.error("Lỗi khi lưu hóa đơn:", error);
      }
    }
     // Nếu trạng thái là "Đã hủy", cập nhật lại số lượng sách trong kho
   
    // Lưu lại đơn hàng
    await donHang.save();

    res.json({ message: 'Cập nhật trạng thái thành công', donHang });
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
    res.status(500).json({ message: 'Không thể cập nhật trạng thái đơn hàng' });
  }
});
// Cập nhật lại số lượng sách sau khi đơn hàng bị hủy
tuyen.put('/capnhat-soluong/:id', async (req, res) => {
  try {
    const donHang = await DonHang.findById(req.params.id);

    if (!donHang) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng để cập nhật số lượng sách' });
    }

    if (donHang.trangThai !== 'Đã hủy') {
      return res.status(400).json({ message: 'Chỉ có thể cập nhật lại số lượng sách khi đơn hàng ở trạng thái "Đã hủy"' });
    }

    // Cập nhật lại số lượng sách trong kho
    for (const item of donHang.items) {
      const sach = await Sach.findById(item.MaSach);
      if (sach) {
        sach.SoQuyen += item.soLuong; // Cộng lại số lượng sách
        await sach.save();
      }
    }

    res.json({ message: 'Số lượng sách đã được cập nhật sau khi đơn hàng bị hủy' });
  } catch (error) {
    console.error('Lỗi khi cập nhật số lượng sách:', error);
    res.status(500).json({ message: 'Không thể cập nhật số lượng sách' });
  }
});



// Hủy đơn hàng và cập nhật lại số lượng sách
tuyen.delete('/:id', async (req, res) => {
  try {
    const donHang = await DonHang.findById(req.params.id);

    if (!donHang) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng để hủy' });
    }

    if (donHang.trangThai !== 'Chờ xử lý') {
      return res.status(400).json({ message: 'Chỉ có thể hủy đơn hàng ở trạng thái "Chờ xử lý"' });
    }

    // Cập nhật trạng thái đơn hàng thành "Đã hủy"
    donHang.trangThai = 'Đã hủy';
    await donHang.save();

    // Cập nhật lại số lượng sách trong kho
    for (const item of donHang.items) {
      const sach = await Sach.findById(item.MaSach);
      if (sach) {
        sach.SoQuyen += item.soLuong; // Cộng lại số lượng sách
        await sach.save();
      }
    }

    res.json({ message: 'Đơn hàng đã bị hủy và số lượng sách đã được cập nhật' });
  } catch (error) {
    console.error('Lỗi khi hủy đơn hàng:', error);
    res.status(500).json({ message: 'Không thể hủy đơn hàng' });
  }
});

// Lấy tất cả đơn hàng (Admin)
tuyen.get('/', async (req, res) => {
  try {
    const donHangs = await DonHang.find()
      .populate('items.MaSach') // Lấy thông tin sách
      .sort({ ngayTao: -1 }); // Sắp xếp theo ngày tạo, mới nhất trước
    res.json(donHangs);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách đơn hàng:', error);
    res.status(500).json({ message: 'Không thể lấy danh sách đơn hàng' });
  }
});
// Cập nhật thông tin người nhận của đơn hàng
tuyen.put('/capnhat-thongtin/:id', async (req, res) => {
  try {
    const { tenNguoiNhan, soDienThoai, diaChi } = req.body;

    if (!tenNguoiNhan || !soDienThoai || !diaChi) {
      return res.status(400).json({ message: 'Thiếu thông tin cần thiết' });
    }

    // Tìm đơn hàng
    const donHang = await DonHang.findById(req.params.id);
    if (!donHang) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    // Cập nhật thông tin người nhận
    donHang.tenNguoiNhan = tenNguoiNhan;
    donHang.soDienThoai = soDienThoai;
    donHang.diaChi = diaChi;

    // Lưu lại đơn hàng
    await donHang.save();

    res.json({ message: 'Cập nhật thông tin thành công', donHang });
  } catch (error) {
    console.error('Lỗi khi cập nhật thông tin đơn hàng:', error);
    res.status(500).json({ message: 'Không thể cập nhật thông tin đơn hàng' });
  }
});


module.exports = tuyen;
