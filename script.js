/* ─────────────────────────────────────────
   BOOKLYN — script.js
   DOM manipulation, cart, filters, routing
───────────────────────────────────────── */

'use strict';

// ── Book Data ──────────────────────────────────────────────────────────
const BOOKS = [
  {
    id: 1,
    title: "The Midnight Library",
    author: "Matt Haig",
    price: 499,
    category: "Fiction",
    badge: "Bestseller",
    badgeClass: "gold",
    color: "#7a8fbe",
    cover: "https://covers.openlibrary.org/b/isbn/9781786892737-L.jpg",
  },
  {
    id: 2,
    title: "Atomic Habits",
    author: "James Clear",
    price: 599,
    category: "Self-Help",
    badge: "Top Pick",
    badgeClass: "green",
    color: "#6b8e6e",
    cover: "https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg",
  },
  {
    id: 3,
    title: "Sapiens",
    author: "Yuval Noah Harari",
    price: 699,
    category: "Non-Fiction",
    badge: null,
    color: "#c8816a",
    cover: "https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg",
  },
  {
    id: 4,
    title: "The Alchemist",
    author: "Paulo Coelho",
    price: 349,
    category: "Fiction",
    badge: "Classic",
    badgeClass: "gold",
    color: "#d4a96a",
    cover: "https://covers.openlibrary.org/b/isbn/9780062315007-L.jpg",
  },
  {
    id: 5,
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    price: 449,
    category: "Science",
    badge: null,
    color: "#4d6199",
    cover: "https://covers.openlibrary.org/b/isbn/9780553380163-L.jpg",
  },
  {
    id: 6,
    title: "Ikigai",
    author: "Héctor García",
    price: 399,
    category: "Self-Help",
    badge: "New",
    badgeClass: "",
    color: "#b87aa8",
    cover: "https://covers.openlibrary.org/b/isbn/9780143130727-L.jpg",
  },
  {
    id: 7,
    title: "Meditations",
    author: "Marcus Aurelius",
    price: 299,
    category: "Philosophy",
    badge: "Timeless",
    badgeClass: "green",
    color: "#8a7060",
    cover: "https://covers.openlibrary.org/b/isbn/9780140449334-L.jpg",
  },
  {
    id: 8,
    title: "The Power of Now",
    author: "Eckhart Tolle",
    price: 449,
    category: "Philosophy",
    badge: null,
    color: "#5a8a5e",
    cover: "https://covers.openlibrary.org/b/isbn/9781577314806-L.jpg",
  },
];

// ── State ───────────────────────────────────────────────────────────────
let cart = loadCart();
let activeCategory = 'all';
let bookPageCategory = 'all';
let sortOrder = 'default';

// ── Cart Persistence ────────────────────────────────────────────────────
function loadCart() {
  try {
    return JSON.parse(localStorage.getItem('booklyn_cart')) || [];
  } catch { return []; }
}

function saveCart() {
  localStorage.setItem('booklyn_cart', JSON.stringify(cart));
}

// ── Page Routing ────────────────────────────────────────────────────────
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

  const target = document.getElementById('page-' + pageId);
  if (target) { target.classList.add('active'); window.scrollTo({ top: 0, behavior: 'smooth' }); }

  const navLink = document.querySelector(`.nav-link[data-page="${pageId}"]`);
  if (navLink) navLink.classList.add('active');

  if (pageId === 'home')    renderHomeGrid();
  if (pageId === 'books')   renderBooksPage();
  if (pageId === 'cart')    renderCart();
}

// ── Build Book Card HTML ─────────────────────────────────────────────────
function buildCard(book) {
  const inCart = cart.some(c => c.id === book.id);
  const badge = book.badge
    ? `<div class="book-badge ${book.badgeClass || ''}">${book.badge}</div>`
    : '';

  return `
    <div class="book-card" id="card-${book.id}">
      <div class="book-cover">
        <img src="${book.cover}" alt="${book.title}" loading="lazy"
             onerror="this.style.background='${book.color}';this.style.visibility='hidden'"/>
        ${badge}
      </div>
      <div class="book-info">
        <span class="book-cat">${book.category}</span>
        <h3 class="book-title">${book.title}</h3>
        <p class="book-author">${book.author}</p>
      </div>
      <div class="book-footer">
        <div class="book-price"><span class="currency">₹</span>${book.price.toLocaleString()}</div>
        <button class="add-btn ${inCart ? 'added' : ''}"
                data-id="${book.id}"
                onclick="handleAddToCart(${book.id}, this)">
          ${inCart ? '✓ Added' : '+ Cart'}
        </button>
      </div>
    </div>`;
}

