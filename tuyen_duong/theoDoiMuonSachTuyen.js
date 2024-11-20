// theoDoiMuonSachTuyen.js
const express = require('express');
const tuyen = express.Router();
const DonHang = require('../mo_hinh/DonHang');
const TheoDoiMuonSach = require('../mo_hinh/TheoDoiMuonSach');
const DocGia = require('../mo_hinh/DocGia');

// Lấy tất cả lịch sử mượn sách
tuyen.get("/", async (req, res) => {
  try {
    const danhSach = await TheoDoiMuonSach.find()
      .populate("MaDocGia", "HoLot Ten DienThoai") // Lấy họ tên độc giả
      .populate("MaSach", "TenSach NgayHanMuon") // Lấy tên sách

      .sort({ NgayMuon: -1 }); // Sắp xếp theo ngày mượn mới nhất

    // Xử lý nếu `MaSach` hoặc `MaDocGia` bị null
    const danhSachDaXuLy = danhSach.map((record) => ({
      ...record.toObject(),
       TrangThai: record.TrangThai || (record.NgayTra ? "Đã trả" : "Đang mượn"),
      HoTen: record.MaDocGia
        ? `${record.MaDocGia.HoLot} ${record.MaDocGia.Ten}`
        : "N/A",
      DienThoai: record.MaDocGia ? record.MaDocGia.DienThoai : "N/A",
      TenSach: record.MaSach ? record.MaSach.TenSach : "N/A",
      NgayHanMuon: record.MaSach?.NgayHanMuon || "Không có hạn",
      soLuong: record.soLuong || "N/A",
    }));

    res.json(danhSachDaXuLy);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách TheoDoiMuonSach:", error);
    res
      .status(500)
      .json({ message: "Không thể lấy danh sách theo dõi mượn sách." });
  }
});
// Cập nhật trạng thái trả sách
// tuyen.put('/tra-sach/:id', async (req, res) => {
//   try {
//     // Tìm bản ghi theo dõi mượn sách
//     const theoDoi = await TheoDoiMuonSach.findById(req.params.id).populate('MaSach');

//     if (!theoDoi) {
//       return res.status(404).json({ message: 'Không tìm thấy bản ghi theo dõi mượn sách' });
//     }
//     theoDoi.TrangThai = 'Chờ xác nhận'; // Cập nhật trạng thái đã trả

//     // Kiểm tra giá trị soLuong, đảm bảo không phải undefined hoặc null
//     const soLuong = theoDoi.soLuong;
//     if (!soLuong || isNaN(soLuong)) {
//       return res.status(400).json({ message: 'Số lượng sách mượn không hợp lệ' });
//     }

//     // Cập nhật Ngày Trả
//     theoDoi.NgayTra = new Date(); // Ghi nhận ngày trả hiện tại

//     // Lấy thông tin sách
//     const sach = theoDoi.MaSach;

//     if (!sach) {
//       return res.status(404).json({ message: 'Không tìm thấy sách trong bản ghi theo dõi' });
//     }

//     // Cập nhật số lượng sách trong kho
//     sach.SoQuyen += soLuong; // Cộng lại số lượng sách đã mượn vào kho
//     await sach.save();

//     // Lưu lại bản ghi theo dõi mượn sách
//     await theoDoi.save();

//     res.json({ message: 'Trả sách thành công, số lượng sách đã được cập nhật', theoDoi });
//   } catch (error) {
//     console.error('Lỗi khi cập nhật trạng thái trả sách:', error);
//     res.status(500).json({ message: 'Không thể trả sách' });
//   }
// });

// Độc giả yêu cầu trả sách (trạng thái "Chờ xác nhận")
tuyen.put('/tra-sach/:id', async (req, res) => {
  try {
    // Tìm bản ghi theo dõi mượn sách
    const theoDoi = await TheoDoiMuonSach.findById(req.params.id);

    if (!theoDoi) {
      return res.status(404).json({ message: 'Không tìm thấy bản ghi theo dõi mượn sách' });
    }

    // Chuyển trạng thái thành "Chờ xác nhận"
    theoDoi.TrangThai = "Chờ xác nhận";
    await theoDoi.save();
    console.log("Trạng thái sau khi yêu cầu trả sách:", theoDoi.TrangThai);

    res.json({ message: 'Yêu cầu trả sách đã được gửi và đang chờ xác nhận.', theoDoi });
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái trả sách:', error);
    res.status(500).json({ message: 'Không thể gửi yêu cầu trả sách.' });
  }
});

