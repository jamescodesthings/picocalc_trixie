(function () {
  var btn = document.getElementById('dark-toggle');
  var body = document.body;

  function applyDark(isDark) {
    if (isDark) {
      body.classList.add('dark');
      btn.innerHTML = '&#9728;';
    } else {
      body.classList.remove('dark');
      btn.innerHTML = '&#9790;';
    }
  }

  applyDark(localStorage.getItem('picocalc-dark') === '1');

  btn.addEventListener('click', function () {
    var isDark = !body.classList.contains('dark');
    applyDark(isDark);
    localStorage.setItem('picocalc-dark', isDark ? '1' : '0');
  });
})();
