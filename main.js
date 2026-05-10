/*=============== SCROLL SECTIONS ACTIVE LINK ===============*/
const sections = document.querySelectorAll('section[id]');
function scrollActive() {
    const scrollY = window.scrollY;
    sections.forEach(current => {
        const sectionHeight = current.offsetHeight,
              sectionTop = current.offsetTop - 100,
              sectionId = current.getAttribute('id');
        const navLinks = document.querySelectorAll('.nav__menu a[href*=' + sectionId + '], .mobile-bottom-nav a[href*=' + sectionId + ']');
        if(scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => link.classList.add('active-link'));
        } else {
            navLinks.forEach(link => link.classList.remove('active-link'));
        }
    });
}
window.addEventListener('scroll', scrollActive);

/*=============== SHOW/HIDE CART & MODAL ===============*/
const cart = document.getElementById('cart'),
      cartShop = document.getElementById('cart-shop'),
      cartClose = document.getElementById('cart-close'),
      checkoutBtn = document.getElementById('checkout'),
      checkoutModal = document.getElementById('checkout-modal'),
      checkoutClose = document.getElementById('checkout-close');

if(cartShop) cartShop.addEventListener('click', () => cart.classList.add('show-cart'));
if(cartClose) cartClose.addEventListener('click', () => cart.classList.remove('show-cart'));

if(checkoutBtn) checkoutBtn.addEventListener('click', () => {
    if(cartItems.length > 0) {
        cart.classList.remove('show-cart');
        checkoutModal.classList.add('show-checkout');
    } else {
        alert("කරුණාකර පළමුව භාණ්ඩ තෝරාගන්න!");
    }
});

if(checkoutClose) checkoutClose.addEventListener('click', () => checkoutModal.classList.remove('show-checkout'));

/*=============== ABOUT US READ MORE ===============*/
const readMoreBtn = document.getElementById('read-more-btn');
const aboutMoreContent = document.getElementById('about-more');
if(readMoreBtn && aboutMoreContent) {
    readMoreBtn.addEventListener('click', () => {
        if(aboutMoreContent.style.display === 'none') {
            aboutMoreContent.style.display = 'block';
            readMoreBtn.innerHTML = `අඩු කරන්න (Show Less) <i class="bx bx-up-arrow-alt button__icon"></i>`;
        } else {
            aboutMoreContent.style.display = 'none';
            readMoreBtn.innerHTML = `තවත් කියවන්න (Read More) <i class="bx bx-down-arrow-alt button__icon"></i>`;
        }
    });
}

window.toggleAreaSelection = function() {
    const deliveryType = document.getElementById('delivery-type').value;
    const areaSelection = document.getElementById('area-selection');
    const areaInput = document.getElementById('delivery-area');
    if(deliveryType === 'Delivery') {
        areaSelection.style.display = 'block';
        areaInput.required = true;
    } else {
        areaSelection.style.display = 'none';
        areaInput.required = false;
        areaInput.value = ""; 
    }
};

/*=============== CART LOGIC & DYNAMIC PRICING ===============*/
let cartItems = [];
const cartContainer = document.getElementById('cart-container');
const cartCount = document.querySelector('.cart__count');
const cartTotal = document.querySelector('.cart__prices-total');
const cartTotalItems = document.querySelector('.cart__prices-item');

window.updateCardPrice = function(selectElement) {
    const card = selectElement.closest('.product-card');
    const priceElement = card.querySelector('.product-price');
    const addToCartBtn = card.querySelector('.add-to-cart');
    
    let basePrice = parseFloat(addToCartBtn.getAttribute('data-baseprice'));
    if (!basePrice) basePrice = parseFloat(addToCartBtn.getAttribute('data-price')); 
    
    const multiplier = parseFloat(selectElement.value);
    const newPrice = basePrice * multiplier;
    priceElement.textContent = `රු. ${newPrice.toFixed(2)}`;
};

// Event Delegation (Dynamically load වන බොත්තම් සඳහා)
document.addEventListener('click', function(e) {
    const addBtn = e.target.closest('.add-to-cart');
    if(addBtn) {
        const card = addBtn.closest('.product-card') || addBtn.closest('.package__card');
        const baseId = addBtn.getAttribute('data-id');
        let name = addBtn.getAttribute('data-name');
        let basePrice = parseFloat(addBtn.getAttribute('data-baseprice'));
        if (!basePrice) basePrice = parseFloat(addBtn.getAttribute('data-price'));
        
        let price = basePrice;
        let id = baseId;
        
        const weightSelector = card.querySelector('.weight-selector');
        if(weightSelector) {
            const multiplier = parseFloat(weightSelector.value);
            const weightLabel = weightSelector.options[weightSelector.selectedIndex].getAttribute('data-label');
            price = basePrice * multiplier; 
            name = `${name} (${weightLabel})`; 
            id = `${baseId}_${weightLabel}`; 
        }

        const existingItem = cartItems.find(item => item.id === id);
        if(existingItem) {
            existingItem.quantity += 1;
        } else {
            cartItems.push({ id, name, price, quantity: 1 });
        }
        
        updateCart();
        cart.classList.add('show-cart'); 
    }
});