// Xác nhận trả sách (dành cho admin)
tuyen.put('/xac-nhan-tra-sach/:id', async (req, res) => {
  try {
    // Tìm bản ghi theo dõi mượn sách
    const theoDoi = await TheoDoiMuonSach.findById(req.params.id).populate('MaSach');

    if (!theoDoi) {
      return res.status(404).json({ message: 'Không tìm thấy bản ghi theo dõi mượn sách' });
    }

    // Kiểm tra trạng thái phải là "Chờ xác nhận"
    if (theoDoi.TrangThai !== "Chờ xác nhận") {
      return res.status(400).json({ message: 'Chỉ có thể xác nhận những yêu cầu đang ở trạng thái "Chờ xác nhận"' });
    }

    // Cập nhật trạng thái thành "Đã trả"
    theoDoi.TrangThai = "Đã trả";
    theoDoi.NgayTra = new Date(); // Ghi nhận ngày trả hiện tại

    // Cập nhật số lượng sách trong kho
    const sach = theoDoi.MaSach;
    if (sach) {
      sach.SoQuyen += theoDoi.soLuong;
      await sach.save();
    }

    // Lưu thay đổi
    await theoDoi.save();
    console.log("Trạng thái sau khi xác nhận trả sách:", theoDoi.TrangThai);

    res.json({ message: 'Xác nhận trả sách thành công và cập nhật kho sách.', theoDoi });
  } catch (error) {
    console.error('Lỗi khi xác nhận trả sách:', error);
    res.status(500).json({ message: 'Không thể xác nhận trả sách.' });
  }
});


// Lấy thông tin mượn sách của một độc giả cụ thể
tuyen.get('/docgia/:id', async (req, res) => {
  try {
    // Lấy lịch sử mượn sách của độc giả dựa trên `MaDocGia`
    const theoDoi = await TheoDoiMuonSach.find({ MaDocGia: req.params.id }).populate('MaDocGia MaSach');
    if (!theoDoi || theoDoi.length === 0) {
      return res.status(404).json({ message: 'Không có sách đã mượn cho độc giả này' });
    }
    res.json(theoDoi);
  } catch (loi) {
    console.error('Lỗi khi lấy thông tin mượn sách:', loi);
    res.status(500).json({ message: loi.message });
  }
});
// Lấy danh sách sách đang mượn của một độc giả
tuyen.get('/dang-muon/:MaDocGia', async (req, res) => {
  try {
    const danhSach = await TheoDoiMuonSach.find({
      MaDocGia: req.params.MaDocGia,
      NgayTra: null, // Chỉ lấy sách chưa trả
      TrangThai: { $in: ["Đang mượn", "Chờ xác nhận", "Đã trả"] },
    })
      .populate('MaDocGia', 'HoLot Ten') // Lấy họ tên độc giả
      .populate('MaSach', 'TenSach NgayHanMuon'); // Lấy tên sách và hạn mượn

    // Xử lý dữ liệu trả về
    const danhSachDaXuLy = danhSach.map((record) => ({
      ...record.toObject(),
      HoTen: record.MaDocGia
        ? `${record.MaDocGia.HoLot} ${record.MaDocGia.Ten}`
        : 'N/A',
      TenSach: record.MaSach ? record.MaSach.TenSach : 'N/A',
      HanMuon: record.MaSach?.NgayHanMuon || 'Không có hạn',
      soLuong: record.soLuong || 'N/A',
      //TrangThai: record.NgayTra ? 'Đã trả' : 'Đang mượn',
       TrangThai: record.TrangThai, 
    }));

    res.json(danhSachDaXuLy);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách sách đang mượn:', error);
    res.status(500).json({ message: 'Không thể lấy danh sách sách đang mượn' });
  }
});




