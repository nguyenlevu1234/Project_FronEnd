// document.getElementById(`embed_logout`).addEventListener(`change`, function (event){
//     const value=event.target.value;
//     if(value === "logout"){
//         location.href = `logout.html`; 
//     }
// })


// document.getElementById('embed_logout').addEventListener('change', function (event) {
//     const value = event.target.value;
//     if (value === 'logout') {
//         // const confirmLogout = confirm('Bạn có chắc chắn muốn đăng xuất không?');
//         if (confirmLogout) {
//             location.href = 'logout.html';
//         } else {
//             // Nếu người dùng chọn "Không", reset lại select về "Tài khoản"
//             event.target.value = 'account';
//         }
//     }
// });



//   const selectBox = document.getElementById('embed_logout');
//   const confirmBox = document.getElementById('logout-confirm');
//   const btnYes = document.getElementById('confirm-yes');
//   const btnNo = document.getElementById('confirm-no');

//   selectBox.addEventListener('change', function (event) {
//     const value = event.target.value;
//     if (value === 'logout') {
//       confirmBox.classList.remove('hidden');
//     }
//   });

//   btnYes.addEventListener('click', function () {
//     location.href = 'logout.html';
//   });

//   btnNo.addEventListener('click', function () {
//     confirmBox.classList.add('hidden');
//     selectBox.value = 'account'; // Reset dropdown
//   });

const selectBox =documnet.getElementByid(`embed_logout`);
const confirmBox= document.getElemantByid(`logout-confirm`);
