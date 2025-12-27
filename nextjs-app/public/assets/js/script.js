function toggleDarkMode() {
    const body = document.body;
    body.classList.toggle('dark-mode');
    const isDarkMode = body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    
    // تغییر متن دکمه
    const toggleButton = document.querySelector('.dark-mode-toggle');
    if (toggleButton) {
        toggleButton.textContent = isDarkMode ? 'حالت روشن' : 'حالت تاریک';
    }
}

// بررسی تم ذخیره شده یا تنظیمات سیستم
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
const storedTheme = localStorage.getItem('darkMode');

if (storedTheme === 'true' || (storedTheme === null && prefersDarkScheme.matches)) {
    document.body.classList.add('dark-mode');
    const toggleButton = document.querySelector('.dark-mode-toggle');
    if (toggleButton) {
        toggleButton.textContent = 'حالت روشن';
    }
} else {
    const toggleButton = document.querySelector('.dark-mode-toggle');
    if (toggleButton) {
        toggleButton.textContent = 'حالت تاریک';
    }
}

document.querySelector('.hamburger-menu').addEventListener('click', function () {
    const menu = document.querySelector('.menu');
    const nav = document.querySelector('nav');
    
    menu.classList.toggle('active');
    if (nav) {
        nav.classList.toggle('active');
    }
});



// document.querySelector('.image-container').addEventListener('click', function() {
//     document.getElementById('enlarged-image').src = this.querySelector('.rounded-image').src;
//     document.getElementById('enlarged-image').style.display = 'block';
// });

// document.getElementById('enlarged-image').addEventListener('click', function() {
//     this.style.display = 'none';
// });


let mybutton = document.getElementById("myBtn");

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function () { scrollFunction() };

function scrollFunction() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        mybutton.style.display = "block";
    } else {
        mybutton.style.display = "none";
    }
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}