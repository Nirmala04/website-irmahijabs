// script.js - KODE PERBAIKAN FINAL
"use strict";

let cart = JSON.parse(localStorage.getItem("irmaHijabCart")) || [];

// --- 1. UTILITY FUNCTIONS (DIPINDAHKAN KE GLOBAL AGAR BISA DIAKSES DARI ONCLICK HTML) ---

// Mendapatkan elemen badge keranjang (badge) dan modal
const cartBadge = document.getElementById("cartBadge");
const cartModal = document.getElementById("cartModal");
const cartItemsList = document.getElementById("cartItemsList");
const modalTotalItems = document.getElementById("modalTotalItems");
const modalTotalPrice = document.getElementById("modalTotalPrice");
const checkoutButton = document.getElementById("checkoutButton");

function saveCart() {
  localStorage.setItem("irmaHijabCart", JSON.stringify(cart));
  updateCartIcon();
}

function updateCartIcon() {
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  // Perbarui badge dengan total item
  if (cartBadge) {
    cartBadge.textContent = totalItems;
    // Tampilkan badge hanya jika ada item
    cartBadge.style.display = totalItems > 0 ? "flex" : "none";
  }
}

// FUNGSI UTAMA: MENGISI DAN MENAMPILKAN MODAL KERANJANG
function viewCartSummary() {
  let itemsHtml = "";
  let totalHarga = 0;
  let totalItems = 0;

  if (cart.length === 0) {
    itemsHtml =
      '<p style="text-align: center; color: #888; padding: 20px 0;">Keranjang belanja Anda kosong.</p>';
    checkoutButton.disabled = true;
    checkoutButton.style.opacity = "0.5";
  } else {
    checkoutButton.disabled = false;
    checkoutButton.style.opacity = "1";

    cart.forEach((item, index) => {
      // Mengambil harga bersih (angka)
      const priceText = item.price
        .replace("Rp", "")
        .trim()
        .replace(/\./g, "")
        .replace(/,/g, "");
      const hargaBersih = parseFloat(priceText);
      const subtotal = hargaBersih * item.quantity;
      totalHarga += subtotal;
      totalItems += item.quantity;

      const subtotalFormatted = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(subtotal);

      const priceFormatted = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(hargaBersih);

      itemsHtml += `
                <div class="cart-item">
                    <span class="cart-item-info">${item.name} (${item.color})</span>
                    <div class="cart-item-controls">
                        <button class="qty-btn remove-one-btn" data-index="${index}">-</button>
                        <span class="cart-item-qty">${item.quantity}</span>
                        <button class="qty-btn add-one-btn" data-index="${index}">+</button>
                    </div>
                    <span class="cart-item-price">${priceFormatted}</span>
                    <span class="cart-item-subtotal">${subtotalFormatted}</span>
                    <button class="remove-all-btn" data-index="${index}">🗑️</button>
                </div>
            `;
    });
  }

  const totalFormatted = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(totalHarga);

  cartItemsList.innerHTML = itemsHtml;
  modalTotalItems.textContent = totalItems;
  modalTotalPrice.textContent = totalFormatted;

  // Pasang listener untuk tombol-tombol di dalam modal (qty dan hapus)
  attachCartItemListeners();
}

// FUNGSI PENTING BARU: Fungsi global untuk membuka/menutup modal
window.toggleCartModal = function () {
  if (cartModal.classList.contains("active")) {
    cartModal.classList.remove("active");
    console.log("LOG 4a: Modal Keranjang Ditutup.");
  } else {
    viewCartSummary();
    cartModal.classList.add("active");
    console.log("LOG 4b: Modal Keranjang Ditampilkan!");
  }
};

// --- 2. LOGIKA KERANJANG (TAMBAH/KURANG/HAPUS) ---

function changeQuantity(index, delta) {
  if (index >= 0 && index < cart.length) {
    cart[index].quantity += delta;

    if (cart[index].quantity <= 0) {
      cart.splice(index, 1); // Hapus jika kuantitas 0
      console.log(`[KERANJANG] Item dihapus.`);
    } else {
      console.log(`[KERANJANG] Kuantitas diubah.`);
    }

    saveCart();
    viewCartSummary(); // Refresh tampilan modal
  }
}

function removeAllItem(index) {
  if (index >= 0 && index < cart.length) {
    const removedItem = cart[index];
    cart.splice(index, 1);
    console.log(`[KERANJANG] Semua item ${removedItem.name} dihapus.`);
    saveCart();
    viewCartSummary(); // Refresh tampilan modal
  }
}

