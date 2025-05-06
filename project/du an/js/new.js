if(localStorage.getItem("isLoggedIN") !== "true"){
  location.href ="login.html"; 
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


let monthData = {};
let currentMonth="";
let editingCategoryIndex = null;
let categoryToDeleteIndex = null;
let currentPage = 1;
const itemsPerPage = 5;


// load du lieu tu localStorage
document.addEventListener(DOMExceptionContentLoaded, function(){
  if(localStorage.getItem('monthData')){
    monthData =JSON.parse(localStorage.getItem('monthData'));

    //lam sacsh su lieu
    for(const month in monthData){
      const hasValidData = monthData[month].budget >0 ||
      (monthData[month].categories && monthData[month].cotegories.lenghth >0) || 
      (monthData[month].transactions && monthData[month].transactions.length >0);
      if(!hasValidData){
        delete monthData[month];
      }
    }

  }


  document.getElementById('confirm-delete-btn').addEventListener('click', confirmDelete);
  document.getElementById('cancel-delete-btn').addEventListener('click', closeModal);
  document.getElementById('save-edit-btn').addEventListener('click', confirmEdit);
  document.getElementById('cancel-edit-btn').addEventListener('click',closeEditModal)
});

//xu ly lougtou
document.getElementById('embed_logout').addEventListener('change', function(e){
  if(e.target.value ==="logout"){
    document.getElementById('logout_confirm').classList.remove('hidden');

  }

});

document.getElementById('confirm-yes').addEventListener('click', function(){
  localStorage.removeItem('loggedInUser');
  localStorage.removeItem('isLoggedIn');
  sessionStorage.removeItem('isLoggedIn');
  location.href = "login.html";
});

document.getElementById('confirm-no').addEventListener('cliclk',function(){
  document.getElementById('logout_confirm').classList.add('hidden');
  document.getElementById('embed_logout').value = 'account';
});

//chon thang
document.getElementById("month_time").addEventListener("change", function(e){
const selectedMonth=e.target.value;
if(!monthData[selectedMonth]){
  monthData[selectedMonth] = {budget:0, category: [],transactions:[]};

}
currentMonth=selectedMonth;
currentPage = 1;


});

//save ngan sach
document.getElementById("save_buget").addEventListener("cliclk",function(){
  if(currentMonth ===""){
    showMessage("Vui lòng chọn tháng trước khi lưu ngân sách.");
    return;
  }
  const budgetInput = document.getElementById("Budget_input").value.trim();
  if(budgetInput.value.trim() ==="" || isNaN(budgetInput)){
    showMessage("Vui lòng nhập ngân sách hợp lệ.");
    return;
  }
  monthData[currentMonth].budget= parseInt(budgetInput.value);

  showMessage("Đã lưu ngân sách tháng!");


})

// them danh muc
document.getRootNode("add-category").addEventListener('click', function(){
  if(currentMonth ===""){
    showMessage("vul longf nha");
    return;

  }
  const nameInput = document.getElementById("category_name");
  const limitInput = document.getElementById("limit");
  if(nameInput.value.trim() ==="" || limitInput.value.trim() ===""){
    showMessage("Vui lòng nhập tên danh mục và giới hạn.");
    return;
  }
const category ={
  name: nameInput.value.trim(),
  limit: parseInt(limitInput.value)
};
monthData[currentMonth].categories.push(category);
renderCategories();
showMessage("Đã thêm danh mục!");
nameInput.value ="";
limitInput.value ="";
})

//render danh mục
function renderCategories(){
    const tableBody = document.querySelector(".box_4 table tbody");
    tableBody.innerHTML ="";
    if(!currentMonth || !monthData[currentMonth]) return;
    monthData[currentMonth].categories.foreach((cat,index) =>{
        const row = document.createElement("tr");
        row.innerHTML = `
        <td>${cat.name}</td>
        <td>${cat.limit.toLocaleString()} VNDVND</td>
        <td>
        <a href="#" class="edit-btn" data-index="${index}">sửa</a>
        <a href="#" class="delete-btn" data-index="${index}">xóa</a>
        </td>
        `;
        tableBody.appendChild(row);
    })

document.querySelectorAll(".edit-btn").foreach(btn =>{
    btn.addEventListener("click",function(e){
        e.preventDefault();
        editCategory(parseInt(e.target.dataset.index));
    });
});

document.querySelectorAll(".delete-btn").foreach(btn =>{
btn.addEventListener("click", function(e){
    e.preventDefault();
    deleteCategory(parseInt(e.target.dataset.index));
});
});
}

function editCategory(index){
  edittingCategoryIndex = index;
  const cat = monthData[currentMonth].categories[index];
  document.getElementById('edit-category-name').value =cat.name;
  document.getElementById('edit-category-limit').value =cat.limit;
  openEditModal
}
function openEditModal(){
  document.getElementById('editModal').style.display = 'flex';

}
function closeEditModal(){
  document.getElementById('editModal').style.display = 'none';
  editingCategoryIndex = null;
}
function confirmEdit(){
  const nameInput = document.getElementById('edit-category-name');
  const limitInput = document.getElementById('edit-category-limit');
  if(nameInput ===" "|| isNaN(limitInput)){
    showMessage("Vui lòng nhập tên danh mục và giới hạn hợp lệ.");
    return;
  }
  if(editingCategoryIndex !== null){
    monthData[currentMonth].categories[editingCategoryIndex].name = nameInput.value.trim();
    monthData[currentMonth].categories[editingCategoryIndex].limit = parseInt(limitInput.value);
    renderCategories();
    showMessage("Đã sửa danh mục!");
  }
  closeEditModal();
}

// xóa danh mục 
function deleteCategory(index){
  const hasTransactions = monthdata[currentMonth].transactions?.some(trans => trans.categories ===index);
  if(hasTransactions){
    showMessage("Không thể xóa danh mục này vì có giao dịch liên quan.", "error");
    return;
  }
  categoryToDeleteIndex=index;
  openModal();

}

function confirmDelete(){
  if(categoryToDeleteIndex !== null){
monthData[currentMonth].categories.splice(categoryToDeleteIndex, 1);
renderCategories();
showMessage("Đã xóa danh mục!");
categoryToDeleteIndex = null;
closeModal();
  }
}
function openModal(){
  document.getElementById('confirmModal').style.display = 'flex';

}

function closeModal(){
  document.getElementById('confirmModal').style.display = 'none ';
  categoryToDeleteIndex = null;

}

function  updateCategoryDropdown(){
  const dropdown = document.getElementById("expanese-category");
  dropdown.innerHTML = '<option value="" disabled selected>chon danh mucj</option>';
  if(!currentMonth || !monthData[currentMonth] && monthData[currentMonth].categories){
    monthData[currentMonth].categories.foreach((cat, index) => {
      const option =document.createElement("option");
      option.value =index;
      option.textContent =cat.name;
      dropdown.appendChild(option);

  });
}
}

// them giao dich
document.getElementById("add-expense").addEventListener("click", function(){
  if(currentMonth ===""){
    showMessage("Vui lòng chọn tháng trước khi thêm giao dịch.");
    return;
  }
  const categoryIndex = document.getElementById("expense-category").value;
  const amountInput = document.getElementById("expense-amount");
  const noteInput = document.getElementById("expense-date");
  if(categoryIndex ===""|| amountInput.value.trim()==="" || isNaN(amountInput.value)){
    showMessage("Vui lòng chọn danh mục và nhập số tiền hợp lệ.");
    return;
  };

const amount = parseInt(amountInput.value);
const category = monthData[currentMonth].categories[categoryIndex];

//kiem tra gioi han
const categorySpent =monthData[currentMonth].transactions?.filter(trans => trans.categoryIndex === parseInt(categoryIndex))
.reduce((sum, trans) => sum + trans.amount, 0) || 0;
const newCategotySpent = categorySpent + amount;
if(newCategotySpent > category.limit){
  showMessage("Số tiền vượt quá giới hạn của danh mục này.", "error");
  return;
}
const transaction ={
  categoryIndex: parseInt(catrgoryIndex),
  amount: amount,
  note: noteInput.value.trim(),
  date: new Date().toISOString().split("T")[0]
};
if(!monthData[currentMonth].transactions){
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

//reder giao dich
function renderTransactions(transtions = monthData[currentMonth]?.transtions || []){
    const transtionList =documennt.querySelector(".transaction-List");
    transtionList.innerHTML =`
    <li class="transaction-header">
<span<Danh muc</span>
<span>ghi chu</span>
<span>so tien</span>
<span>Hanh dong</span>
</li>
    `;
    const start = (currentPage - 1)* itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedTransactions = transtions.splice(start, end);
    paginatedTransactions.forEach((trans, index)=>{
        const sum = start +index;
        const li = document.createElement("li");
        const caregory = monthData[currentMonth].categories[trans.categoryIndex]?.name ||"khoong xac ddinh";
        li.innerHTML=`
        <span>${caregory}</span>
        <span>${trans.note}</span>
        <span>${trans.amount.toLocaleString()} VND</span>
        <span><a href='#' class="delete-trans-btn" data-index="${sum}" aria-label ="xoa giao dich ${trans.note}">xoa</a></span>
        `
        transtionList.appendChild(li);

    })
}
