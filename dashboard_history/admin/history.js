
// nút "Xem" 
function viewDetails(orderId) {
    alert("Viewing details for order ID: " + orderId);
}


document.addEventListener("DOMContentLoaded", function() {
    const viewButtons = document.querySelectorAll('.btn-info');
    viewButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault(); 
            const orderId = this.closest('tr').querySelector('td').innerText; //lấy mã đơn từ đơn hàng
            viewDetails(orderId); 
        });
    });
});
