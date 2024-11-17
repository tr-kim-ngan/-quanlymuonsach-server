// theoDoiMuonSachTuyen.js
const express = require('express');
const tuyen = express.Router();
const DonHang = require('../mo_hinh/DonHang');
const TheoDoiMuonSach = require('../mo_hinh/TheoDoiMuonSach');
const DocGia = require('../mo_hinh/DocGia');

// Lấy tất cả lịch sử mượn sách
// Lấy tất cả lịch sử mượn sách
tuyen.get("/", async (req, res) => {
  try {
    const danhSach = await TheoDoiMuonSach.find()
      .populate("MaDocGia", "HoLot Ten") // Lấy họ tên độc giả
      .populate("MaSach", "TenSach NgayHanMuon") // Lấy tên sách

      .sort({ NgayMuon: -1 }); // Sắp xếp theo ngày mượn mới nhất

    // Xử lý nếu `MaSach` hoặc `MaDocGia` bị null
    const danhSachDaXuLy = danhSach.map((record) => ({
      ...record.toObject(),
      TrangThai: record.NgayTra ? "Đã trả" : "Đang mượn",
      HoTen: record.MaDocGia
        ? `${record.MaDocGia.HoLot} ${record.MaDocGia.Ten}`
        : "N/A",
      TenSach: record.MaSach ? record.MaSach.TenSach : "N/A",
      NgayHanMuon: record.MaSach?.NgayHanMuon || "Không có hạn",
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
tuyen.put('/tra-sach/:id', async (req, res) => {
  try {
    const theoDoi = await TheoDoiMuonSach.findById(req.params.id);
    if (!theoDoi) {
      return res.status(404).json({ message: 'Không tìm thấy bản ghi theo dõi mượn sách' });
    }

    // Cập nhật Ngày Trả
    theoDoi.NgayTra = new Date(); // Ghi nhận ngày trả hiện tại
    await theoDoi.save();

    res.json({ message: 'Trả sách thành công', theoDoi });
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái trả sách:', error);
    res.status(500).json({ message: 'Không thể trả sách' });
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
      TrangThai: record.NgayTra ? 'Đã trả' : 'Đang mượn',
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
