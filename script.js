const cartContainer = document.getElementById("cart-container");
const productsContainer = document.getElementById("products-container");
const dessertCards = document.getElementById("dessert-card-container");
const cartBtn = document.getElementById("cart-btn");
const clearCartBtn = document.getElementById("clear-cart-btn");
const totalNumberOfItems = document.getElementById("total-items");
const cartSubTotal = document.getElementById("subtotal");
const cartTaxes = document.getElementById("taxes");
const cartTotal = document.getElementById("total");
const showHideCartSpan = document.getElementById("show-hide-cart");
const discountCodeInput = document.getElementById("discount-code");
const applyDiscountBtn = document.getElementById("apply-discount-btn");
let isCartShowing = false;

const API_KEY = "bWoxJ9UM-DGVp28hCqLtCGBce8JSW1I7MoRlrlJuco8";

const products = [
  { id: 1, name: "Vanilla Cupcakes (6 Pack)", price: 12.99, category: "Cupcake" },
  { id: 2, name: "French Macaron", price: 3.99, category: "Macaron" },
  { id: 3, name: "Pumpkin Cupcake", price: 3.99, category: "Cupcake" },
  { id: 4, name: "Chocolate Cupcake", price: 5.99, category: "Cupcake" },
  { id: 5, name: "Chocolate Pretzels (4 Pack)", price: 10.99, category: "Pretzel" },
  { id: 6, name: "Strawberry Ice Cream", price: 2.99, category: "Ice Cream" },
  { id: 7, name: "Chocolate Macarons (4 Pack)", price: 9.99, category: "Macaron" },
  { id: 8, name: "Strawberry Pretzel", price: 4.99, category: "Pretzel" },
  { id: 9, name: "Butter Pecan Ice Cream", price: 2.99, category: "Ice Cream" },
  { id: 10, name: "Rocky Road Ice Cream", price: 2.99, category: "Ice Cream" },
  { id: 11, name: "Vanilla Macarons (5 Pack)", price: 11.99, category: "Macaron" },
  { id: 12, name: "Lemon Cupcakes (4 Pack)", price: 12.99, category: "Cupcake" },
];

