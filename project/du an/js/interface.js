// Kiểm tra đăng nhập
if (localStorage.getItem("isLoggedIn") !== "true") {
  location.href = "../pages/login.html"; // Nếu người dùng chưa đăng nhập, chuyển hướng về trang login
}

// Hiển thị thông báo ngắn
function showMessage(message, type = "success") {
  const msgBox = document.createElement("div"); // Tạo một phần tử div để hiển thị thông báo
  msgBox.textContent = message; // Gán nội dung thông báo
  msgBox.style.position = "fixed";
  msgBox.style.top = "20px";
  msgBox.style.right = "20px";
  msgBox.style.padding = "10px 20px";
  msgBox.style.backgroundColor = 
    type === "error" ? "#e74c3c" : 
    type === "warning" ? "#f1c40f" : "#2ecc71"; // Đổi màu nền dựa trên loại thông báo
  msgBox.style.color = "#fff";
  msgBox.style.borderRadius = "8px";
  msgBox.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
  msgBox.style.zIndex = 1000;
  document.body.appendChild(msgBox); // Thêm thông báo vào body
  setTimeout(() => msgBox.remove(), 3000); // Tự động xóa thông báo sau 3 giây
}

//=============================================================================







// Khai báo biến
let monthData = {}; // Dữ liệu tháng (lưu trữ ngân sách, danh mục và giao dịch)
let currentMonth = ""; // Tháng hiện tại đang được chọn để quản lý

let editingCategoryIndex = null; 
let deleteIndex = null; 
let deleteType = null; 

let currentPage = 1; 
const itemsPerPage = 5; 
// Sắp xếp giao dịch
let sortOrder = "desc"; // Mặc định sắp xếp giảm dần (theo số tiền)









// Load dữ liệu từ localStorage
document.addEventListener('DOMContentLoaded', function() {
  if (localStorage.getItem('monthData')) {
    monthData = JSON.parse(localStorage.getItem('monthData')); // Lấy dữ liệu từ localStorage và chuyển từ JSON sang object
    for (const month in monthData) {
      const hasValidData = monthData[month].budget > 0 || 
                         (monthData[month].categories && monthData[month].categories.length > 0) || 
                         (monthData[month].transactions && monthData[month].transactions.length > 0);
      // Kiểm tra xem tháng có ngân sách hoặc danh mục hợp lệ hay không
     
      if (!hasValidData) {
        delete monthData[month]; // Xóa tháng không hợp lệ nếu không có dữ liệu hữu ích
      }
    }
  }
    saveData(); 
  updateCategoryDropdown(); // Cập nhật danh sách dropdown danh mục
  loadMonthData(); 
  //gán sự kiện cho các nút xóa và sửa danh mục
  document.getElementById('confirm-delete-btn').addEventListener('click', confirmDelete); 
  document.getElementById('cancel-delete-btn').addEventListener('click', closeModal); 
  document.getElementById('save-edit-btn').addEventListener('click', confirmEdit); 
  document.getElementById('cancel-edit-btn').addEventListener('click', closeEditModal); 
});





// Xử lý logout
document.getElementById('embed_logout').addEventListener('change', function(event) { 
  //change sử dụng cho cho các thẻ select, không có thẻ select thì sử dụng click
  if (event.target.value === 'logout') { 
    document.getElementById('logout-confirm').classList.remove('hidden'); // Hiện modal xác nhận đăng xuất
  }
});


// Xử lý xác nhận đăng xuất
document.getElementById('confirm-yes').addEventListener('click', function() { // Xóa dữ liệu đăng nhập và chuyển hướng về trang đăng nhập
  localStorage.removeItem('loggedInUser');
  localStorage.removeItem('isLoggedIn');
  sessionStorage.removeItem('loggedInUser');
  location.href = '../pages/login.html';
});
// Xử lý hủy đăng xuất
document.getElementById('confirm-no').addEventListener('click', function() {
  document.getElementById('logout-confirm').classList.add('hidden'); 
  document.getElementById('embed_logout').value = 'account'; 
});






