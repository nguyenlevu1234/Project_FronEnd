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
  msgBox.style.backgroundColor = 
    type === "error" ? "#e74c3c" : 
    type === "warning" ? "#f1c40f" : "#2ecc71";
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
let categoryToDeleteIndex = null;
let currentPage = 1;
const itemsPerPage = 5;
let sortOrder = "desc";

// Load dữ liệu từ localStorage
document.addEventListener('DOMContentLoaded', function() {
  if (localStorage.getItem('monthData')) {
    monthData = JSON.parse(localStorage.getItem('monthData'));

    // Làm sạch dữ liệu: Xóa các tháng không hợp lệ
    for (const month in monthData) {
      const hasValidData = monthData[month].budget > 0 || 
                         (monthData[month].categories && monthData[month].categories.length > 0) || 
                         (monthData[month].transactions && monthData[month].transactions.length > 0);
      if (!hasValidData) {
        delete monthData[month];
      }
    }
    saveData();
  }
  updateCategoryDropdown();
  loadMonthData();
  renderMonthlySummary();

  // Gắn sự kiện cho các nút trong modal
  document.getElementById('confirm-delete-btn').addEventListener('click', confirmDelete);
  document.getElementById('cancel-delete-btn').addEventListener('click', closeModal);
  document.getElementById('save-edit-btn').addEventListener('click', confirmEdit);
  document.getElementById('cancel-edit-btn').addEventListener('click', closeEditModal);
});

// Xử lý logout //ssssssssssssssssssssssssssssssssssssssssssssssssssssssssss
document.getElementById('embed_logout').addEventListener('change', function(event) {
  if (event.target.value === 'logout') {
    document.getElementById('logout-confirm').classList.remove('hidden');
  }
});

document.getElementById('confirm-yes').addEventListener('click', function() {
  localStorage.removeItem('loggedInUser');
  localStorage.removeItem('isLoggedIn');
  sessionStorage.removeItem('loggedInUser');
  location.href = '../pages/login.html';
});

document.getElementById('confirm-no').addEventListener('click', function() {
  document.getElementById('logout-confirm').classList.add('hidden');
  document.getElementById('embed_logout').value = 'account';
});

// Chọn tháng
document.getElementById("month_time").addEventListener("change", function(event) {
  const selectedMonth = event.target.value;
  if (!monthData[selectedMonth]) {
    monthData[selectedMonth] = { budget: 0, categories: [], transactions: [] };
  }
  currentMonth = selectedMonth;
  currentPage = 1;
  saveData();
  loadMonthData();
});

// Lưu ngân sách tháng
document.getElementById("save-budget").addEventListener("click", function() {
  if (currentMonth === "") {
    showMessage("Vui lòng chọn tháng trước!", "error");
    return;
  }
  const budgetInput = document.getElementById("Budget_month");
  if (budgetInput.value.trim() === "" || isNaN(budgetInput.value)) {
    showMessage("Vui lòng nhập ngân sách tháng hợp lệ!", "error");
    return;
  }
  monthData[currentMonth].budget = parseInt(budgetInput.value);
  saveData();
  showMessage("Đã lưu ngân sách tháng!");
  updateRemaining();
  checkBudgetWarning();
  renderMonthlySummary();
});


