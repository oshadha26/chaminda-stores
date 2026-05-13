/*=============== FIREBASE SETUP ===============*/
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBR1m_G_iIwHPP6WS_hszjGEFsRG-0KCsw",
  authDomain: "chaminda-stores.firebaseapp.com",
  projectId: "chaminda-stores",
  storageBucket: "chaminda-stores.firebasestorage.app",
  messagingSenderId: "336496104630",
  appId: "1:336496104630:web:208ab15a5ab314b9c94217"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ලොග් වී සිටින පාරිභෝගිකයාගේ දත්ත මෙහි තබා ගනී
let loggedInUser = null;

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
        
        // AUTO FILL LOGIC (පාරිභෝගිකයා ලොග් වී ඇත්නම් ඔටෝ ෆිල් කිරීම)
        if(loggedInUser) {
            document.getElementById('cust-name').value = loggedInUser.name || "";
            document.getElementById('cust-address').value = loggedInUser.address || "";
            if(loggedInUser.area) {
                document.getElementById('delivery-type').value = 'Delivery';
                window.toggleAreaSelection();
                document.getElementById('delivery-area').value = loggedInUser.area;
            }
        }
        
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
    
    let oldBasePrice = parseFloat(addToCartBtn.getAttribute('data-oldprice'));

    const multiplier = parseFloat(selectElement.value);
    const newPrice = basePrice * multiplier;
    
    if (oldBasePrice && oldBasePrice > basePrice) {
        const newOldPrice = oldBasePrice * multiplier;
        priceElement.innerHTML = `රු. ${newPrice.toFixed(2)} <small style="text-decoration: line-through; color: #94a3b8; font-size: 0.8rem; margin-left: 5px;">රු. ${newOldPrice.toFixed(2)}</small>`;
    } else {
        priceElement.textContent = `රු. ${newPrice.toFixed(2)}`;
    }
};