function updateCart() {
    const totalItemsCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    if(cartCount) cartCount.textContent = totalItemsCount;
    if(cartTotalItems) cartTotalItems.textContent = `${totalItemsCount} items`;
    
    if(cartItems.length === 0) {
        cartContainer.innerHTML = `
            <div class="cart__empty">
                <i class="bx bx-cart-download"></i>
                <p>ඔබ තවමත් භාණ්ඩ තෝරාගෙන නැත</p>
            </div>`;
    } else {
        cartContainer.innerHTML = '';
        cartItems.forEach((item, index) => {
            const cartItem = document.createElement('div');
            cartItem.classList.add('cart__card');
            cartItem.innerHTML = `
                <div class="cart__detail">
                    <h3 style="font-size: 1rem; color: #fff; margin-bottom: 5px;">${item.name}</h3>
                    <span style="color: #10b981; font-weight: 600;">රු. ${item.price.toFixed(2)}</span>
                </div>
                <div class="cart__amount">
                    <span class="cart__amount-box minus" data-index="${index}"><i class="bx bx-minus"></i></span>
                    <span class="cart__amount-number" style="color:#fff; font-weight: bold;">${item.quantity}</span>
                    <span class="cart__amount-box plus" data-index="${index}"><i class="bx bx-plus"></i></span>
                    <i class="bx bx-trash-alt remove" data-index="${index}" style="color:#ef4444; cursor:pointer; margin-left:15px; font-size: 1.2rem;"></i>
                </div>
            `;
            cartContainer.appendChild(cartItem);
        });
    }
    
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if(cartTotal) cartTotal.textContent = `රු. ${total.toFixed(2)}`;

    const deliveryOption = document.getElementById('delivery-option');
    const deliveryTypeSelect = document.getElementById('delivery-type');
    if(deliveryOption && deliveryTypeSelect) {
        if(total >= 3000) {
            deliveryOption.disabled = false;
            deliveryOption.textContent = "නිවසටම ගෙනවිත් දෙන්න (Delivery)";
        } else {
            deliveryOption.disabled = true;
            deliveryOption.textContent = "නිවසටම ගෙනවිත් දෙන්න (Delivery) - රු. 3000ට වැඩි ඇණවුම් සඳහා පමණි";
            if(deliveryTypeSelect.value === 'Delivery') {
                deliveryTypeSelect.value = 'Pickup';
                window.toggleAreaSelection();
            }
        }
    }
}

// Plus, Minus, Remove Logic in Cart
document.addEventListener('click', function(e) {
    const btn = e.target.closest('span') || e.target.closest('i');
    if(!btn || !btn.hasAttribute('data-index')) return;
    const index = btn.getAttribute('data-index');

    if(btn.classList.contains('plus')) {
        cartItems[index].quantity += 1;
        updateCart();
    }
    if(btn.classList.contains('minus')) {
        cartItems[index].quantity -= 1;
        if(cartItems[index].quantity <= 0) cartItems.splice(index, 1);
        updateCart();
    }
    if(btn.classList.contains('remove')) {
        cartItems.splice(index, 1);
        updateCart();
    }
});