// Thêm danh mục
document.getElementById("add-category").addEventListener("click", function() {
  if (currentMonth === "") {
    showMessage("Vui lòng chọn tháng trước!", "error");
    return;
  }
  const nameInput = document.getElementById("Category_name");
  const limitInput = document.getElementById("limit");
  if (nameInput.value.trim() === "" || limitInput.value.trim() === "" || isNaN(limitInput.value)) {
    showMessage("Vui lòng nhập đầy đủ và giới hạn hợp lệ!", "error");
    return;
  }
  const category = {
    name: nameInput.value.trim(),
    limit: parseInt(limitInput.value)
  };
  monthData[currentMonth].categories.push(category);
  saveData();
  renderCategories();
  updateCategoryDropdown();
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
  editingCategoryIndex = index;
  const cat = monthData[currentMonth].categories[index];
  document.getElementById('edit-category-name').value = cat.name;
  document.getElementById('edit-category-limit').value = cat.limit;
  openEditModal();
}

function openEditModal() {
  document.getElementById('editModal').style.display = 'flex';
}

function closeEditModal() {
  document.getElementById('editModal').style.display = 'none';
  editingCategoryIndex = null;
}4

function confirmEdit() {
  const nameInput = document.getElementById('edit-category-name').value.trim();
  const limitInput = parseInt(document.getElementById('edit-category-limit').value.trim());

  if (nameInput === "" || isNaN(limitInput)) {
    showMessage("Vui lòng nhập đầy đủ và giới hạn hợp lệ!", "error");
    return;
  }

  if (editingCategoryIndex !== null) {
    monthData[currentMonth].categories[editingCategoryIndex] = {
      name: nameInput,
      limit: limitInput
    };
    saveData();
    renderCategories();
    updateCategoryDropdown();
    showMessage("Đã cập nhật danh mục!");
  }

  closeEditModal();
}

// Xóa danh mục
function deleteCategory(index) {
  const hasTransactions = monthData[currentMonth].transactions?.some(trans => trans.categoryIndex === index);
  if (hasTransactions) {
    showMessage("Không thể xóa danh mục vì đã có giao dịch liên quan!", "error");
    return;
  }
  categoryToDeleteIndex = index;
  openModal();
}

function confirmDelete() {
  if (categoryToDeleteIndex !== null) {
    monthData[currentMonth].categories.splice(categoryToDeleteIndex, 1);
    saveData();
    renderCategories();
    updateCategoryDropdown();
    showMessage("Đã xóa danh mục!");
    categoryToDeleteIndex = null;
    closeModal();
  }
}

function openModal() {
  document.getElementById('confirmModal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('confirmModal').style.display = 'none';
  categoryToDeleteIndex = null;
}

// Cập nhật dropdown danh mục
function updateCategoryDropdown() {
  const dropdown = document.getElementById("expense-category");
  dropdown.innerHTML = '<option value="" disabled selected>Chọn danh mục</option>';
  if (currentMonth && monthData[currentMonth] && monthData[currentMonth].categories) {
    monthData[currentMonth].categories.forEach((cat, index) => {
      const option = document.createElement("option");
      option.value = index;
      option.textContent = cat.name;
      dropdown.appendChild(option);
    });
  }
}






// Thêm giao dịch
document.getElementById("add-expense").addEventListener("click", function() {
  if (currentMonth === "") {
    showMessage("Vui lòng chọn tháng trước!", "error");
    return;
  }
  const categoryIndex = document.getElementById("expense-category").value;
  const amountInput = document.getElementById("expense-amount");
  const noteInput = document.getElementById("expense-note");
  if (categoryIndex === "" || amountInput.value.trim() === "" || isNaN(amountInput.value)) {
    showMessage("Vui lòng chọn danh mục và nhập số tiền hợp lệ!", "error");
    return;
  }

  const amount = parseInt(amountInput.value);
  const category = monthData[currentMonth].categories[categoryIndex];
//  categoryIndex là chuỗi nhưng dùng như số → cần ép kiểu rõ ràng
// categories là mảng, không phải object, nên cần index đúng
// Nếu option không set đúng value, hoặc categories không đúng tháng → sẽ lỗi

  
  // Kiểm tra giới hạn danh mục
  const categorySpent = monthData[currentMonth].transactions?.filter(trans => trans.categoryIndex === parseInt(categoryIndex))
    .reduce((sum, trans) => sum + trans.amount, 0) || 0;
  const newCategorySpent = categorySpent + amount;

  if (newCategorySpent > category.limit) {
    showMessage(`Chi tiêu vượt giới hạn danh mục ${category.name}! (Giới hạn: ${category.limit.toLocaleString()} VND)`, "error");
  }

  // Cảnh báo nếu vượt ngân sách tháng nhưng vẫn cho phép thêm
  const totalSpent = monthData[currentMonth].transactions?.reduce((sum, trans) => sum + trans.amount, 0) || 0;
  const newTotalSpent = totalSpent + amount;
  if (newTotalSpent > monthData[currentMonth].budget && monthData[currentMonth].budget > 0) {
    showMessage(`Cảnh báo: Giao dịch vượt ngân sách tháng! (Ngân sách: ${monthData[currentMonth].budget.toLocaleString()} VND)`, "warning");
  }

  const transaction = {
    categoryIndex: parseInt(categoryIndex),
    amount: amount,
    note: noteInput.value.trim() || "Không có ghi chú",
    date: new Date().toISOString()
  };
  if (!monthData[currentMonth].transactions) {
    monthData[currentMonth].transactions = [];
  }
  monthData[currentMonth].transactions.push(transaction);
  saveData();
  renderTransactions();
  updateRemaining();
  checkBudgetWarning();
  renderMonthlySummary();
  showMessage("Đã thêm giao dịch!");
  amountInput.value = "";
  noteInput.value = "";
  document.getElementById("expense-category").value = "";
});

// Render giao dịch
function renderTransactions(transactions = monthData[currentMonth]?.transactions || []) {
  const transactionList = document.querySelector(".transaction-list");
  transactionList.innerHTML = `
    <li class="transaction-header">
      <span>Danh mục</span>
      <span>Ghi chú</span>
      <span>Số tiền</span>
      <span>Hành động</span>
    </li>
  `;

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedTransactions = transactions.slice(start, end);

  paginatedTransactions.forEach((trans, index) => {
    const globalIndex = start + index;
    const li = document.createElement("li");
    const categoryName = monthData[currentMonth].categories[trans.categoryIndex]?.name || "Không xác định";
    li.innerHTML = `
      <span>${categoryName}</span>
      <span>${trans.note}</span>
      <span>${trans.amount.toLocaleString()} VND</span>
      <span><a href="#" class="delete-trans-btn" data-index="${globalIndex}" aria-label="Xóa giao dịch ${trans.note}">Xóa</a></span>
    `;
    transactionList.appendChild(li);
  });

  document.querySelectorAll(".delete-trans-btn").forEach(btn => {
    btn.addEventListener("click", function(e) {
      e.preventDefault();
      const index = parseInt(this.dataset.index);
      monthData[currentMonth].transactions.splice(index, 1);
      saveData();
      renderTransactions();
      updateRemaining();
      checkBudgetWarning();
      renderMonthlySummary();
      showMessage("Đã xóa giao dịch!");
    });
  });

  updatePagination(transactions.length);
}

// Cập nhật phân trang
function updatePagination(totalItems) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const pagination = document.querySelector(".pagination");
  pagination.innerHTML = `
    <button class="prev" type="button" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>
  `;
  for (let i = 1; i <= totalPages; i++) {
    pagination.innerHTML += `
      <button class="page ${i === currentPage ? 'active' : ''}" type="button">${i}</button>
    `;
  }
  pagination.innerHTML += `
    <button class="next" type="button" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>
  `;

  document.querySelectorAll(".page").forEach(btn => {
    btn.addEventListener("click", () => {
      currentPage = parseInt(btn.textContent);
      renderTransactions();
    });
  });

  document.querySelector(".prev").addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderTransactions();
    }
  });

  document.querySelector(".next").addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderTransactions();
    }
  });
}

