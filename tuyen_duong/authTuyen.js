const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); 
const NhanVien = require('../mo_hinh/NhanVien');
const DocGia = require('../mo_hinh/DocGia');
const tuyen = express.Router();

const JWT_SECRET = 'your_jwt_secret_key';


// Đăng ký tài khoản mới
tuyen.post('/register', async (req, res) => {
  try {
     
    const { username, Password, role, HoLot, Ten, NgaySinh, Phai, DiaChi, DienThoai } = req.body;
    console.log("Payload nhận từ client:", req.body);
    console.log("Password nhận được:", Password); // Kiểm tra giá trị password nhận từ client

    if (!Password) {
    return res.status(400).json({ message: "Mật khẩu không được để trống." });
    }

  
    const hashedPassword = await bcrypt.hash(Password, 10);

    let newUser;
    if (role === 'admin') {
       newUser = new NhanVien({
        HoTenNV: username,
        Password: hashedPassword,
        ChucVu: 'Admin',
        role: 'admin'
        
      });
    } else {
      newUser = new DocGia({
        username,
        HoLot,
        Ten,
        NgaySinh,
        Phai,
        DiaChi,
        DienThoai,
        Password: hashedPassword,
        role: 'customer'
      });
    }

    await newUser.save();
    res.status(201).json({ message: 'Đăng ký thành công! 🥳' });
  } catch (error) {
    console.error("Đăng ký thất bại:", error);
    res.status(400).json({ message: 'Tên đăng nhập đã tồn tại, vui lòng nhập tên khác 😔', error });

  }
});


// Đăng nhập
tuyen.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Kiểm tra xem người dùng là nhân viên hay độc giả
    let user = await NhanVien.findOne({ username });

    let role = 'customer'; // Mặc định là khách hàng

    if (!user) {
      user = await DocGia.findOne({ username });
    } else {
      role = 'admin';
    }

    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.Password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Mật khẩu không chính xác' });
    }

    const token = jwt.sign({ id: user._id, role }, JWT_SECRET, { expiresIn: '1h' });

    // Trả về thêm thông tin chi tiết người dùng
    const userInfo = {
      id: user._id,
      token,
      role,
      userName: user.HoTenNV || user.Ten || username,
      userFullName: user.HoTenNV || `${user.HoLot} ${user.Ten}`,
      userEmail: user.Email || "", // Nếu có email trong model
      userPosition: user.ChucVu || "",
      userAddress: user.DiaChi || "",
      userPhone: user.DienThoai || user.SoDienThoai || "",
      userFirstName: user.HoLot || "", // Họ Lót cho khách hàng
      userLastName: user.Ten || "", // Tên cho khách hàng
      userBirthDate: user.NgaySinh || "", // Ngày sinh cho khách hàng
      userGender: user.Phai || "" // Giới tính cho khách hàng
    };
    
    res.json(userInfo);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi đăng nhập', error });
  }
});


module.exports = tuyen;