// Lấy danh sách sách đã trả của một độc giả
tuyen.get('/da-tra/:MaDocGia', async (req, res) => {
    try {
        const danhSach = await TheoDoiMuonSach.find({
            MaDocGia: req.params.MaDocGia,
            NgayTra: { $ne: null } // Đã trả sách
        }).populate('MaSach');

        res.json(danhSach);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách sách đã trả:', error);
        res.status(500).json({ message: 'Không thể lấy danh sách sách đã trả' });
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

  //Cập nhật thông tin mượn sách
  tuyen.put("/:id", async (req, res) => {
  try {
    const theoDoiCapNhat = await TheoDoiMuonSach.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(theoDoiCapNhat);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Lấy tất cả lịch sử mượn sách của khách hàng (bao gồm cả đang mượn và đã trả)
tuyen.get('/tat-ca/:MaDocGia', async (req, res) => {
  try {
    const danhSach = await TheoDoiMuonSach.find({
      MaDocGia: req.params.MaDocGia,
    })
      .populate('MaDocGia', 'HoLot Ten') // Lấy họ tên độc giả
      .populate('MaSach', 'TenSach NgayHanMuon'); // Lấy tên sách và hạn mượn

    // Xử lý dữ liệu trả về
    const danhSachDaXuLy = danhSach.map((record) => ({
      ...record.toObject(),
      HoTen: record.MaDocGia
        ? `${record.MaDocGia.HoLot} ${record.MaDocGia.Ten}`
        : 'N/A',
      TenSach: record.MaSach ? record.MaSach.TenSach : 'N/A',
      HanMuon: record.MaSach?.NgayHanMuon || 'Không có hạn',
      soLuong: record.soLuong || 'N/A',
      TrangThai: record.TrangThai || (record.NgayTra ? 'Đã trả' : 'Đang mượn'),
    }));

    res.json(danhSachDaXuLy);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách sách:', error);
    res.status(500).json({ message: 'Không thể lấy danh sách sách.' });
  }
});
// Lấy lịch sử mượn sách của một độc giả (bao gồm tất cả các trạng thái)
tuyen.get('/lich-su/:MaDocGia', async (req, res) => {
  try {
    const danhSach = await TheoDoiMuonSach.find({ MaDocGia: req.params.MaDocGia })
      .populate('MaDocGia', 'HoLot Ten DienThoai')
      .populate('MaSach', 'TenSach NgayHanMuon')
      .sort({ NgayMuon: -1 }); // Sắp xếp theo ngày mượn mới nhất

    const danhSachDaXuLy = danhSach.map((record) => ({
      ...record.toObject(),
      HoTen: record.MaDocGia
        ? `${record.MaDocGia.HoLot} ${record.MaDocGia.Ten}`
        : 'N/A',
      TenSach: record.MaSach ? record.MaSach.TenSach : 'N/A',
      HanMuon: record.MaSach?.NgayHanMuon || 'Không có hạn',
      soLuong: record.soLuong || 'N/A',
      TrangThai: record.TrangThai || (record.NgayTra ? "Đã trả" : "Đang mượn"),
    }));

    res.json(danhSachDaXuLy);
  } catch (error) {
    console.error('Lỗi khi lấy lịch sử mượn sách:', error);
    res.status(500).json({ message: 'Không thể lấy lịch sử mượn sách.' });
  }
});





// Xóa lịch sử mượn sách
tuyen.delete('/:id', async (req, res) => {
  try {
    const theoDoiMuon = await TheoDoiMuonSach.findById(req.params.id);

    if (!theoDoiMuon) {
      return res.status(404).json({ message: 'Không tìm thấy bản ghi theo dõi mượn sách' });
    }

    // Lấy số lượng và mã sách
    const { MaSach, soLuong } = theoDoiMuon;

    // Cập nhật lại số lượng sách tồn kho
    const sach = await Sach.findById(MaSach);
    if (sach) {
      sach.SoQuyen += soLuong; // Cộng lại số lượng vào kho
      await sach.save();
    }

    // Xóa bản ghi theo dõi mượn sách
    await TheoDoiMuonSach.findByIdAndDelete(req.params.id);

    res.json({ message: 'Trả sách thành công và cập nhật kho sách thành công' });
  } catch (error) {
    console.error('Lỗi khi trả sách:', error);
    res.status(500).json({ message: 'Không thể trả sách' });
  }
});

module.exports = tuyen;
