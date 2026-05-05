(function () {
  var btn = document.getElementById('dark-toggle');
  var body = document.body;

  function applyTheme(isLight) {
    if (isLight) {
      body.classList.add('light');
      btn.textContent = 'DARK';
    } else {
      body.classList.remove('light');
      btn.textContent = 'LITE';
    }
  }

  var saved = localStorage.getItem('picocalc-theme');
  applyTheme(saved === 'light');

  btn.addEventListener('click', function () {
    var isLight = !body.classList.contains('light');
    applyTheme(isLight);
    localStorage.setItem('picocalc-theme', isLight ? 'light' : 'dark');
  });
})();
