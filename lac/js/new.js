document.getElementById('embed_logout').addEventListener('change', function(event) {
    if (event.target.value === 'logout') {
      localStorage.removeItem('loggedInUser');
      sessionStorage.removeItem('loggedInUser'); // Nếu bạn lưu ở sessionStorage thì xóa luôn cho chắc
      location.href = 'login.html';
    }
  });
  