(function () {
  const formatRupiah = (value) => `Rp${Number(value).toLocaleString("id-ID")}`;

  function getBadge() {
    return document.getElementById("cart-badge");
  }

  function showToast(message, isError = false) {
    const toast = document.getElementById("cart-toast");
    if (!toast) return;

    toast.textContent = message;
    toast.className = `fixed bottom-6 right-6 text-sm px-4 py-3 rounded-lg shadow-lg z-50 ${
      isError ? "bg-red-600 text-white" : "bg-gray-900 text-white"
    }`;
    toast.classList.remove("hidden");

    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => toast.classList.add("hidden"), 2500);
  }

  function updateBadge(count) {
    const badge = getBadge();
    if (!badge) return;

    if (count > 0) {
      badge.textContent = count;
      badge.classList.remove("hidden");
    } else {
      badge.textContent = "0";
      badge.classList.add("hidden");
    }
  }

  async function request(url, options = {}) {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      ...options,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || "Terjadi kesalahan.");
    }

    return data;
  }

  async function addToCart(ticketId, quantity) {
    const data = await request("/user/api/cart/add", {
      method: "POST",
      body: JSON.stringify({ ticketId, quantity }),
    });

    updateBadge(data.count);
    showToast(data.message);
    return data;
  }

  async function updateCartItem(ticketId, quantity) {
    return request(`/user/api/cart/items/${ticketId}`, {
      method: "PATCH",
      body: JSON.stringify({ quantity }),
    });
  }

  async function removeCartItem(ticketId) {
    return request(`/user/api/cart/items/${ticketId}`, {
      method: "DELETE",
    });
  }

  function initDetailPage() {
    const panel = document.getElementById("ticket-purchase-panel");
    if (!panel) return;

    const price = Number(panel.dataset.price || 0);
    const stock = Number(panel.dataset.stock || 0);
    const ticketId = Number(panel.dataset.ticketId || 0);
    const qtyInput = document.getElementById("ticket-quantity");
    const totalEl = document.getElementById("ticket-total");
    const addBtn = document.getElementById("add-to-cart-btn");
    const messageEl = document.getElementById("purchase-message");

    const updateTotal = () => {
      const qty = Math.max(1, Math.min(stock, parseInt(qtyInput.value, 10) || 1));
      qtyInput.value = qty;
      if (totalEl) totalEl.textContent = formatRupiah(qty * price);
    };

    qtyInput?.addEventListener("input", updateTotal);
    qtyInput?.addEventListener("change", updateTotal);
    updateTotal();

    addBtn?.addEventListener("click", async () => {
      const quantity = parseInt(qtyInput.value, 10) || 1;

      addBtn.disabled = true;
      if (messageEl) messageEl.textContent = "";

      try {
        await addToCart(ticketId, quantity);
        if (messageEl) {
          messageEl.textContent = "Tiket berhasil ditambahkan ke keranjang.";
          messageEl.className = "text-xs text-green-700 mt-2";
        }
      } catch (err) {
        if (messageEl) {
          messageEl.textContent = err.message;
          messageEl.className = "text-xs text-red-600 mt-2";
        }
      } finally {
        addBtn.disabled = false;
      }
    });
  }

  function initCartPage() {
    const page = document.getElementById("cart-page");
    if (!page) return;

    const totalItemsEl = document.getElementById("cart-total-items");
    const totalPriceEl = document.getElementById("cart-total-price");

    const refreshSummary = (data) => {
      if (totalItemsEl) totalItemsEl.textContent = data.count;
      if (totalPriceEl) totalPriceEl.textContent = formatRupiah(data.totalPrice);
      updateBadge(data.count);

      if (!data.items.length) {
        window.location.reload();
      }
    };

    page.addEventListener("change", async (event) => {
      const input = event.target.closest(".cart-qty");
      if (!input) return;

      const ticketId = input.dataset.ticketId;
      const quantity = parseInt(input.value, 10);

      try {
        const data = await updateCartItem(ticketId, quantity);
        const item = data.items.find((entry) => String(entry.ticketId) === String(ticketId));
        const row = input.closest(".cart-item");

        if (item && row) {
          const subtotalEl = row.querySelector(".cart-subtotal");
          if (subtotalEl) subtotalEl.textContent = formatRupiah(item.subtotal);
        }

        refreshSummary(data);
        showToast("Jumlah tiket diperbarui.");
      } catch (err) {
        showToast(err.message, true);
      }
    });

    page.addEventListener("click", async (event) => {
      const button = event.target.closest(".cart-remove");
      if (!button) return;

      const ticketId = button.dataset.ticketId;

      try {
        const data = await removeCartItem(ticketId);
        button.closest(".cart-item")?.remove();
        refreshSummary(data);
        showToast("Item dihapus dari keranjang.");
      } catch (err) {
        showToast(err.message, true);
      }
    });
  }

  window.TiketopiaCart = {
    addToCart,
    updateBadge,
    initDetailPage,
    initCartPage,
  };
})();
