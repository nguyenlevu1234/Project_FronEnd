document.getElementById('transmit_login').addEventListener('click', function (e) {
    e.preventDefault();

    const email = document.getElementById('name_login').value.trim();
    const password = document.getElementById('password_login').value.trim();
    const errorDiv = document.getElementById('error_login');

    errorDiv.textContent = ''; // Reset thông báo lỗi

    // Kiểm tra input rỗng
    if (!email || !password) {
        errorDiv.textContent = 'Vui lòng nhập email và mật khẩu!';
        return;
    }

    // Lấy dữ liệu người dùng từ localStorage
    const storedUser = JSON.parse(localStorage.getItem('user'));

    // Kiểm tra dữ liệu người dùng
    if (!storedUser || !storedUser.email || !storedUser.password || email !== storedUser.email || password !== storedUser.password) {
        errorDiv.textContent = 'Email hoặc mật khẩu không đúng!';
        return;
    }

    // Đăng nhập thành công
    localStorage.setItem('isLoggedIn', 'true'); // Lưu trạng thái đăng nhập
    localStorage.setItem('loggedInUser', JSON.stringify({ email })); // Lưu thông tin user (tùy chọn)
    location.href = './interface.html'; // Chuyển hướng đến trang chính
});