function attachCartItemListeners() {
  // Tombol Kurang Kuantitas
  document.querySelectorAll(".remove-one-btn").forEach((button) => {
    button.onclick = () => {
      const index = parseInt(button.dataset.index);
      changeQuantity(index, -1);
    };
  });

  // Tombol Tambah Kuantitas
  document.querySelectorAll(".add-one-btn").forEach((button) => {
    button.onclick = () => {
      const index = parseInt(button.dataset.index);
      changeQuantity(index, 1);
    };
  });

  // Tombol Hapus Total
  document.querySelectorAll(".remove-all-btn").forEach((button) => {
    button.onclick = () => {
      const index = parseInt(button.dataset.index);
      removeAllItem(index);
    };
  });
}

// --- 3. EVENT LISTENERS UTAMA (SAAT DOM SIAP) ---
document.addEventListener("DOMContentLoaded", function () {
  console.log("LOG 1: JavaScript Loaded and DOM Ready. (IrmaHijab.Daily)");

  // --- 1. PENARGETAN ELEMEN TAMBAHAN ---
  const detailButtons = document.querySelectorAll(".product-card .btn-detail");
  const cartButtons = document.querySelectorAll(".product-card .add-to-cart"); // Mengubah penargetan class
  const allColorDots = document.querySelectorAll(".color-dot");
  const closeModalButton = document.getElementById("closeModalButton");

  // --- 2. EVENT LISTENERS PRODUK ---

  // 1. Tombol 'PILIH WARNA' (Toggle Detail Warna)
  detailButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      console.log("LOG 2: DETAIL BUTTON CLICKED!");
      const productCard = button.closest(".product-card");
      const detailPopup = productCard.querySelector(".color-detail-popup");

      detailPopup.classList.toggle("active");

      if (detailPopup.classList.contains("active")) {
        button.textContent = "SEMBUNYIKAN WARNA";
        button.style.backgroundColor = "var(--primary-color)"; // Gunakan variabel CSS
        button.style.color = "white"; // Ubah warna teks
      } else {
        button.textContent = "PILIH WARNA";
        button.style.backgroundColor = "transparent"; // Kembali ke transparan/default
        button.style.color = "var(--primary-color)";
      }
    });
  });

  // 2. Tombol 'TAMBAH KE KERANJANG'
  cartButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      console.log("LOG 3: ADD TO CART BUTTON CLICKED!");

      const productCard = button.closest(".product-card");
      const productName = productCard.dataset.productName; // Menggunakan data attribute
      const productPrice = productCard.dataset.productPrice; // Menggunakan data attribute

      const activeDot = productCard.querySelector(
        ".color-options .color-dot.active"
      );

      // Ambil warna dari data-color, jika tidak ada yang aktif, ambil dari dot yang pertama (default)
      const selectedColor = activeDot
        ? activeDot.getAttribute("data-color")
        : productCard
            .querySelector(".color-options .color-dot")
            .getAttribute("data-color");

      const existingItem = cart.find(
        (item) => item.name === productName && item.color === selectedColor
      );

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({
          name: productName,
          price: `Rp ${productPrice}`, // Format kembali ke string dengan 'Rp' untuk tampilan
          color: selectedColor,
          quantity: 1,
        });
      }

      saveCart();
      alert(
        `✅ ${productName} (${selectedColor}) berhasil ditambahkan ke keranjang!`
      ); // Notifikasi singkat
    });
  });

  // 3. Interaksi Pilihan Warna Visual (Dot Warna)
  allColorDots.forEach((dot) => {
    dot.addEventListener("click", function () {
      const productCard = dot.closest(".product-card");
      const allDotsInCard = productCard.querySelectorAll(".color-dot");

      allDotsInCard.forEach((d) => d.classList.remove("active"));
      dot.classList.add("active");

      console.log(`[WARNA] Memilih warna: ${dot.getAttribute("data-color")}`);
    });
  });

  // --- 3. EVENT LISTENERS MODAL & HEADER ---

  // 4. Tombol 'Lanjutkan ke Pembayaran' (Simulasi Checkout)
  checkoutButton.addEventListener("click", function () {
    if (cart.length === 0) {
      alert("Keranjang Anda kosong! Tidak dapat melanjutkan pembayaran.");
      cartModal.classList.remove("active");
      return;
    }

    console.log("Memproses pembayaran dan membersihkan keranjang...");

    cart = [];
    saveCart();

    alert(
      "✅ Pembayaran berhasil! Pesanan Anda sedang diproses. Keranjang belanja telah dikosongkan."
    );

    cartModal.classList.remove("active");
  });

  // 5. Menutup Modal (Tombol X di dalam modal)
  if (closeModalButton) {
    closeModalButton.addEventListener("click", function () {
      cartModal.classList.remove("active");
    });
  }

  // 6. Menutup Modal (Klik di luar area modal)
  window.addEventListener("click", function (event) {
    if (event.target === cartModal) {
      cartModal.classList.remove("active");
    }
  });

  // Panggil saat halaman dimuat pertama kali
  updateCartIcon();
});
