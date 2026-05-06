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

  function checkWrapping() {
    var rows = document.querySelectorAll('.shortcut-row, .api-entry');
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var children = row.children;
      if (children.length < 2) continue;
      var wrapped = children[1].getBoundingClientRect().top > children[0].getBoundingClientRect().top;
      row.classList.toggle('is-wrapped', wrapped);
    }
  }

  window.addEventListener('load', checkWrapping);
  window.addEventListener('resize', checkWrapping);
})();
