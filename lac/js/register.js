document.getElementById('transmit_register').addEventListener('click', function (e) {
    e.preventDefault();

    const email = document.getElementById('name_user').value.trim();
    const password = document.getElementById('password_user').value.trim();
    const repassword = document.getElementById('repassword_user').value.trim();

    // Reset lỗi
    document.getElementById('error_email').textContent = '';
    document.getElementById('error_password').textContent = '';
    document.getElementById('error_repassword').textContent = '';

    let isValid = true;

    // Email
    if (!email) {
        document.getElementById('error_email').textContent = "Email không được để trống";
        isValid = false;
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            document.getElementById('error_email').textContent = "Email phải đúng định dạng";
            isValid = false;
        }
    }

    // Password
    if (!password) {
        document.getElementById('error_password').textContent = "Mật khẩu không được để trống";
        isValid = false;
    } 
    // else if (password.length < 6) {
    //     document.getElementById('error_password').textContent = "Mật khẩu tối thiểu 6 ký tự trở lên";
    //     isValid = false;
    // }

    // Repassword
    if (!repassword) {
        document.getElementById('error_repassword').textContent = "Mật khẩu xác nhận không được để trống";
        isValid = false;
    } else if (repassword !== password) {
        document.getElementById('error_repassword').textContent = "Mật khẩu xác nhận phải trùng khớp mật khẩu";
        isValid = false;
    }

    if (isValid) {
        // Lưu vào localStorage
        const user = {
            email: email,
            password: password
        };
        localStorage.setItem("user", JSON.stringify(user));
        
      location.href = "./login.html";
    }
});
