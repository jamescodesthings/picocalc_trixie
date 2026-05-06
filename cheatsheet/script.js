(function () {
  var btn = document.getElementById('dark-toggle');
  var body = document.body;

  function applyTheme(isLight) {
    if (isLight) {
      body.classList.add('light');
      btn.textContent = 'dark';
    } else {
      body.classList.remove('light');
      btn.textContent = 'lite';
    }
  }

  var saved = localStorage.getItem('picocalc-theme');
  applyTheme(saved !== 'dark');

  btn.addEventListener('click', function () {
    var isLight = !body.classList.contains('light');
    applyTheme(isLight);
    localStorage.setItem('picocalc-theme', isLight ? 'light' : 'dark');
  });

})();
