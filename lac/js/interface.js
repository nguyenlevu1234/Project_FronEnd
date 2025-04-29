// Kiểm tra đăng nhập
if (localStorage.getItem("isLoggedIn") !== "true") {
  location.href = "../pages/login.html";
}



// Hiển thị thông báo ngắn
function showMessage(message, type = "success") {
  const msgBox = document.createElement("div");
  msgBox.textContent = message;
  msgBox.style.position = "fixed";
  msgBox.style.top = "20px";
  msgBox.style.right = "20px";
  msgBox.style.padding = "10px 20px";
  msgBox.style.backgroundColor = type === "error" ? "#e74c3c" : "#2ecc71";
  msgBox.style.color = "#fff";
  msgBox.style.borderRadius = "8px";
  msgBox.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
  msgBox.style.zIndex = 1000;
  document.body.appendChild(msgBox);

  setTimeout(() => msgBox.remove(), 3000);
}

// Khai báo biến
let monthData = {};
let currentMonth = "";
let editingCategoryIndex = null;

// Load dữ liệu từ localStorage
window.onload = function() {
  if (localStorage.getItem('monthData')) {
    monthData = JSON.parse(localStorage.getItem('monthData'));
  }
};

// Xử lý logout
document.getElementById('embed_logout').addEventListener('change', function(event) {
  if (event.target.value === 'logout') {
    // Xóa toàn bộ thông tin đăng nhập
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('isLoggedIn');   // <<< Thêm dòng này!
    sessionStorage.removeItem('loggedInUser');
    
    // Sau đó chuyển hướng về trang login
    location.href = '../pages/login.html'; // sửa path đúng luôn
  }
});


// Chọn tháng
document.getElementById("month_time").addEventListener("change", function() {
  currentMonth = this.value;
  if (!monthData[currentMonth]) {
    monthData[currentMonth] = { budget: 0, categories: [] };
  }
  loadMonthData();
});

// Lưu ngân sách tháng
document.getElementById("save-budget").addEventListener("click", function() {
  if (currentMonth === "") {
    showMessage("Vui lòng chọn tháng trước!", "error");
    return;
  }
  const budgetInput = document.getElementById("Budget_month");
  if (budgetInput.value.trim() === "") {
    showMessage("Vui lòng nhập ngân sách tháng!", "error");
    return;
  }
  monthData[currentMonth].budget = parseInt(budgetInput.value);
  saveData();
  showMessage("Đã lưu ngân sách tháng!");
  updateRemaining();
});

// Thêm danh mục
document.getElementById("add-category").addEventListener("click", function() {
  if (currentMonth === "") {
    showMessage("Vui lòng chọn tháng trước!", "error");
    return;
  }
  const nameInput = document.getElementById("Category_name");
  const limitInput = document.getElementById("limit");
  if (nameInput.value.trim() === "" || limitInput.value.trim() === "") {
    showMessage("Vui lòng nhập đầy đủ!", "error");
    return;
  }
  const category = {
    name: nameInput.value.trim(),
    limit: parseInt(limitInput.value)
  };
  monthData[currentMonth].categories.push(category);
  saveData();
  renderCategories();
  updateRemaining();
  showMessage("Đã thêm danh mục!");
  nameInput.value = "";
  limitInput.value = "";
});

// Render danh mục
function renderCategories() {
  const tableBody = document.querySelector(".box_4 table tbody");
  tableBody.innerHTML = "";
  if (!currentMonth || !monthData[currentMonth]) return;

  monthData[currentMonth].categories.forEach((cat, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${cat.name}</td>
      <td>${cat.limit.toLocaleString()} VND</td>
      <td>
        <a href="#" class="edit-btn" data-index="${index}">Sửa</a> | 
        <a href="#" class="delete-btn" data-index="${index}">Xóa</a>
      </td>
    `;
    tableBody.appendChild(row);
  });

  document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.addEventListener("click", function(e) {
      e.preventDefault();
      editCategory(parseInt(this.dataset.index));
    });
  });

  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", function(e) {
      e.preventDefault();
      deleteCategory(parseInt(this.dataset.index));
    });
  });
}

// Sửa danh mục
function editCategory(index) {
  const cat = monthData[currentMonth].categories[index];
  document.getElementById('edit-category-name').value = cat.name;
  document.getElementById('edit-category-limit').value = cat.limit;
  document.getElementById('edit-category-form').classList.remove('hidden');
  editingCategoryIndex = index;
}

// Lưu chỉnh sửa
document.getElementById('save-edit').onclick = function() {
  const nameInput = document.getElementById('edit-category-name');
  const limitInput = document.getElementById('edit-category-limit');

  if (nameInput.value.trim() === "" || limitInput.value.trim() === "") {
    showMessage("Vui lòng nhập đầy đủ!", "error");
    return;
  }

  if (editingCategoryIndex !== null) {
    const cat = monthData[currentMonth].categories[editingCategoryIndex];
    cat.name = nameInput.value.trim();
    cat.limit = parseInt(limitInput.value);
    saveData();
    renderCategories();
    updateRemaining();
    showMessage("Đã lưu chỉnh sửa!");
  }

  document.getElementById('edit-category-form').classList.add('hidden');
  editingCategoryIndex = null;
};

// Hủy chỉnh sửa
document.getElementById('cancel-edit').onclick = function() {
  document.getElementById('edit-category-form').classList.add('hidden');
  editingCategoryIndex = null;
};

// Xóa danh mục
function deleteCategory(index) {
  monthData[currentMonth].categories.splice(index, 1);
  saveData();
  renderCategories();
  updateRemaining();
  showMessage("Đã xóa danh mục!");
}

// Cập nhật số tiền còn lại
function updateRemaining() {
  const p1 = document.querySelector(".box_3 .p1");
  if (currentMonth && monthData[currentMonth]) {
    const spent = monthData[currentMonth].categories.reduce((sum, cat) => sum + cat.limit, 0);
    const remaining = monthData[currentMonth].budget - spent;
    p1.textContent = `${remaining.toLocaleString()} VND`;
  } else {
    p1.textContent = "0 VND";
  }
}

// Load dữ liệu khi chọn tháng
function loadMonthData() {
  if (!monthData[currentMonth]) return;
  document.getElementById("Budget_month").value = monthData[currentMonth].budget || "";
  renderCategories();
  updateRemaining();
}

// Lưu dữ liệu vào localStorage
function saveData() {
  localStorage.setItem('monthData', JSON.stringify(monthData));
}