// Chọn tháng
document.getElementById("month_time").addEventListener("change", function(event) {
  const selectedMonth = event.target.value; 

  if (!monthData[selectedMonth]) { //
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
  // Tạo đối tượng danh mục mới
  const category = { 
    name: nameInput.value.trim(),
    limit: parseInt(limitInput.value)
  };
  monthData[currentMonth].categories.push(category); // Thêm danh mục vào danh sách tháng hiện tại
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
    //
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
  // Gán sự kiện cho các nút sửa và xóa danh mục
  document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.addEventListener("click", function(e) {
       // Nếu nút là thẻ <a> thì sẽ ngăn điều hướng.
      //Giúp giữ lại người dùng trên giao diện hiện tại.
      e.preventDefault(); 
      editCategory(parseInt(this.dataset.index)); 
    });
  });
  // Gán sự kiện cho các nút xóa danh mục
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", function(e) {
      e.preventDefault();
      deleteCategory(parseInt(this.dataset.index)); 
    });
  });
}

// Sửa danh mục
function editCategory(index) {
  editingCategoryIndex = index; // Lưu chỉ số danh mục đang chỉnh sửa
  const cat = monthData[currentMonth].categories[index]; 
  document.getElementById('edit-category-name').value = cat.name; // Điền tên danh mục vào input
  document.getElementById('edit-category-limit').value = cat.limit; // Điền giới hạn vào input
  openEditModal(); 
}

function openEditModal() {
  document.getElementById('editModal').style.display = 'flex'; 
}

function closeEditModal() {
  document.getElementById('editModal').style.display = 'none';
  editingCategoryIndex = null; 
}
 