// ── Render Home Grid ─────────────────────────────────────────────────────
function renderHomeGrid() {
  const grid = document.getElementById('homeGrid');
  if (!grid) return;

  const filtered = activeCategory === 'all'
    ? BOOKS
    : BOOKS.filter(b => b.category === activeCategory);

  grid.innerHTML = filtered.map(buildCard).join('');
}

// ── Render Books Page ────────────────────────────────────────────────────
function renderBooksPage() {
  const grid = document.getElementById('booksGrid');
  if (!grid) return;

  sortOrder = document.getElementById('sortBooks')?.value || 'default';

  let filtered = bookPageCategory === 'all'
    ? [...BOOKS]
    : BOOKS.filter(b => b.category === bookPageCategory);

  if (sortOrder === 'price-asc') filtered.sort((a, b) => a.price - b.price);
  if (sortOrder === 'price-desc') filtered.sort((a, b) => b.price - a.price);

  grid.innerHTML = filtered.map(buildCard).join('');
}

// ── Add to Cart ──────────────────────────────────────────────────────────
function handleAddToCart(bookId, btn) {
  const book = BOOKS.find(b => b.id === bookId);
  if (!book) return;

  const existing = cart.find(c => c.id === bookId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...book, qty: 1 });
  }

  saveCart();
  updateCartBadge();
  showToast(`"${book.title}" added to cart 📚`);

  // Update all add buttons for this book
  document.querySelectorAll(`.add-btn[data-id="${bookId}"]`).forEach(b => {
    b.classList.add('added');
    b.textContent = '✓ Added';
  });
}

// ── Render Cart ──────────────────────────────────────────────────────────
function renderCart() {
  const itemsEl   = document.getElementById('cartItems');
  const summaryEl = document.getElementById('cartSummary');
  const emptyEl   = document.getElementById('cartEmpty');
  if (!itemsEl) return;

  if (cart.length === 0) {
    itemsEl.innerHTML = '';
    summaryEl.innerHTML = '';
    emptyEl.classList.remove('hidden');
    return;
  }

  emptyEl.classList.add('hidden');

  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const shipping = subtotal >= 999 ? 0 : 60;
  const total    = subtotal + shipping;
  const itemCount = cart.reduce((s, c) => s + c.qty, 0);

  itemsEl.innerHTML = cart.map(item => `
    <div class="cart-item" id="cart-item-${item.id}">
      <img class="cart-item-img" src="${item.cover}" alt="${item.title}"
           onerror="this.style.background='${item.color}';this.style.visibility='hidden'"/>
      <div class="cart-item-details">
        <div class="cart-item-cat">${item.category}</div>
        <div class="cart-item-title">${item.title}</div>
        <div class="cart-item-author">${item.author}</div>
        <div class="cart-item-footer">
          <div class="qty-control">
            <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
            <span class="qty-value">${item.qty}</span>
            <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
          </div>
          <div class="cart-item-price">₹${(item.price * item.qty).toLocaleString()}</div>
          <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
        </div>
      </div>
    </div>`).join('');

  summaryEl.innerHTML = `
    <div class="summary-title">Order Summary</div>
    <div class="summary-row"><span>${itemCount} item${itemCount !== 1 ? 's' : ''}</span><span>₹${subtotal.toLocaleString()}</span></div>
    <div class="summary-row"><span>Shipping</span><span>${shipping === 0 ? '<span style="color:#5a8a5e">Free</span>' : '₹' + shipping}</span></div>
    ${shipping > 0 ? `<div class="summary-row" style="font-size:.78rem;color:#c0706a"><span>Add ₹${(999-subtotal).toLocaleString()} more for free shipping</span></div>` : ''}
    <div class="summary-row total"><span>Total</span><span>₹${total.toLocaleString()}</span></div>
    <button class="checkout-btn" onclick="checkout()">Proceed to Checkout →</button>
    <button class="clear-cart-btn" onclick="clearCart()">Clear Cart</button>`;
}

