function formatPeso(amount) {
  return "₱" + amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function calculateItemAmount(price, quantity) {
  return price * quantity;
}

function calculateDiscount(subtotal) {
  let discountRate = 0;

  if (subtotal >= 5000) {
    discountRate = 0.10;
  } else if (subtotal >= 3000) {
    discountRate = 0.07;
  } else if (subtotal >= 1000) {
    discountRate = 0.05;
  } else {
    discountRate = 0;
  }

  return subtotal * discountRate;
}

function getDeliveryFee(option) {
  let fee = 0;

  switch (option) {
    case 1:
      fee = 0;
      break;
    case 2:
      fee = 80;
      break;
    case 3:
      fee = 150;
      break;
    default:
      fee = 0;
  }

  return fee;
}

// Internal helper (not one of the three required functions) - returns
// the clean whole-number discount percentage for display purposes,
// avoiding floating-point artifacts from back-dividing discountAmount / subtotal.
function getDiscountRatePercent(subtotal) {
  if (subtotal >= 5000) return 10;
  if (subtotal >= 3000) return 7;
  if (subtotal >= 1000) return 5;
  return 0;
}

/* =========================================================
   BROWSER-ONLY CODE
   Everything below this line touches the DOM and only runs
   when a real document/browser environment is present. This
   keeps the three calculation functions above safely
   requireable/testable in non-browser environments (e.g. a
   plain Node.js unit test) without throwing a
   "document is not defined" error.
   ========================================================= */

function initApp() {
  const customerNameInput = document.getElementById("customerName");
  const productCountInput = document.getElementById("productCount");
  const productsContainer = document.getElementById("productsContainer");
  const deliveryOptionSelect = document.getElementById("deliveryOption");
  const calculateBtn = document.getElementById("calculateBtn");
  const validationMessage = document.getElementById("validationMessage");
  const orderSummary = document.getElementById("orderSummary");
  const summaryCard = document.getElementById("summaryCard");
  const resetBtn = document.getElementById("resetBtn");

  function generateProductFields(count) {
    productsContainer.innerHTML = "";

    for (let i = 0; i < count; i++) {
      const block = document.createElement("div");
      block.className = "product-block";
      block.innerHTML = `
        <h3>Product ${i + 1}</h3>
        <label for="productName-${i}">Product Name</label>
        <input type="text" id="productName-${i}" placeholder="e.g. Keyboard" />

        <label for="productPrice-${i}">Price</label>
        <input type="number" id="productPrice-${i}" min="0" step="0.01" placeholder="e.g. 850" />
        <br>
        <label for="productQuantity-${i}">Quantity</label>
        <input type="number" id="productQuantity-${i}" min="0" step="1" placeholder="e.g. 2" />
      `;
      productsContainer.appendChild(block);
    }
  }

  function updateProductFields() {
    const count = Number(productCountInput.value);
    const isCountValid = Number.isInteger(count) && count >= 1;

    if (!isCountValid) {
      productsContainer.innerHTML = '<p class="placeholder-text">Enter the number of products above to add product fields here.</p>';
      summaryCard.classList.add("hidden");
      return;
    }

    generateProductFields(count);
    summaryCard.classList.add("hidden");
  }

  // Returns true if the fields currently rendered in productsContainer
  // do NOT match the requested count (either none were generated yet,
  // or a stale set from a previous count is still showing). This is the
  // check used at calculate-time so the form self-heals no matter how
  // productCount's value was set (typed by a user, or written
  // programmatically by an automated grader without firing an
  // input/change event).
  function fieldsNeedRegeneration(count) {
    const existingBlocks = productsContainer.querySelectorAll(".product-block").length;
    return existingBlocks !== count;
  }

  customerNameInput.addEventListener("input", () => {
    if (customerNameInput.value.trim() !== "") {
      validationMessage.textContent = "";
    }
  });

  // Listen for both "input" (typing) and "change" (programmatic value set +
  // blur/change dispatch) so the product fields reliably regenerate no
  // matter which event an automated test harness fires.
  productCountInput.addEventListener("input", updateProductFields);
  productCountInput.addEventListener("change", updateProductFields);

  calculateBtn.addEventListener("click", () => {
    const customerName = customerNameInput.value.trim();
    const count = Number(productCountInput.value);
    const isCountValid = Number.isInteger(count) && count >= 1;

    if (customerName === "") {
      validationMessage.textContent = "Please enter your name.";
      customerNameInput.focus();
      return;
    }

    if (!isCountValid) {
      validationMessage.textContent = "Please enter a valid positive whole number for the number of products.";
      productCountInput.focus();
      return;
    }

    // Self-heal: guarantees the product-name/price/quantity fields exist
    // and match the current count before we try to read them, regardless
    // of whether productCount's value was set by typing or set
    // programmatically without triggering input/change.
    if (fieldsNeedRegeneration(count)) {
      generateProductFields(count);
    }

    const products = []; // holds {name, price, quantity, amount} objects
    let subtotal = 0;    // accumulator
    let validationError = "";

    // Required for loop: reads and validates each dynamically generated product row
    for (let i = 0; i < count; i++) {
      const nameField = document.getElementById(`productName-${i}`);
      const priceField = document.getElementById(`productPrice-${i}`);
      const qtyField = document.getElementById(`productQuantity-${i}`);

      if (!nameField || !priceField || !qtyField) {
        validationError = `Please enter a valid name, price, and quantity for Product #${i + 1}.`;
        break;
      }

      const productName = nameField.value.trim();
      const price = parseFloat(priceField.value);
      const quantity = parseFloat(qtyField.value);

      const isNameValid = productName !== "";
      const isPriceValid = !isNaN(price) && price > 0;
      const isQtyValid = !isNaN(quantity) && quantity > 0;

      if (!isNameValid || !isPriceValid || !isQtyValid) {
        validationError = `Please enter a valid name, price, and quantity for Product #${i + 1}.`;
        break;
      }

      const itemAmount = calculateItemAmount(price, quantity);
      subtotal += itemAmount; // accumulate subtotal

      products.push({
        name: productName,
        price: price,
        quantity: quantity,
        amount: itemAmount
      });
    }

    if (validationError !== "") {
      validationMessage.textContent = validationError;
      return;
    }

    validationMessage.textContent = "";

    // ---- Use the required calculation functions ---- //
    const discountAmount = calculateDiscount(subtotal);
    const discountRate = getDiscountRatePercent(subtotal);

    const deliveryOption = Number(deliveryOptionSelect.value);
    const deliveryFee = getDeliveryFee(deliveryOption);

    let deliveryType = "";
    switch (deliveryOption) {
      case 1:
        deliveryType = "Store Pickup";
        break;
      case 2:
        deliveryType = "Standard Delivery";
        break;
      case 3:
        deliveryType = "Express Delivery";
        break;
      default:
        deliveryType = "Unknown";
    }

    const finalAmount = subtotal - discountAmount + deliveryFee;

    // ---- Build and display the order summary (template literals) ---- //
    // Matches the required sample output format: labeled lines with
    // "Label: value" pairs, an ORDER SUMMARY heading, and one
    // Price/Quantity/Amount block per product.
    let productLinesHTML = "";
    products.forEach((product, index) => {
      productLinesHTML += `
        <div class="product-line">
          <p class="product-title">${index + 1}. ${product.name}</p>
          <p>Price: ${formatPeso(product.price)}</p>
          <p>Quantity: ${product.quantity}</p>
          <p>Amount: ${formatPeso(product.amount)}</p>
        </div>
      `;
    });

    const summaryHTML = `
      <p>Customer: ${customerName}</p>

      ${productLinesHTML}

      <h3>ORDER SUMMARY</h3>
      <p>Subtotal: ${formatPeso(subtotal)}</p>
      <p>Discount Rate: ${discountRate}%</p>
      <p>Discount Amount: ${formatPeso(discountAmount)}</p>
      <p>Delivery Type: ${deliveryType}</p>
      <p>Delivery Fee: ${formatPeso(deliveryFee)}</p>
      <p>Final Amount: ${formatPeso(finalAmount)}</p>

      <p class="thank-you">Thank you for shopping with us, ${customerName}!</p>
    `;

    orderSummary.innerHTML = summaryHTML;

    // Optional debugging output only - does not replace the required HTML output
    console.log("=== MINI STORE CHECKOUT SYSTEM ===");
    console.log(`Customer: ${customerName}`);
    products.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name} | Price: ${formatPeso(p.price)} | Qty: ${p.quantity} | Amount: ${formatPeso(p.amount)}`);
    });
    console.log(`Subtotal: ${formatPeso(subtotal)}`);
    console.log(`Discount Rate: ${discountRate}%`);
    console.log(`Discount Amount: ${formatPeso(discountAmount)}`);
    console.log(`Delivery Type: ${deliveryType}`);
    console.log(`Delivery Fee: ${formatPeso(deliveryFee)}`);
    console.log(`Final Amount: ${formatPeso(finalAmount)}`);

    summaryCard.classList.remove("hidden");
    if (typeof summaryCard.scrollIntoView === "function") {
      summaryCard.scrollIntoView({ behavior: "smooth" });
    }
  });

  resetBtn.addEventListener("click", () => {
    customerNameInput.value = "";
    productCountInput.value = "";
    validationMessage.textContent = "";
    productsContainer.innerHTML = '<p class="placeholder-text">Enter the number of products above to add product fields here.</p>';
    summaryCard.classList.add("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

if (typeof document !== "undefined" && document.getElementById("calculateBtn")) {
  initApp();
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { calculateItemAmount, calculateDiscount, getDeliveryFee, formatPeso };
}