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

  switch (Number(option)) {
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
      break;
  }

  return fee;
}


function getDiscountRateLabel(subtotal) {
  if (subtotal >= 5000) return "10%";
  else if (subtotal >= 3000) return "7%";
  else if (subtotal >= 1000) return "5%";
  else return "0%";
}

function getDeliveryTypeLabel(option) {
  switch (Number(option)) {
    case 1:
      return "Store Pickup";
    case 2:
      return "Standard Delivery";
    case 3:
      return "Express Delivery";
    default:
      return "Unknown";
  }
}

function formatCurrency(amount) {
  return "₱" + amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}


if (typeof document !== "undefined") {

  const productCountField = document.getElementById("productCount");
  const productsContainer = document.getElementById("productsContainer");
  const validationMessage = document.getElementById("validationMessage");
  const orderSummary = document.getElementById("orderSummary");
  const calculateBtn = document.getElementById("calculateBtn");

  let lastGeneratedCount = 0;

  function generateProductFields() {
    const productCount = Number(productCountField.value);

    if (!productCount || productCount <= 0 || isNaN(productCount)) {
      return;
    }

    if (productCount === lastGeneratedCount) {
      return;
    }

    productsContainer.innerHTML = "";

    for (let i = 0; i < productCount; i++) {
      const block = document.createElement("div");
      block.className = "product-block";
      block.innerHTML = `
        <h3>Product ${i + 1}</h3>
        <label for="productName-${i}">Product Name</label>
        <input type="text" id="productName-${i}" placeholder="Enter product name" />

        <label for="productPrice-${i}">Price</label>
        <input type="number" id="productPrice-${i}" placeholder="Enter price" step="0.01" />

        <label for="productQuantity-${i}">Quantity</label>
        <input type="number" id="productQuantity-${i}" placeholder="Enter quantity" step="1" />
      `;
      productsContainer.appendChild(block);
    }

    lastGeneratedCount = productCount;
  }

  productCountField.addEventListener("input", generateProductFields);
  productCountField.addEventListener("change", generateProductFields);
  productCountField.addEventListener("keyup", generateProductFields);
  productCountField.addEventListener("blur", generateProductFields);

  setInterval(generateProductFields, 250);

  calculateBtn.addEventListener("click", function () {
    generateProductFields();

    validationMessage.textContent = "";
    orderSummary.textContent = "";

    const customerName = document.getElementById("customerName").value.trim();
    const productCount = Number(document.getElementById("productCount").value);
    const deliveryOption = document.getElementById("deliveryOption").value;

    let errors = [];

    if (customerName === "") {
      errors.push("Customer name must not be empty.");
    }

    if (!productCount || productCount <= 0 || isNaN(productCount)) {
      errors.push("Number of products must be a valid positive number.");
      validationMessage.textContent = errors.join("\n");
      return;
    }

    const products = [];
    let subtotal = 0;

    for (let i = 0; i < productCount; i++) {
      const nameField = document.getElementById(`productName-${i}`);
      const priceField = document.getElementById(`productPrice-${i}`);
      const quantityField = document.getElementById(`productQuantity-${i}`);

      if (!nameField || !priceField || !quantityField) {
        errors.push(`Product ${i + 1}: fields not found. Re-enter the number of products.`);
        continue;
      }

      const name = nameField.value.trim();
      const price = parseFloat(priceField.value);
      const quantity = parseFloat(quantityField.value);

      if (name === "") {
        errors.push(`Product ${i + 1}: name must not be empty.`);
      }
      if (isNaN(price) || price <= 0) {
        errors.push(`Product ${i + 1}: price must be a valid positive number.`);
      }
      if (isNaN(quantity) || quantity <= 0) {
        errors.push(`Product ${i + 1}: quantity must be a valid positive number.`);
      }

      if (name !== "" && !isNaN(price) && price > 0 && !isNaN(quantity) && quantity > 0) {
        const amount = calculateItemAmount(price, quantity);
        subtotal += amount;
        products.push({ name, price, quantity, amount });
      }
    }

    if (errors.length > 0) {
      validationMessage.textContent = errors.join("\n");
      return;
    }

    validationMessage.textContent = "All inputs are valid.";

    const discountAmount = calculateDiscount(subtotal);
    const deliveryFee = getDeliveryFee(deliveryOption);
    const finalAmount = subtotal - discountAmount + deliveryFee;

    let productLines = "";
    products.forEach((p, index) => {
      productLines += `${index + 1}. ${p.name}\n`;
      productLines += `   Price: ${formatCurrency(p.price)}\n`;
      productLines += `   Quantity: ${p.quantity}\n`;
      productLines += `   Amount: ${formatCurrency(p.amount)}\n\n`;
    });

    const summary = `Customer: ${customerName}

${productLines}ORDER SUMMARY
Subtotal: ${formatCurrency(subtotal)}
Discount Rate: ${getDiscountRateLabel(subtotal)}
Discount Amount: ${formatCurrency(discountAmount)}
Delivery Type: ${getDeliveryTypeLabel(deliveryOption)}
Delivery Fee: ${formatCurrency(deliveryFee)}
Final Amount: ${formatCurrency(finalAmount)}`;

    orderSummary.textContent = summary;
  });

}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    calculateItemAmount,
    calculateDiscount,
    getDeliveryFee
  };
}