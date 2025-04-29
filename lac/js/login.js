
document.getElementById('transmit_login').addEventListener('click', function (e) {
    e.preventDefault();

    const email = document.getElementById('name_login').value.trim();
    const password = document.getElementById('password_login').value.trim();
    const errorDiv = document.getElementById('error_login');

    errorDiv.textContent = ''; // reset lỗi

    // Lấy dữ liệu người dùng từ localStorage
    const storedUser = JSON.parse(localStorage.getItem('user'));

    // Kiểm tra
    if (!storedUser || email !== storedUser.email || password !== storedUser.password) {
        errorDiv.textContent = 'Email hoặc mật khẩu không đúng!';
        return;
    } else{
        location.href = './interface.html'; // bạn đổi sang trang chủ thật của bạn
        // Nếu đăng nhập thành công
        localStorage.setItem("isLoggedIn", "true").removeItem("isLoggedIn");
        sessionStorage.setItem("isLoggedIn", "true").removeItem("isLoggedIn");
    }

    // Đăng nhập thành công => chuyển sang trang chủ
    
});

