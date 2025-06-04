const categories = document.querySelectorAll('.category');

categories.forEach(cat => {
  cat.addEventListener('click', () => {
    categories.forEach(c => c.classList.remove('active'));
    cat.classList.add('active');
  });
});

const sidebarL = document.querySelector('.sidebar');
const logo = document.querySelector('.logo-sidebar');
const sidebarR = document.querySelector('.sidebar-right');

sidebarL.addEventListener('click', () => {
    sidebarL.classList.toggle('expanded');
    logo.classList.toggle('expanded');
});

sidebarR.addEventListener('click', () => {
    sidebarR.classList.toggle('expanded');
});