/*=============== WHATSAPP CHECKOUT ===============*/
document.getElementById('whatsapp-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('cust-name').value;
    const address = document.getElementById('cust-address').value;
    const deliveryType = document.getElementById('delivery-type').value;
    const deliveryTime = document.getElementById('delivery-time').value; 
    const deliveryAreaElement = document.getElementById('delivery-area');
    const deliveryArea = deliveryAreaElement ? deliveryAreaElement.value : '';
    
    let message = `🛒 *නව ඇණවුමක් - Chaminda Store's*\n\n👤 *නම:* ${name}\n🏠 *ලිපිනය:* ${address}\n🚚 *ක්‍රමය:* ${deliveryType === 'Delivery' ? 'නිවසට ගෙනවිත් දීම' : 'කඩෙන් ලබා ගැනීම'}\n`;
    if(deliveryType === 'Delivery' && deliveryArea) message += `📍 *ප්‍රදේශය:* ${deliveryArea}\n`;
    message += `⏱️ *අවශ්‍ය කාලය:* ${deliveryTime}\n\n📦 *භාණ්ඩ ලැයිස්තුව:*\n`;
    
    cartItems.forEach(item => { message += `▪️ ${item.name} - රු. ${item.price} x ${item.quantity}\n`; });
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    message += `\n💰 *මුළු මුදල:* රු. ${total.toFixed(2)}\n`;
    
    const whatsappURL = `https://wa.me/94781608352?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');
    
    cartItems = []; updateCart();
    document.getElementById('whatsapp-form').reset();
    window.toggleAreaSelection(); 
    document.getElementById('checkout-modal').classList.remove('show-checkout');
});


/*=============== FETCH DATA & RENDER (JSON) ===============*/
async function loadData() {
    try {
        // Fetch Products
        const prodRes = await fetch('data/products.json');
        const prodData = await prodRes.json();
        const productList = document.getElementById('product-list');
        const noResultsMsg = document.getElementById('no-results').outerHTML;
        
        let productsHTML = '';
        prodData.products.forEach(p => {
            let weightHTML = '';
            if(p.isWeighable) {
                weightHTML = `
                <select class="weight-selector" onchange="window.updateCardPrice(this)">
                    <option value="1" data-label="1kg">1kg</option>
                    <option value="0.5" data-label="500g">500g</option>
                    <option value="0.25" data-label="250g">250g</option>
                    <option value="2" data-label="2kg">2kg</option>
                </select>`;
            }
            productsHTML += `
            <div class="glass-card product-card" data-category="${p.category}">
                <img src="${p.image}" alt="${p.name}" class="product-img">
                <h3 class="product-title">${p.name}</h3> 
                <p class="product-desc">${p.desc}</p>
                ${weightHTML}
                <div class="product-bottom">
                    <span class="product-price">රු. ${p.price.toFixed(2)}</span>
                    <button class="glass-btn-small add-to-cart" data-id="${p.id}" data-name="${p.name}" data-baseprice="${p.price}">
                        <i class='bx bx-cart-add'></i>
                    </button>
                </div>
            </div>`;
        });
        productList.innerHTML = productsHTML + noResultsMsg;

        // Fetch Packages
        const pkgRes = await fetch('data/packages.json');
        const pkgData = await pkgRes.json();
        const pkgList = document.getElementById('packages-list');
        
        let pkgsHTML = '';
        pkgData.packages.forEach(pkg => {
            const itemsLi = pkg.items.map(i => `<li>${i}</li>`).join('');
            pkgsHTML += `
            <div class="swiper-slide package__card">
                <div class="discount-tag">${pkg.discount}</div>
                <img src="${pkg.image}" alt="${pkg.name}" class="package-img">
                <h3 class="product-title">${pkg.name}</h3>
                <ul class="package-list">${itemsLi}</ul>
                <div class="product-bottom">
                    <span class="product-price">රු. ${pkg.price.toFixed(2)} <small style="text-decoration: line-through; color: #94a3b8; font-size: 0.8rem;">රු. ${pkg.oldPrice}</small></span>
                    <button class="button add-to-cart" data-id="${pkg.id}" data-name="${pkg.name}" data-baseprice="${pkg.price}">
                        Add to Cart
                    </button>
                </div>
            </div>`;
        });
        pkgList.innerHTML = pkgsHTML;

        // Initialize Swipers AFTER DOM is populated
        new Swiper(".home-swiper", { spaceBetween: 30, loop: true, autoplay: { delay: 4000, disableOnInteraction: false }, pagination: { el: ".swiper-pagination", clickable: true } });
        new Swiper(".packages-swiper", { spaceBetween: 30, loop: true, slidesPerView: 1, breakpoints: { 768: { slidesPerView: 2 }, 1024: { slidesPerView: 2 } }, navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" }, pagination: { el: ".swiper-pagination", clickable: true } });

        setupSearchAndFilter();

    } catch (e) {
        console.error("Error loading data:", e);
        // Fallback for Home Swiper if fetch fails (e.g. running directly from file://)
        new Swiper(".home-swiper", { spaceBetween: 30, loop: true, autoplay: { delay: 4000, disableOnInteraction: false }, pagination: { el: ".swiper-pagination", clickable: true } });
    }
}

// Data Fetching ආරම්භ කිරීම
loadData();

function setupSearchAndFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');
    const searchBox = document.getElementById('search-box');
    const noResultsMsg = document.getElementById('no-results');
    let currentCategory = 'all';

    function filterProducts() {
        const searchValue = searchBox.value.toLowerCase();
        let visibleCount = 0;
        productCards.forEach(card => {
            const title = card.querySelector('.product-title').innerText.toLowerCase();
            const category = card.getAttribute('data-category');
            const matchesSearch = title.includes(searchValue);
            const matchesCategory = (currentCategory === 'all' || category === currentCategory);
            if (matchesSearch && matchesCategory) {
                card.style.display = 'flex';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });
        if (visibleCount === 0) noResultsMsg.style.display = 'block';
        else noResultsMsg.style.display = 'none';
    }

    if(searchBox) searchBox.addEventListener('input', filterProducts);

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active-filter'));
            button.classList.add('active-filter');
            currentCategory = button.getAttribute('data-filter');
            filterProducts(); 
        });
    });
}