// Tìm kiếm giao dịch
document.querySelector(".search-btn").addEventListener("click", function() {
  const searchText = document.getElementById("search-text").value.toLowerCase();
  const filteredTransactions = monthData[currentMonth].transactions.filter(trans =>
    trans.note.toLowerCase().includes(searchText) ||
    monthData[currentMonth].categories[trans.categoryIndex]?.name.toLowerCase().includes(searchText)
  );
  currentPage = 1;
  renderTransactions(filteredTransactions);
});

// Sắp xếp giao dịch
document.querySelector(".sort-btn").addEventListener("click", function() {
  sortOrder = sortOrder === "desc" ? "asc" : "desc";
  this.textContent = `Sắp xếp theo giá (${sortOrder === "desc" ? "giảm dần" : "tăng dần"})`;
  const sortedTransactions = [...monthData[currentMonth].transactions].sort((a, b) =>
    sortOrder === "desc" ? b.amount - a.amount : a.amount - b.amount
  );
  renderTransactions(sortedTransactions);
});

// Cập nhật số tiền còn lại
function updateRemaining() {
  const p1 = document.querySelector(".box_3 .p1");
  const remainingSpan = document.querySelector(".box_1 .remaining");
  if (currentMonth && monthData[currentMonth]) {
    const spent = monthData[currentMonth].transactions?.reduce((sum, trans) => sum + trans.amount, 0) || 0;
    const remaining = monthData[currentMonth].budget - spent;
    p1.textContent = `${remaining.toLocaleString()} VND`;
    remainingSpan.textContent = `Còn lại: ${remaining.toLocaleString()} VND`;
  } else {
    p1.textContent = "0 VND";
    remainingSpan.textContent = "Còn lại: 0 VND";
  }
}

