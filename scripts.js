// Utility Functions for Encryption/Decryption
function encrypt(data) {
    return btoa(data); // Base64 Encoding
}

function decrypt(data) {
    return atob(data); // Base64 Decoding
}

function loadData(key) {
    const encryptedData = localStorage.getItem(key);
    return encryptedData ? JSON.parse(decrypt(encryptedData)) : [];
}

function saveData(key, data) {
    localStorage.setItem(key, encrypt(JSON.stringify(data)));
}

// Initialize default admin account and menu items
function initializeSystem() {
    const users = loadData('users');
    const menu = loadData('menu');

    // Create default admin account if not exists
    if (users.length === 0) {
        users.push({ name: "Admin", email: "admin@school.com", password: "admin123", role: "admin" });
        saveData('users', users);
        console.log("Default admin account created: admin@school.com / admin123");
    }

    // Create default menu items if not exists
    if (menu.length === 0) {
        const defaultMenu = [
            { id: 1, name: "Pancakes", category: "breakfast", price: 5.0, description: "Fluffy pancakes with syrup." },
            { id: 2, name: "Chicken Sandwich", category: "lunch", price: 7.5, description: "Grilled chicken sandwich." },
            { id: 3, name: "Apple Pie", category: "snacks", price: 3.0, description: "Homemade apple pie slice." }
        ];
        saveData('menu', defaultMenu);
        console.log("Default menu items added.");
    }
}
initializeSystem();

// Authenticate user
function authenticateUser(email, password) {
    const users = loadData('users');
    return users.find(user => user.email === email && user.password === password);
}

// Populate menu for users
function populateMenu() {
    const menuDiv = document.getElementById('menu');
    const menu = loadData('menu');
    menuDiv.innerHTML = '';
    if (menu.length === 0) {
        menuDiv.textContent = 'No menu items available.';
        return;
    }
    menu.forEach(item => {
        const div = document.createElement('div');
        div.innerHTML = `
            <span>${item.name} - $${item.price.toFixed(2)} (${item.category})</span>
            <button onclick="addToOrder(${item.id})">Add to Order</button>
        `;
        menuDiv.appendChild(div);
    });
}

// Manage order placement
let currentOrder = [];

function addToOrder(itemId) {
    const menu = loadData('menu');
    const item = menu.find(menuItem => menuItem.id === itemId);
    if (item) {
        currentOrder.push(item);
        updateOrderSummary();
    }
}

function updateOrderSummary() {
    const orderSummary = document.getElementById('order-summary');
    const total = currentOrder.reduce((sum, item) => sum + item.price, 0);
    orderSummary.innerHTML = `
        <h4>Order Summary</h4>
        ${currentOrder.map((item, index) => `
            <div>
                ${item.name} - $${item.price.toFixed(2)}
                <button onclick="removeFromOrder(${index})">Remove</button>
            </div>`).join('')}
        <div>
            <strong>Total: $${total.toFixed(2)}</strong>
        </div>
        <div>
            <label>Special Requests:</label>
            <input type="text" id="special-requests" placeholder="Add dietary notes">
        </div>
        <div>
            <label>Payment Method:</label>
            <select id="payment-method">
                <option value="Cash">Cash</option>
                <option value="Mobile Money">Mobile Money</option>
                <option value="Card">Card</option>
            </select>
        </div>
        <button onclick="placeOrder()">Place Order</button>
    `;
}

function removeFromOrder(index) {
    currentOrder.splice(index, 1);
    updateOrderSummary();
}

function placeOrder() {
    if (currentOrder.length === 0) {
        alert("Your order is empty.");
        return;
    }

    const specialRequests = document.getElementById('special-requests').value;
    const paymentMethod = document.getElementById('payment-method').value;
    const orders = loadData('orders');
    const userEmail = localStorage.getItem('currentUserEmail');
    const newOrder = {
        id: Date.now(),
        userEmail,
        items: currentOrder.map(item => item.name),
        total: currentOrder.reduce((sum, item) => sum + item.price, 0),
        paymentMethod,
        specialRequests,
        status: "Pending"
    };

    orders.push(newOrder);
    saveData('orders', orders);
    currentOrder = [];
    updateOrderSummary();
    populateOrders(userEmail);
    alert(`Order placed successfully!\nPayment Method: ${paymentMethod}`);
}

// Populate orders for users
function populateOrders(userEmail) {
    const ordersList = document.getElementById('order-list');
    const orders = loadData('orders');
    const userOrders = orders.filter(order => order.userEmail === userEmail);
    ordersList.innerHTML = '';
    if (userOrders.length === 0) {
        ordersList.textContent = 'No orders placed yet.';
        return;
    }
    userOrders.forEach(order => {
        const li = document.createElement('li');
        li.innerHTML = `
            Order #${order.id} - ${order.items.join(", ")} - $${order.total.toFixed(2)} - ${order.status}
            <button onclick="cancelOrder(${order.id})">Cancel Order</button>
        `;
        ordersList.appendChild(li);
    });
}

// Cancel an order
function cancelOrder(orderId) {
    let orders = loadData('orders');
    orders = orders.filter(order => order.id !== orderId);
    saveData('orders', orders);
    const userEmail = localStorage.getItem('currentUserEmail');
    populateOrders(userEmail);
    alert("Order canceled successfully.");
}

// Show sales report for admin
function generateSalesReport() {
    const orders = loadData('orders');
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const popularItems = orders.flatMap(order => order.items)
        .reduce((acc, item) => {
            acc[item] = (acc[item] || 0) + 1;
            return acc;
        }, {});
    
    alert(`
        Total Revenue: $${totalRevenue.toFixed(2)}
        Popular Items: ${Object.entries(popularItems)
            .map(([item, count]) => `${item} (${count} orders)`)
            .join(", ")}
    `);
}

// Other existing functions for admin/user functionality
// ...

// Event listeners
document.getElementById('sales-report-button').onclick = generateSalesReport;
// Other event listeners for login, registration, and menu management

