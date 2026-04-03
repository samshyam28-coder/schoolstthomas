const mobileToggle = document.getElementById('mobileToggle');
const navMenu = document.getElementById('navMenu');
const overlay = document.getElementById('menuOverlay');
const dropdowns = document.querySelectorAll('.dropdown');

// 1. OPEN / CLOSE MENU
mobileToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('active');
    overlay.style.display = isOpen ? 'block' : 'none';
    
    // FIX: Prevents the background body from scrolling when menu is open
    document.body.style.overflow = isOpen ? 'hidden' : 'auto';
    
    const icon = mobileToggle.querySelector('i');
    icon.classList.toggle('fa-bars');
    icon.classList.toggle('fa-times');
});

// 2. CLOSE BY OVERLAY
overlay.addEventListener('click', () => {
    navMenu.classList.remove('active');
    overlay.style.display = 'none';
    document.body.style.overflow = 'auto'; // Release scroll
    mobileToggle.querySelector('i').classList.add('fa-bars');
    mobileToggle.querySelector('i').classList.remove('fa-times');
});

dropdowns.forEach(drop => {
    const trigger = drop.querySelector('.drop-trigger');
    
    trigger.addEventListener('click', (e) => {
        // ONLY run this logic if we are on a mobile/tablet screen
        if (window.innerWidth <= 1024) {
            e.preventDefault();
            const submenu = drop.querySelector('.submenu');
            
            // Toggle logic
            if (submenu.style.display === 'block') {
                submenu.style.display = 'none';
            } else {
                // Close others first
                document.querySelectorAll('.submenu').forEach(s => s.style.display = 'none');
                submenu.style.display = 'block';
            }
        }
    });
});

// 4. SWIPE TO CLOSE
let touchStartX = 0;
navMenu.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
}, {passive: true}); // {passive: true} makes mobile scrolling smoother

navMenu.addEventListener('touchend', (e) => {
    let touchEndX = e.changedTouches[0].screenX;
    if (touchEndX > touchStartX + 60) { // Increased threshold slightly for better feel
        navMenu.classList.remove('active');
        overlay.style.display = 'none';
        document.body.style.overflow = 'auto';
        mobileToggle.querySelector('i').classList.add('fa-bars');
        mobileToggle.querySelector('i').classList.remove('fa-times');
    }
}, {passive: true});












const heroSwiper = new Swiper('#heroSwiper', {
    loop: true,
    speed: 1000,
    effect: 'fade', // Fade effect looks much cleaner for high-end school sites
    fadeEffect: {
        crossFade: true
    },
    autoplay: {
        delay: 5000,
        disableOnInteraction: false,
    },
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
});












/* --- LEADERSHIP MODAL SYSTEM --- */

/**
 * Opens a specific modal by ID
 * @param {string} modalId - The ID of the modal element
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = "block";
        // Lock background scroll for a professional feel
        document.body.style.overflow = "hidden";
    }
}

/**
 * Closes a specific modal by ID
 * @param {string} modalId - The ID of the modal element
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = "none";
        // Restore background scroll
        document.body.style.overflow = "auto";
    }
}

/* --- EVENT LISTENERS --- */

// 1. Close modal if user clicks on the dark background (outside the white box)
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        const allModals = document.querySelectorAll('.modal');
        allModals.forEach(modal => {
            modal.style.display = "none";
        });
        document.body.style.overflow = "auto";
    }
};

// 2. Close modal when the 'Escape' key is pressed
document.addEventListener('keydown', function(event) {
    if (event.key === "Escape") {
        const allModals = document.querySelectorAll('.modal');
        allModals.forEach(modal => {
            modal.style.display = "none";
        });
        document.body.style.overflow = "auto";
    }
});






















    const pupilNameInput = document.querySelector('input[name="pupil_name"]');
    const declarationName = document.getElementById('display_name');
    const form = document.getElementById('admissionForm');
    const submitBtn = document.querySelector('.submit-btn');

    // Live Sync for Declaration
    pupilNameInput.addEventListener('input', function() {
        let typedName = this.value.toUpperCase();
        declarationName.innerText = typedName || "[STUDENT NAME]";
    });

    // Google Sheets Connection
    const scriptURL = 'https://script.google.com/macros/s/AKfycbx7oCxs4gKAEuLGyu5_WOGJV1_eAkL2HBq7I9pc7ok/dev'; 

    form.addEventListener('submit', e => {
        e.preventDefault();
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting Application...';

        fetch(scriptURL, { method: 'POST', body: new FormData(form)})
            .then(response => {
                alert("Success! Application submitted to St. Thomas HSS.");
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'SUBMIT ONLINE APPLICATION';
                form.reset();
                declarationName.innerText = "[STUDENT NAME]";
            })
            .catch(error => {
                console.error('Error!', error.message);
                alert("Submission failed. Check your connection.");
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'SUBMIT ONLINE APPLICATION';
            });
    });
