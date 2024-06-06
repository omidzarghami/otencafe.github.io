// function toggleDarkMode() {
//     const body = document.body;
//     body.classList.toggle('dark-mode');
//     localStorage.setItem('darkMode', body.classList.contains('dark-mode'));
// }

// const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
// const storedTheme = localStorage.getItem('darkMode');

// if (storedTheme === 'true' || (storedTheme === null && prefersDarkScheme.matches)) {
//     document.body.classList.add('dark-mode');
// }

document.querySelector('.hamburger-menu').addEventListener('click', function () {
    document.querySelector('.menu').classList.toggle('active');
    // document.querySelector(".hamburger-menu").style.display = "none";
    // document.querySelector(".x").style.display = "block";

    // function toggleElement(elementId) {
    //     var element = document.querySelector(".hamburger-menu");
    //     // اگر المان پنهان است، نمایش آن را تغییر دهید
    //     if (element.style.display === "none") {
    //         element.style.display = "block"; // یا هر نوع نمایش مطلوب دیگر
    //     } else {
    //         // در غیر این صورت، المان را پنهان کنید
    //         element.style.display = "none";
    //     }
    // }


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