// Kiểm tra cảnh báo ngân sách/danh mục
function checkBudgetWarning() {
  const warningBox = document.querySelector(".box_7");
  const warningMessage = document.getElementById("warning-message");
  if (!currentMonth || !monthData[currentMonth]) {
    warningBox.classList.add("hidden");
    return;
  }

  const totalSpent = monthData[currentMonth].transactions?.reduce((sum, trans) => sum + trans.amount, 0) || 0;
  const budget = monthData[currentMonth].budget;

  if (totalSpent > budget && budget > 0) {
    warningBox.classList.remove("hidden");
    warningMessage.textContent = `Dư nợ vượt ngân sách: ${totalSpent.toLocaleString()} / ${budget.toLocaleString()} VND`;
    return;
  }

  let categoryWarning = "";
  monthData[currentMonth].categories.forEach((cat, index) => {
    const categorySpent = monthData[currentMonth].transactions?.filter(trans => trans.categoryIndex === index)
      .reduce((sum, trans) => sum + trans.amount, 0) || 0;
    if (categorySpent > cat.limit) {
      categoryWarning += `Danh mục ${cat.name} vượt giới hạn: ${categorySpent.toLocaleString()} / ${cat.limit.toLocaleString()} VND. `;
    }
  });

  if (categoryWarning) {
    warningBox.classList.remove("hidden");
    warningMessage.textContent = categoryWarning;
  } else {
    warningBox.classList.add("hidden");
  }
}

// Render thống kê chi tiêu các tháng
function renderMonthlySummary() {
  const tbody = document.getElementById("summary-body");
  const filter = document.getElementById("status-filter").value;
  tbody.innerHTML = "";
  let hasData = false;

  // Sắp xếp tháng mới nhất trước và loại bỏ trùng lặp
  const sortedMonths = [...new Set(Object.keys(monthData))].sort((a, b) => new Date(b) - new Date(a));

  sortedMonths.forEach(month => {
    const data = monthData[month];
    const spent = data.transactions?.reduce((sum, trans) => sum + trans.amount, 0) || 0;
    const budget = data.budget || 0;
    // Chỉ render nếu có dữ liệu hợp lệ
    if (budget > 0 || (data.categories && data.categories.length > 0) || (data.transactions && data.transactions.length > 0)) {
      let status = "Đạt";
      if (budget > 0 && spent > budget) {
        status = "Không đạt";
      } else {
        const categoryLimitsExceeded = data.categories.some((cat, index) => {
          const categorySpent = data.transactions?.filter(trans => trans.categoryIndex === index)
            .reduce((sum, trans) => sum + trans.amount, 0) || 0;
          return categorySpent > cat.limit;
        });
        if (categoryLimitsExceeded) {
          status = "Không đạt";
        }
      }

      if (filter === "all" || (filter === "within" && status === "Đạt") || (filter === "over" && status === "Không đạt")) {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${month}</td>
          <td>${spent.toLocaleString()} VND</td>
          <td>${budget.toLocaleString()} VND</td>
          <td class="${status === 'Đạt' ? 'status-ok' : 'status-over'}">${status}</td>
        `;
        tbody.appendChild(row);
        hasData = true;
      }
    }
  });

  if (!hasData) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center;">Không có tháng nào phù hợp với bộ lọc.</td></tr>`;
  }
}

// Lọc thống kê
document.getElementById("status-filter").addEventListener("change", function() {
  renderMonthlySummary();
});

// Load dữ liệu tháng
function loadMonthData() {
  if (!monthData[currentMonth]) {
    monthData[currentMonth] = { budget: 0, categories: [], transactions: [] };
    saveData();
  }
  document.getElementById("Budget_month").value = monthData[currentMonth].budget || "";
  renderCategories();
  updateCategoryDropdown();
  renderTransactions();
  updateRemaining();
  checkBudgetWarning();
  renderMonthlySummary();
  document.querySelector(".sort-btn").textContent = `Sắp xếp theo giá (${sortOrder === "desc" ? "giảm dần" : "tăng dần"})`;
}

// Lưu dữ liệu
function saveData() {
  localStorage.setItem('monthData', JSON.stringify(monthData));
}