document.addEventListener('click', function(e) {
    const addBtn = e.target.closest('.add-to-cart');
    if(addBtn) {
        const card = addBtn.closest('.product-card') || addBtn.closest('.package__card');
        const baseId = addBtn.getAttribute('data-id');
        let name = addBtn.getAttribute('data-name');
        
        let basePrice = parseFloat(addBtn.getAttribute('data-baseprice'));
        if (!basePrice) basePrice = parseFloat(addBtn.getAttribute('data-price'));
        
        let oldBasePrice = parseFloat(addBtn.getAttribute('data-oldprice'));
        
        let price = basePrice;
        let oldPrice = oldBasePrice || basePrice; 
        let id = baseId;
        
        const weightSelector = card.querySelector('.weight-selector');
        if(weightSelector) {
            const multiplier = parseFloat(weightSelector.value);
            const weightLabel = weightSelector.options[weightSelector.selectedIndex].getAttribute('data-label');
            price = basePrice * multiplier; 
            oldPrice = oldPrice * multiplier;
            name = `${name} (${weightLabel})`; 
            id = `${baseId}_${weightLabel}`; 
        }

        const existingItem = cartItems.find(item => item.id === id);
        if(existingItem) {
            existingItem.quantity += 1;
        } else {
            // Cart එකට දාද්දි oldPrice එකත් සේව් කරගන්නවා ඉතිරිය හදන්න
            cartItems.push({ id, name, price, oldPrice, quantity: 1 });
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

/*=============== WHATSAPP CHECKOUT & FIREBASE UPDATE ===============*/
document.getElementById('whatsapp-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const name = document.getElementById('cust-name').value;
    const address = document.getElementById('cust-address').value;
    const deliveryType = document.getElementById('delivery-type').value;
    const deliveryTime = document.getElementById('delivery-time').value; 
    const deliveryAreaElement = document.getElementById('delivery-area');
    const deliveryArea = deliveryAreaElement ? deliveryAreaElement.value : '';
    
    // මේ ඇණවුමට අදාළ මුදල සහ ඉතිරිය සෙවීම
    let totalPaid = 0;
    let totalOriginal = 0;
    
    let message = `🛒 *නව ඇණවුමක් - Chaminda Store's*\n\n👤 *නම:* ${name}\n🏠 *ලිපිනය:* ${address}\n🚚 *ක්‍රමය:* ${deliveryType === 'Delivery' ? 'නිවසට ගෙනවිත් දීම' : 'කඩෙන් ලබා ගැනීම'}\n`;
    if(deliveryType === 'Delivery' && deliveryArea) message += `📍 *ප්‍රදේශය:* ${deliveryArea}\n`;
    message += `⏱️ *අවශ්‍ය කාලය:* ${deliveryTime}\n\n📦 *භාණ්ඩ ලැයිස්තුව:*\n`;
    
    cartItems.forEach(item => { 
        message += `▪️ ${item.name} - රු. ${item.price} x ${item.quantity}\n`; 
        totalPaid += item.price * item.quantity;
        totalOriginal += item.oldPrice * item.quantity;
    });
    
    let savedAmountForOrder = totalOriginal - totalPaid;
    message += `\n💰 *මුළු මුදල:* රු. ${totalPaid.toFixed(2)}\n`;
    
    // ලොග් වී ඇත්නම් Firebase එකේ ගණන් අප්ඩේට් කිරීම
    if(loggedInUser) {
        const newTotalPaid = (loggedInUser.totalPaid || 0) + totalPaid;
        const newTotalSaved = (loggedInUser.totalSaved || 0) + savedAmountForOrder;
        
        try {
            await updateDoc(doc(db, "users", loggedInUser.uid), {
                totalPaid: newTotalPaid,
                totalSaved: newTotalSaved
            });
            loggedInUser.totalPaid = newTotalPaid;
            loggedInUser.totalSaved = newTotalSaved;
            
            // Dashboard එක ඇරලා තියෙනවා නම් Chart එකත් අප්ඩේට් කරනවා
            if(document.getElementById('dashboard-section').style.display !== 'none') {
                initChart(); 
            }
        } catch (error) {
            console.error("Firebase Update Error:", error);
        }
    }

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

            let priceDisplay = `රු. ${p.price.toFixed(2)}`;
            let discountBadge = '';
            let oldPriceData = '';

            if (p.oldPrice && p.oldPrice > p.price) {
                let discountPercentage = Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100);
                priceDisplay = `රු. ${p.price.toFixed(2)} <small style="text-decoration: line-through; color: #94a3b8; font-size: 0.8rem; margin-left: 5px;">රු. ${p.oldPrice.toFixed(2)}</small>`;
                discountBadge = `<div class="discount-tag" style="background-color: #f97316; left: 10px; right: auto;">-${discountPercentage}%</div>`;
                oldPriceData = `data-oldprice="${p.oldPrice}"`;
            }

            productsHTML += `
            <div class="glass-card product-card" data-category="${p.category}" style="position: relative;">
                ${discountBadge}
                <img src="${p.image}" alt="${p.name}" class="product-img">
                <h3 class="product-title">${p.name}</h3> 
                <p class="product-desc">${p.desc}</p>
                ${weightHTML}
                <div class="product-bottom">
                    <span class="product-price">${priceDisplay}</span>
                    <button class="glass-btn-small add-to-cart" data-id="${p.id}" data-name="${p.name}" data-baseprice="${p.price}" ${oldPriceData}>
                        <i class='bx bx-cart-add'></i>
                    </button>
                </div>
            </div>`;
        });
        productList.innerHTML = productsHTML + noResultsMsg;

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
                    <button class="button add-to-cart" data-id="${pkg.id}" data-name="${pkg.name}" data-baseprice="${pkg.price}" data-oldprice="${pkg.oldPrice}">
                        Add to Cart
                    </button>
                </div>
            </div>`;
        });
        pkgList.innerHTML = pkgsHTML;

        new Swiper(".home-swiper", { spaceBetween: 30, loop: true, autoplay: { delay: 4000, disableOnInteraction: false }, pagination: { el: ".swiper-pagination", clickable: true } });
        new Swiper(".packages-swiper", { spaceBetween: 30, loop: true, slidesPerView: 1, breakpoints: { 768: { slidesPerView: 2 }, 1024: { slidesPerView: 2 } }, navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" }, pagination: { el: ".swiper-pagination", clickable: true } });

        setupSearchAndFilter();

    } catch (e) {
        console.error("Error loading data:", e);
        new Swiper(".home-swiper", { spaceBetween: 30, loop: true, autoplay: { delay: 4000, disableOnInteraction: false }, pagination: { el: ".swiper-pagination", clickable: true } });
    }
}

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

/*=============== AOS ANIMATION INIT ===============*/
AOS.init({ duration: 800, offset: 100, once: true });

/*=============== FIREBASE AUTH & DASHBOARD LOGIC ===============*/
const authModal = document.getElementById('auth-modal'),
      userBtn = document.getElementById('user-btn'),
      authClose = document.getElementById('auth-close');
      
const tabLogin = document.getElementById('tab-login'),
      tabRegister = document.getElementById('tab-register'),
      formLogin = document.getElementById('form-login'),
      formRegister = document.getElementById('form-register'),
      authTitle = document.getElementById('auth-title');

if(userBtn) userBtn.addEventListener('click', () => authModal.classList.add('show-checkout'));
if(authClose) authClose.addEventListener('click', () => authModal.classList.remove('show-checkout'));

tabLogin.addEventListener('click', () => {
    tabLogin.classList.add('active-tab');
    tabRegister.classList.remove('active-tab');
    formLogin.style.display = 'block';
    formRegister.style.display = 'none';
    authTitle.innerText = "ගිණුමට පිවිසෙන්න";
});
tabRegister.addEventListener('click', () => {
    tabRegister.classList.add('active-tab');
    tabLogin.classList.remove('active-tab');
    formRegister.style.display = 'block';
    formLogin.style.display = 'none';
    authTitle.innerText = "නව ගිණුමක් සාදන්න";
});

// Firebase - ලොගින් වීම
document.getElementById('dummy-login-btn').addEventListener('click', async () => {
    const email = document.querySelector('#form-login input[type="email"]').value;
    const password = document.querySelector('#form-login input[type="password"]').value;
    const btn = document.getElementById('dummy-login-btn');

    if(!email || !password) return alert("කරුණාකර ඊමේල් සහ මුරපදය ඇතුළත් කරන්න!");

    try {
        btn.innerText = "පිවිසෙමින්...";
        await signInWithEmailAndPassword(auth, email, password);
        authModal.classList.remove('show-checkout');
        formLogin.reset();
        btn.innerText = "පිවිසෙන්න";
    } catch (error) {
        alert("පිවිසීමේදී දෝෂයක්: කරුණාකර නිවැරදි ඊමේල් සහ මුරපදය ලබා දෙන්න.");
        btn.innerText = "පිවිසෙන්න";
    }
});

// Firebase - අලුතින් ලියාපදිංචි වීම
document.getElementById('dummy-register-btn').addEventListener('click', async () => {
    const name = document.getElementById('reg-name').value;
    const phone = document.getElementById('reg-phone').value;
    const address = document.getElementById('reg-address').value;
    const area = document.getElementById('reg-area').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const btn = document.getElementById('dummy-register-btn');

    if(!name || !phone || !address || !area || !email || !password) {
        return alert("කරුණාකර සියලුම විස්තර සම්පූර්ණ කරන්න!");
    }

    try {
        btn.innerText = "ලියාපදිංචි වෙමින්...";
        // 1. ගිණුම සෑදීම
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. අදාළ විස්තර දත්ත සමුදායේ සේව් කිරීම (ආරම්භක ඉතිරිය 0 යි)
        await setDoc(doc(db, "users", user.uid), {
            name: name,
            phone: phone,
            address: address,
            area: area,
            email: email,
            totalPaid: 0,
            totalSaved: 0
        });

        alert("සාර්ථකව ලියාපදිංචි විය!");
        authModal.classList.remove('show-checkout');
        formRegister.reset();
        btn.innerText = "ලියාපදිංචි වන්න";
    } catch (error) {
        alert("ලියාපදිංචි වීමේදී දෝෂයක්: " + error.message);
        btn.innerText = "ලියාපදිංචි වන්න";
    }
});

// Firebase - ලොග් වී සිටිනවාදැයි නිරීක්ෂණය කිරීම (Observer)
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // ලොග් වී ඇත්නම්, Database එකෙන් විස්තර ලබාගැනීම
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            loggedInUser = { uid: user.uid, ...docSnap.data() };
            showDashboard();
        }
    } else {
        // ලොග් වී නැත්නම්
        loggedInUser = null;
        document.getElementById('dashboard-section').style.display = 'none';
    }
});

// Dashboard පෙන්වීම
function showDashboard() {
    const dashSection = document.getElementById('dashboard-section');
    dashSection.style.display = 'block';
    
    document.getElementById('dash-name').innerText = `ආයුබෝවන්, ${loggedInUser.name}!`;
    document.getElementById('dash-address').innerText = loggedInUser.address || "ලිපිනය සපයා නැත";
    document.getElementById('dash-area').innerText = loggedInUser.area || "ප්‍රදේශය සපයා නැත";
    document.getElementById('dash-phone').innerText = loggedInUser.phone || "දුරකථනය සපයා නැත";
    
    dashSection.scrollIntoView({ behavior: 'smooth' });
    initChart();
}

// Firebase - Logout
document.getElementById('logout-btn').addEventListener('click', async () => {
    try {
        await signOut(auth);
        alert("ඔබ සාර්ථකව Log Out විය.");
    } catch(error) {
        console.error("Logout Error", error);
    }
});

/*=============== CHART.JS (DOUGHNUT CHART WITH REAL DATA) ===============*/
let savingsChartInstance = null;

function initChart() {
    const ctx = document.getElementById('savingsChart');
    if(!ctx) return;

    if(savingsChartInstance) {
        savingsChartInstance.destroy();
    }
    
    // Firebase එකෙන් සැබෑ දත්ත ගැනීම
    let savedAmount = loggedInUser.totalSaved || 0; 
    let paidAmount = loggedInUser.totalPaid || 0; 
    
    // අලුත් කෙනෙක් නම් (මිලදී ගැනීම් නැතිනම්) Chart එක හිස්ව පෙන්වීමට කුඩා අගයක් දීම
    let chartPaid = paidAmount === 0 && savedAmount === 0 ? 1 : paidAmount;
    
    document.getElementById('chart-center-text').style.opacity = '0';
    document.getElementById('dash-saved-amount').innerText = `රු. ${savedAmount.toFixed(2)}`;

    savingsChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['ගෙවූ මුදල', 'ඉතිරි කළ මුදල'],
            datasets: [{
                data: [chartPaid, savedAmount], 
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)', 
                    'rgba(16, 185, 129, 0.8)'  
                ],
                borderColor: 'transparent',
                borderWidth: 0,
            }]
        },
        options: {
            responsive: true,
            cutout: '75%',
            animation: {
                animateRotate: true, 
                animateScale: false,
                duration: 2000, 
                easing: 'easeOutQuart',
                onComplete: function() {
                    document.getElementById('chart-center-text').style.opacity = '1';
                }
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#cbd5e1', font: { family: 'Poppins' } }
                }
            }
        }
    });
}
