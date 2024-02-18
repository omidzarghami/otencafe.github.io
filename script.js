function toggleDarkMode() {
    const body = document.body;
    body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', body.classList.contains('dark-mode'));
}

const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
const storedTheme = localStorage.getItem('darkMode');

if (storedTheme === 'true' || (storedTheme === null && prefersDarkScheme.matches)) {
    document.body.classList.add('dark-mode');
}