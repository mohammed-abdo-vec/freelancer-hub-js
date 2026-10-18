// src/app.js — modern JavaScript (ES2020+).
// Old browsers (e.g. IE 11) cannot run ANY of the marked lines.
// Babel rewrites them into older JavaScript that does the same thing.

const TAX = 0.15;                                   // ① const

const priceWithTax = (price) => price * (1 + TAX);  // ② arrow function

class Cart {                                        // ③ class
  items = [];                                       // ④ class field

  add(name, price, qty = 1) {                       // ⑤ default parameter
    this.items.push({ name, price, qty });          // ⑥ shorthand properties
    return this;
  }

  get total() {
    return this.items.reduce(
      (sum, { price, qty }) => sum + priceWithTax(price) * qty, // ⑦ destructuring
      0
    );
  }
}

const cart = new Cart().add("Coffee", 10).add("Cake", 5, 2);

const user = { profile: null };
const city = user.profile?.address?.city ?? "Unknown"; // ⑧ optional chaining + ??

const summary = `Total: ${cart.total.toFixed(2)} — ship to ${city}`; // ⑨ template literal

const merged = { ...user, cart };                    // ⑩ object spread

async function checkout() {                          // ⑪ async / await
  await new Promise((resolve) => setTimeout(resolve, 100));
  console.log(summary, merged);
}

checkout();
