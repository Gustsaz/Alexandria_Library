const categories = document.querySelectorAll('.category');

categories.forEach(cat => {
  cat.addEventListener('click', () => {
    categories.forEach(c => c.classList.remove('active'));
    cat.classList.add('active');
  });
});

/*abrir sidebars*/

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

function openRightSidebar() {
    const sidebar = document.getElementById('sidebarRight');
    sidebar.classList.add('expanded');
  }

 //modo escuor/claro ----------------------------------- 

const toggleThemeBtn = document.querySelector('.mode-toggle');
const themeIcon = document.getElementById('theme-icon');
const Logo = document.querySelector('.logo-sidebar');


function applyTheme(theme) {
  if (theme === 'dark') {
    document.body.classList.add('dark-mode');
    themeIcon.src = 'img/Claro.png';
    Logo.src = 'img/LogoClaro.png';
  } else {
    document.body.classList.remove('dark-mode');
    themeIcon.src = 'img/Escuro.png';
    Logo.src = 'img/LogoEscuro.png';
  }
}

const savedTheme = localStorage.getItem('theme');
applyTheme(savedTheme || 'light');  // padrão é 'light'

toggleThemeBtn.addEventListener('click', () => {
  const isDarkMode = document.body.classList.toggle('dark-mode');
  const newTheme = isDarkMode ? 'dark' : 'light';
  localStorage.setItem('theme', newTheme);
  applyTheme(newTheme);
});