// Xử lý xác nhận sửa danh mục
function confirmEdit() {
  const nameInput = document.getElementById('edit-category-name').value.trim(); 
  const limitInput = parseInt(document.getElementById('edit-category-limit').value.trim()); // Lấy giới hạn mới

  if (nameInput === "" || isNaN(limitInput)) {
    showMessage("Vui lòng nhập đầy đủ và giới hạn hợp lệ!", "error");
    return;
  }

  if (editingCategoryIndex !== null) {
    monthData[currentMonth].categories[editingCategoryIndex] = { // Cập nhật danh mục trong mảng
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
  const hasTransactions = monthData[currentMonth].transactions?.some(trans => trans.categoryIndex === index); // Kiểm tra xem danh mục có giao dịch liên quan không
  if (hasTransactions) {
    showMessage("Không thể xóa danh mục vì đã có giao dịch liên quan!", "error");
    return;
  }
  deleteIndex = index; 
  deleteType = "category"; 
  document.getElementById('confirmMessage').textContent = "Bạn có chắc chắn muốn xóa danh mục này không?";
  openModal(); 
}








//-----------------------------------------------------------------------------------
// Xử lý xóa giao dịch
function deleteTransaction(index) {
  deleteIndex = index; 
  deleteType = "transaction"; 
  document.getElementById('confirmMessage').textContent = "Bạn có chắc chắn muốn xóa giao dịch này không?";
  openModal(); 
}
// Xử lý xác nhận xóa
function confirmDelete() {
  if (deleteIndex !== null) {
    if (deleteType === "category") {
      monthData[currentMonth].categories.splice(deleteIndex, 1); 
      saveData(); 
      renderCategories(); 
      updateCategoryDropdown();
      showMessage("Đã xóa danh mục!");
    } else if (deleteType === "transaction") {
      monthData[currentMonth].transactions.splice(deleteIndex, 1); 
      saveData(); 
      renderTransactions(); 
      updateRemaining(); 
      checkBudgetWarning();
      showMessage("Đã xóa giao dịch!");
    }
    closeModal(); 
  }
}

function openModal() {
  document.getElementById('confirmModal').style.display = 'flex'; 
}

function closeModal() {
  document.getElementById('confirmModal').style.display = 'none'; 
  deleteIndex = null; 
  deleteType = null; 
}








//--------------------------------------------------------------------------------------

// Cập nhật dropdown danh mục
function updateCategoryDropdown() {
  const dropdown = document.getElementById("expense-category"); // Lấy phần tử select
   
  dropdown.innerHTML = '<option value="" disabled selected>Chọn danh mục</option>'; // Đặt lại danh sách
  if (currentMonth && monthData[currentMonth] && monthData[currentMonth].categories) {
    monthData[currentMonth].categories.forEach((cat, index) => {
      const option = document.createElement("option"); // Tạo option mới
      option.value = index; // Gán giá trị là chỉ số
      option.textContent = cat.name; // Gán tên danh mục làm nội dung
      dropdown.appendChild(option); // Thêm option vào dropdown
    });
  }
}
//---------------------------------------------------------------------------------------



// Thêm giao dịch
document.getElementById("add-expense").addEventListener("click", function() {
  if (currentMonth === "") {
    showMessage("Vui lòng chọn tháng trước!", "error");
    return;
  }
  const categoryIndex = document.getElementById("expense-category").value; // Lấy chỉ số danh mục được chọn
  const amountInput = document.getElementById("expense-amount"); // Lấy số tiền chi tiêu
  const noteInput = document.getElementById("expense-note"); // Lấy ghi chú

  if (categoryIndex === "" || amountInput.value.trim() === "" || isNaN(amountInput.value)) {
    showMessage("Vui lòng chọn danh mục và nhập số tiền hợp lệ!", "error");
    return;
  }

  const amount = parseInt(amountInput.value); 
  const category = monthData[currentMonth].categories[categoryIndex]; // Lấy thông tin danh mục
  const categorySpent = monthData[currentMonth].transactions?.filter(trans => trans.categoryIndex === parseInt(categoryIndex))
    .reduce((sum, trans) => sum + trans.amount, 0) || 0; // Tính tổng chi tiêu của danh mục
  const newCategorySpent = categorySpent + amount; // Tính tổng chi tiêu mới


  if (newCategorySpent > category.limit) {
    showMessage(`Chi tiêu vượt giới hạn danh mục ${category.name}! (Giới hạn: ${category.limit.toLocaleString()} VND)`, "error");
  }


  const totalSpent = monthData[currentMonth].transactions?.reduce((sum, trans) => sum + trans.amount, 0) || 0; // Tính tổng chi tiêu toàn tháng
  const newTotalSpent = totalSpent + amount; // Tính tổng chi tiêu mới toàn tháng


  if (newTotalSpent > monthData[currentMonth].budget && monthData[currentMonth].budget > 0) {
    showMessage(`Cảnh báo: Giao dịch vượt ngân sách tháng! (Ngân sách: ${monthData[currentMonth].budget.toLocaleString()} VND)`, "warning");
  }

  const transaction = {
    categoryIndex: parseInt(categoryIndex), // Chỉ số danh mục
    amount: amount, // Số tiền
    note: noteInput.value.trim() || "Không có ghi chú", 
    date: new Date().toISOString() // Thời gian thêm giao dịch
  };


  if (!monthData[currentMonth].transactions) {
    monthData[currentMonth].transactions = []; // Khởi tạo mảng giao dịch nếu chưa có
  }
  monthData[currentMonth].transactions.push(transaction); // Thêm giao dịch mới
  saveData(); 
  renderTransactions(); 
  updateRemaining(); 
  checkBudgetWarning(); 
  showMessage("Đã thêm giao dịch!");
  amountInput.value = ""; 
  noteInput.value = ""; 
  document.getElementById("expense-category").value = ""; 
});









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
      <span><a href="#" class="delete-trans-btn" data-index="${globalIndex}">Xóa</a></span>
    `;
    transactionList.appendChild(li); // Thêm giao dịch vào danh sách
  });
  document.querySelectorAll(".delete-trans-btn").forEach(btn => {
    btn.addEventListener("click", function(e) {
      e.preventDefault(); 
      deleteTransaction(parseInt(this.dataset.index)); 
    });
  });
  updatePagination(transactions.length); // Cập nhật phân trang
}




// Cập nhật phân trang
function updatePagination(totalItems) {
  const totalPages = Math.ceil(totalItems / itemsPerPage); // Tính tổng số trang
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
      currentPage = parseInt(btn.textContent); // Cập nhật trang hiện tại
      renderTransactions(); 
    });
  });
  document.querySelector(".prev").addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--; // Quay lại trang trước
      renderTransactions(); // Tải lại giao diện
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
  const searchText = document.getElementById("search-text").value.toLowerCase(); // Lấy từ khóa tìm kiếm

  const filteredTransactions = monthData[currentMonth].transactions.filter(trans =>
    trans.note.toLowerCase().includes(searchText) |
monthData[currentMonth].categories[trans.categoryIndex]?.name.toLowerCase().includes(searchText) // // Lọc theo ghi chúLọc theo tên danh mục
  );
  currentPage = 1; // Đặt lại trang về 1 khi tìm kiếm
  renderTransactions(filteredTransactions); 
});

// Sắp xếp giao dịch// Sắp xếp giao dịch
document.querySelector(".sort-btn").addEventListener("click", function() {
  sortOrder = sortOrder === "desc" ? "asc" : "desc"; // Chuyển đổi thứ tự
  document.querySelector(".sort-btn").textContent = `Sắp xếp theo giá (${sortOrder === "desc" ? "giảm dần" : "tăng dần"})`; 
  if (sortOrder === "asc") {
    monthData[currentMonth].transactions.sort((a, b) => a.amount - b.amount); // Sắp xếp tăng dần trực tiếp trên mảng gốc
  } else if (sortOrder === "desc") {
    monthData[currentMonth].transactions.sort((a, b) => b.amount - a.amount); 
  }
  renderTransactions(monthData[currentMonth].transactions); 
});

// Cập nhật số tiền còn lại
function updateRemaining() {
  const p1 = document.querySelector(".box_3 .p1"); 
  const remainingSpan = document.querySelector(".box_1 .remaining"); 


  if (currentMonth && monthData[currentMonth]) {
    const spent = monthData[currentMonth].transactions?.reduce((sum, trans) => sum + trans.amount, 0) || 0; // Tính tổng chi tiêu
    const remaining = monthData[currentMonth].budget - spent; // Tính số tiền còn lại
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
  const warningMessage = document.getElementById("warning-message"); // Lấy phần tử chứa nội dung cảnh báo
  if (!currentMonth || !monthData[currentMonth]) {
    warningBox.classList.add("hidden"); 
    return;


  }
  const totalSpent = monthData[currentMonth].transactions?.reduce((sum, trans) => sum + trans.amount, 0) || 0; 
  const budget = monthData[currentMonth].budget; 


  if (totalSpent > budget && budget > 0) {
    warningBox.classList.remove("hidden"); // Hiển thị cảnh báo
    warningMessage.textContent = `Dư nợ vượt ngân sách: ${totalSpent.toLocaleString()} / ${budget.toLocaleString()} VND`;
    return;
  }
  let categoryWarning = ""; // Chuỗi chứa cảnh báo danh mục
  monthData[currentMonth].categories.forEach((cat, index) => {
    const categorySpent = monthData[currentMonth].transactions?.filter(trans => trans.categoryIndex === index)
      .reduce((sum, trans) => sum + trans.amount, 0) || 0; 


    if (categorySpent > cat.limit) {
      categoryWarning += `Danh mục ${cat.name} vượt giới hạn: ${categorySpent.toLocaleString()} / ${cat.limit.toLocaleString()} VND. `;
    }
  });


  if (categoryWarning) {
    warningBox.classList.remove("hidden"); // Hiển thị cảnh báo nếu có danh mục vượt giới hạn
    warningMessage.textContent = categoryWarning;
  } else {
    warningBox.classList.add("hidden"); // Ẩn cảnh báo nếu không có vấn đề
  }
}

// Load dữ liệu tháng
function loadMonthData() {
  if (!monthData[currentMonth]) {
    monthData[currentMonth] = { budget: 0, categories: [], transactions: [] }; // Khởi tạo dữ liệu tháng nếu chưa có
    saveData(); 
  }
  document.getElementById("Budget_month").value = monthData[currentMonth].budget || ""; // Điền ngân sách vào input
  renderCategories(); 
  updateCategoryDropdown(); 
  renderTransactions(); 
  updateRemaining(); 
  checkBudgetWarning(); 
  document.querySelector(".sort-btn").textContent = `Sắp xếp theo giá (${sortOrder === "desc" ? "giảm dần" : "tăng dần"})`; // Đặt lại văn bản nút sắp xếp
}


//====================================================================================
// Lưu dữ liệu
function saveData() {
  localStorage.setItem('monthData', JSON.stringify(monthData)); // Lưu dữ liệu vào localStorage dưới dạng JSON
}