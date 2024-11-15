const MONGO_URI = 'mongodb://localhost:27017/QuanLyMuonSach'; // Đặt trực tiếp URL MongoDB vào đây
const CONG = 3000; // Đặt trực tiếp cổng vào đây

const express = require('express'); 
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer'); // Thư viện multer


const ungDung = express();
// Cấu hình CORS
const corsOptions = {
  origin: 'http://localhost:3001', // Địa chỉ của frontend (cổng 3001)
  optionsSuccessStatus: 200 // Đặt mã thành công cho các trình duyệt cũ
};

ungDung.use(cors(corsOptions));
ungDung.use(express.json());
// Cấu hình để phục vụ file tĩnh từ thư mục uploads
ungDung.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Cấu hình multer để lưu file ảnh
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Đặt thư mục lưu trữ ảnh
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Đặt tên file duy nhất
  }
});
const upload = multer({ storage });



// Kết nối tới MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('Đã kết nối MongoDB'))
  .catch(loi => console.log(loi));


// Import các tuyến đường (Route)
const docGiaTuyen = require('./tuyen_duong/docGiaTuyen');
const sachTuyen = require('./tuyen_duong/sachTuyen');
const nhaXuatBanTuyen = require('./tuyen_duong/nhaXuatBanTuyen');
const nhanVienTuyen = require('./tuyen_duong/nhanVienTuyen');
const theoDoiMuonSachTuyen = require('./tuyen_duong/theoDoiMuonSachTuyen');
const authTuyen = require('./tuyen_duong/authTuyen');

// Thêm các tuyến đường vào ứng dụng
ungDung.use('/api/docgia', docGiaTuyen);
ungDung.use('/api/sach', sachTuyen);
ungDung.use('/api/nhaxuatban', nhaXuatBanTuyen);
ungDung.use('/api/nhanvien', nhanVienTuyen);
ungDung.use('/api/theodoimuonsach', theoDoiMuonSachTuyen);
ungDung.use('/api/auth', authTuyen);
// Lắng nghe cổng
ungDung.listen(CONG, () => {
  console.log(`Máy chủ đang chạy trên cổng ${CONG}`);
});
