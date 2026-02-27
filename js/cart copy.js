// cart.js
let cart = [];
console.log("cart.js loaded");

const products = [
    { name: "20L Washing Powder", price: 350, image: "img/bucketflower.webp" },
    { name: "5L Washing Powder", price: 95, image: "img/5Lpowder.webp" },
    { name: "25L Liquid Dishwasher", price: 350, image: "img/2.webp" },
    { name: "5L Liquid Dishwasher", price: 110, image: "img/3.webp" },
    { name: "20L Pine Gel", price: 550, image: "img/2.webp" },
    { name: "5L Pine Gel", price: 140, image: "img/5LGel.webp" }
];

document.addEventListener("DOMContentLoaded", function () {
    const productList = document.getElementById("product-list");

    // Render products if container exists
    if (productList) {
        products.forEach((product, index) => {
            productList.innerHTML += `
            <div class="col-lg-4 col-md-6">
                <div class="store-item position-relative text-center">
                    <img class="img-fluid" src="${product.image}" alt="">
                    <div class="p-4">
                        <h4 class="mb-3">${product.name}</h4>
                        <h4 class="text-primary">R${product.price}.00</h4>
                    </div>
                    <div class="store-overlay">
                        <button class="btn btn-dark rounded-pill py-2 px-4 m-2 add-to-cart" data-index="${index}">
                            Add to Cart <i class="fa fa-cart-plus ms-2"></i>
                        </button>
                    </div>
                </div>
            </div>
            `;
        });
    }

    // Cart button listeners
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function () {
            const index = this.getAttribute('data-index');
            cart.push(products[index]);
            updateCart();
        });
    });

    // Checkout form listener (if form exists on this page)
    const checkoutForm = document.getElementById("checkout-form");
    if (checkoutForm) {
        checkoutForm.addEventListener("submit", function (e) {
            e.preventDefault();
            checkout();
        });
    }
});

function updateCart() {
    const cartItems = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');

    if (!cartItems || !cartCount || !cartTotal) return;

    cartItems.innerHTML = "";
    let total = 0;

    cart.forEach((item, index) => {
        total += item.price;
        cartItems.innerHTML += `
            <li class="list-group-item d-flex justify-content-between">
                ${item.name} - R${item.price}
                <button class="btn btn-sm btn-danger" onclick="removeItem(${index})">X</button>
            </li>
        `;
    });

    cartCount.textContent = cart.length;
    cartTotal.textContent = total.toFixed(2);
}

function removeItem(index) {
    cart.splice(index, 1);
    updateCart();
}

function openCheckout() {
    if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    // Close cart modal if exists
    const cartModalEl = document.getElementById("cartModal");
    if (cartModalEl) {
        const cartModal = bootstrap.Modal.getInstance(cartModalEl);
        if (cartModal) cartModal.hide();
    }

    // Open checkout modal if exists
    const checkoutModalEl = document.getElementById("checkoutModal");
    if (checkoutModalEl) {
        const checkoutModal = new bootstrap.Modal(checkoutModalEl);
        checkoutModal.show();

        // Focus first input
        checkoutModalEl.addEventListener('shown.bs.modal', () => {
            const firstInput = document.getElementById("customer-name");
            if (firstInput) firstInput.focus();
        }, { once: true });
    }
}

function checkout() {
    if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    const name = document.getElementById("customer-name")?.value || "";
    const phone = document.getElementById("customer-phone")?.value || "";
    const address = document.getElementById("customer-address")?.value || "";

    if (!name || !phone || !address) {
        alert("Please fill in your personal details.");
        return;
    }

    // Generate orderId
    const orderId = "ORDER-" + Date.now();

    // Store cart and customer info in localStorage (persists across pages)
    localStorage.setItem("orderId", orderId);
    localStorage.setItem("cart", JSON.stringify(cart));
    localStorage.setItem("customerName", name);
    localStorage.setItem("customerPhone", phone);
    localStorage.setItem("customerAddress", address);

    // Calculate total and item names
    let total = 0;
    let itemNames = "";
    cart.forEach(item => {
        total += item.price;
        itemNames += item.name + ", ";
    });

    // PayFast form
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "https://sandbox.payfast.co.za/eng/process"; // sandbox URL

    const inputs = {
        merchant_id: "10000100", // sandbox ID
        merchant_key: "46f0cd694581a", // sandbox key
        m_payment_id: orderId,
        return_url: "https://products.fshsystems.co.za/success.html",
        cancel_url: "https://products.fshsystems.co.za/cancel.html",
        notify_url: "https://products.fshsystems.co.za/ipn.php",
        amount: total.toFixed(2),
        item_name: itemNames + " Order by " + name,
        custom_str1: name,
        custom_str2: phone,
        custom_str3: address,
        custom_str4: String(itemNames),
        custom_str5: String(total.toFixed(2))
    };

    for (const key in inputs) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = inputs[key];
        form.appendChild(input);
    }

    document.body.appendChild(form);
    form.submit();
}

// WhatsApp link on success page
document.addEventListener("DOMContentLoaded", function () {
    if (!window.location.pathname.includes("success.html")) return;

    const whatsappLink = document.getElementById("whatsappLink");
    if (!whatsappLink) return;

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const name = localStorage.getItem("customerName") || "";
    const phone = localStorage.getItem("customerPhone") || "";
    const address = localStorage.getItem("customerAddress") || "";
    const orderId = localStorage.getItem("orderId") || "N/A";

    if (!cart.length) return;

    let total = 0;
    let message = `Hello, my name is ${name}. I am confirming my order:%0A%0A`;
    cart.forEach(item => {
        message += `• ${item.name} - R${item.price}%0A`;
        total += item.price;
    });
    message += `%0ATotal: R${total}%0A`;
    message += `Order ID: ${orderId}%0A`;
    message += `Phone: ${phone}%0A`;
    message += `Address: ${address}%0A`;
    message += `%0APlease don't forget to share your proof of payment as well.%0A`;

    whatsappLink.href = `https://wa.me/27604564022?text=${message}`;

    whatsappLink.addEventListener("click", () => {
        localStorage.clear();
    });

    console.log("WhatsApp link ready:", whatsappLink.href);
});