// ── Change Quantity ──────────────────────────────────────────────────────
function changeQty(bookId, delta) {
  const item = cart.find(c => c.id === bookId);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(bookId);
    return;
  }

  saveCart();
  updateCartBadge();
  renderCart();
}

// ── Remove from Cart ─────────────────────────────────────────────────────
function removeFromCart(bookId) {
  cart = cart.filter(c => c.id !== bookId);
  saveCart();
  updateCartBadge();
  renderCart();

  // Reset add buttons
  document.querySelectorAll(`.add-btn[data-id="${bookId}"]`).forEach(b => {
    b.classList.remove('added');
    b.textContent = '+ Cart';
  });

  showToast('Item removed from cart');
}

// ── Clear Cart ───────────────────────────────────────────────────────────
function clearCart() {
  if (!confirm('Clear your entire cart?')) return;
  cart = [];
  saveCart();
  updateCartBadge();
  renderCart();

  // Reset all add buttons
  document.querySelectorAll('.add-btn').forEach(b => {
    b.classList.remove('added');
    b.textContent = '+ Cart';
  });

  showToast('Cart cleared');
}

// ── Checkout ─────────────────────────────────────────────────────────────
function checkout() {
  showToast('🎉 Order placed! Thank you for shopping at Booklyn.');
  setTimeout(() => {
    cart = [];
    saveCart();
    updateCartBadge();
    renderCart();
  }, 1200);
}

// ── Cart Badge ───────────────────────────────────────────────────────────
function updateCartBadge() {
  const count = cart.reduce((s, c) => s + c.qty, 0);
  document.getElementById('cartCount').textContent = count;
}

// ── Toast Notification ───────────────────────────────────────────────────
let toastTimer;
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

// ── Category Chips ────────────────────────────────────────────────────────
function setupCatChips(containerId, isHome) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.addEventListener('click', e => {
    const chip = e.target.closest('.cat-chip');
    if (!chip) return;

    container.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');

    const cat = chip.dataset.cat;
    if (isHome) {
      activeCategory = cat;
      renderHomeGrid();
    } else {
      bookPageCategory = cat;
      renderBooksPage();
    }
  });
}

// ── Mobile Menu ───────────────────────────────────────────────────────────
function toggleMobileMenu() {
  const links = document.getElementById('navLinks');
  const ham   = document.getElementById('hamburger');
  const isOpen = links.classList.toggle('open');
  ham.style.transform = isOpen ? 'rotate(90deg)' : '';
}

function closeMobileMenu() {
  document.getElementById('navLinks').classList.remove('open');
  document.getElementById('hamburger').style.transform = '';
}

// ── Show Category from Footer ─────────────────────────────────────────────
function showCat(cat) {
  showPage('books');
  bookPageCategory = cat;
  setTimeout(() => {
    // Activate chip
    const chips = document.querySelectorAll('#booksPageCatChips .cat-chip');
    chips.forEach(c => {
      c.classList.toggle('active', c.dataset.cat === cat);
    });
    renderBooksPage();
  }, 50);
}

// ── Contact Form ──────────────────────────────────────────────────────────
function submitContact(e) {
  e.preventDefault();
  document.getElementById('formSuccess').classList.remove('hidden');
  e.target.reset();
  setTimeout(() => document.getElementById('formSuccess').classList.add('hidden'), 4000);
}

// ── Navbar Scroll Effect ─────────────────────────────────────────────────
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 20);
});

// ── Init ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  renderHomeGrid();
  setupCatChips('catChips', true);
  setupCatChips('booksPageCatChips', false);

  // Sync add button states from persisted cart
  cart.forEach(item => {
    document.querySelectorAll(`.add-btn[data-id="${item.id}"]`).forEach(b => {
      b.classList.add('added');
      b.textContent = '✓ Added';
    });
  });
});