async function fetchProductImage(query) {
  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${query}&client_id=${API_KEY}&per_page=1`
    );
    if (!response.ok) throw new Error("Image fetch failed");
    const data = await response.json();
    return data.results.length > 0 ? data.results[0].urls.small : "placeholder.jpg";
  } catch (error) {
    console.error("Error fetching image:", error);
    return "placeholder.jpg";
  }
}

async function generateProductCards() {
  for (const { name, id, price, category } of products) {
    const imageUrl = await fetchProductImage(name);
    dessertCards.innerHTML += `
      <div class="dessert-card">
        <img src="${imageUrl}" alt="${name}" class="dessert-image" />
        <h2>${name}</h2>
        <p class="dessert-price">$${price}</p>
        <p class="product-category">Category: ${category}</p>
        <button id="${id}" class="btn add-to-cart-btn">Add to cart</button>
      </div>
    `;
  }
  const addToCartBtns = document.getElementsByClassName("add-to-cart-btn");
  [...addToCartBtns].forEach((btn) => {
    btn.addEventListener("click", (event) => {
      cart.addItem(Number(event.target.id), products);
      totalNumberOfItems.textContent = cart.getCounts();
      cart.calculateTotal();
    });
  });
}

generateProductCards();

// Discount Codes
const discountCodes = {
  "SUMMER10": 10,   // 10% discount
  "WELCOME15": 15,  // 15% discount
};

function applyDiscount(code) {
  const discountPercentage = discountCodes[code.toUpperCase()];
  if (discountPercentage) {
    const discountAmount = (cart.total * discountPercentage) / 100;
    const discountedTotal = cart.total - discountAmount;
    cartTotal.textContent = `$${discountedTotal.toFixed(2)}`;
    showToast(`Discount Applied: ${discountPercentage}% off!`);
  } else {
    alert("Invalid discount code.");
  }
}

applyDiscountBtn.addEventListener("click", () => {
  const code = discountCodeInput.value.trim();
  if (code) {
    applyDiscount(code);
  } else {
    alert("Please enter a discount code.");
  }
});

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

class ShoppingCart {
  constructor() {
    this.items = JSON.parse(localStorage.getItem("cartItems")) || [];
    this.total = 0;
    this.taxRate = 8.25;
  }

  saveCart() {
    localStorage.setItem("cartItems", JSON.stringify(this.items));
  }

  removeItem(id) {
    let existingProduct = this.items.find((item) => item.id === id);
    if (!existingProduct) return;
    if (existingProduct.quantity > 1) {
      existingProduct.quantity -= 1;
      document.getElementById(`product-count-for-id${id}`).textContent = `${existingProduct.quantity}x`;
      showToast(`${existingProduct.name} quantity updated in cart!`);
    } else {
      this.items = this.items.filter((item) => item.id !== id);
      document.getElementById(`dessert${id}`).remove();
      showToast(`${existingProduct.name} removed from cart!`);
    }
    this.saveCart();
    totalNumberOfItems.textContent = this.getCounts();
    this.calculateTotal();
  }

  addItem(id, products) {
    const product = products.find((item) => item.id === id);
    const { name, price } = product;
    let existingProduct = this.items.find((item) => item.id === id);
    if (existingProduct) {
      existingProduct.quantity += 1;
      document.getElementById(`product-count-for-id${id}`).textContent = `${existingProduct.quantity}x`;
      showToast(`${name} quantity updated in cart!`);
    } else {
      const newProduct = { ...product, quantity: 1 };
      this.items.push(newProduct);
      productsContainer.innerHTML += `
      <div id="dessert${id}" class="product">
        <p><span class="product-count" id="product-count-for-id${id}">1x</span> ${name}</p>
        <p>$${price}</p>
        <button class="btn remove-item-btn" data-id="${id}">Remove</button>
      </div>
      `;
      showToast(`${name} added to cart!`);
      document
        .querySelector(`#dessert${id} .remove-item-btn`)
        .addEventListener("click", (event) => {
          this.removeItem(Number(event.target.dataset.id));
        });
    }
    this.saveCart();
    totalNumberOfItems.textContent = this.getCounts();
    this.calculateTotal();
  }

  getCounts() {
    return this.items.reduce((count, item) => count + item.quantity, 0);
  }

  clearCart() {
    if (!this.items.length) {
      alert("Your shopping cart is already empty!");
      return;
    }
    const isCartCleared = confirm("Are you sure you want to clear all items from your shopping cart?");
    if (isCartCleared) {
      this.items = [];
      this.total = 0;
      productsContainer.innerHTML = "";
      totalNumberOfItems.textContent = 0;
      cartSubTotal.textContent = "$0.00";
      cartTaxes.textContent = "$0.00";
      cartTotal.textContent = "$0.00";
      this.saveCart();
    }
  }

  calculateTaxes(amount) {
    return parseFloat(((this.taxRate / 100) * amount).toFixed(2));
  }

  calculateTotal() {
    const subTotal = this.items.reduce((total, item) => total + item.price * item.quantity, 0);
    const tax = this.calculateTaxes(subTotal);
    this.total = subTotal + tax;
    cartSubTotal.textContent = `$${subTotal.toFixed(2)}`;
    cartTaxes.textContent = `$${tax.toFixed(2)}`;
    cartTotal.textContent = `$${this.total.toFixed(2)}`;
  }

  restoreCartUI() {
    this.items.forEach(({ id, name, price, quantity }) => {
      productsContainer.innerHTML += `
      <div id="dessert${id}" class="product">
        <p><span class="product-count" id="product-count-for-id${id}">${quantity}x</span> ${name}</p>
        <p>$${price}</p>
        <button class="btn remove-item-btn" data-id="${id}">Remove</button>
      </div>
      `;
      document
        .querySelector(`#dessert${id} .remove-item-btn`)
        .addEventListener("click", (event) => {
          this.removeItem(Number(event.target.dataset.id));
        });
    });
    totalNumberOfItems.textContent = this.getCounts();
    this.calculateTotal();
  }
}

const cart = new ShoppingCart();
clearCartBtn.addEventListener("click", () => cart.clearCart());
cart.restoreCartUI();

productsContainer.addEventListener("click", (event) => {
  if (event.target && event.target.classList.contains("remove-item-btn")) {
    const productId = Number(event.target.dataset.id);
    cart.removeItem(productId);
  }
});

cartBtn.addEventListener("click", () => {
  isCartShowing = !isCartShowing;
  showHideCartSpan.textContent = isCartShowing ? "Hide" : "Show";
  cartContainer.style.display = isCartShowing ? "block" : "none";
});
