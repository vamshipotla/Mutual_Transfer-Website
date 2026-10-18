(function () {
  var c = document.getElementById('clock');
  function tick() {
    if (c) c.textContent = new Date().toLocaleString('en-IN', {timeZone: 'Asia/Kolkata', weekday: 'short', day: 'numeric',
      month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true}) + ' IST';
  }
  tick(); setInterval(tick, 1000);

  // Station picker: <input data-picker="datalist-id">. Tap to see the full list, type to filter, tap any item to select it.
  document.querySelectorAll('input[data-picker]').forEach(function (inp) {
    var dl = document.getElementById(inp.getAttribute('data-picker'));
    if (!dl) return;
    var items = Array.from(dl.querySelectorAll('option')).map(function (o) { return {v: o.value, sp: o.hasAttribute('data-special')}; });
    var low = items.map(function (o) { return o.v.toLowerCase(); });
    var wrap = document.createElement('div'); wrap.className = 'combo';
    inp.parentNode.insertBefore(wrap, inp); wrap.appendChild(inp);
    var list = document.createElement('ul'); list.className = 'combo-list'; list.hidden = true; wrap.appendChild(list);
    var arrow = document.createElement('span'); arrow.className = 'combo-arrow'; arrow.textContent = '\u25BE'; wrap.appendChild(arrow);

    function valid() {
      var v = inp.value.trim();
      if (!v) { inp.setCustomValidity(inp.required ? 'Choose from the list' : ''); return -1; }
      var i = low.indexOf(v.toLowerCase());
      inp.setCustomValidity(i < 0 ? 'Choose from the list' : '');
      return i;
    }
    function pick(v) { inp.value = v; valid(); list.hidden = true; }
    function render(filter) {
      var f = (filter || '').trim().toLowerCase(), shown = [];
      items.forEach(function (o) {
        var p = o.v.toLowerCase().indexOf(f);
        if (p >= 0) shown.push({o: o, rank: o.sp ? -1 : (p === 0 ? 0 : 1)});  // special first, then "starts with", then "contains"
      });
      shown.sort(function (a, b) { return a.rank - b.rank; });
      list.innerHTML = '';
      shown.forEach(function (s) {
        var li = document.createElement('li'); li.textContent = s.o.v; if (s.o.sp) li.className = 'sp';
        li.addEventListener('mousedown', function (e) { e.preventDefault(); pick(s.o.v); });  // select before the input loses focus
        list.appendChild(li);
      });
      if (!shown.length) { var n = document.createElement('li'); n.className = 'none'; n.textContent = 'No match'; list.appendChild(n); }
      list.hidden = false;
    }
    inp.addEventListener('focus', function () { render(''); });
    inp.addEventListener('click', function () { if (list.hidden) render(''); });
    inp.addEventListener('input', function () { render(inp.value); valid(); });
    inp.addEventListener('change', function () { var i = valid(); if (i >= 0) inp.value = items[i].v; });
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' || e.key === 'Tab') { list.hidden = true; }
      else if (e.key === 'Enter' && !list.hidden) {
        var first = list.querySelector('li:not(.none)');
        if (first) { e.preventDefault(); pick(first.textContent); }
      }
    });
    arrow.addEventListener('mousedown', function (e) {
      e.preventDefault();
      if (inp.disabled) return;
      if (list.hidden) { inp.focus(); render(''); } else { list.hidden = true; }
    });
    document.addEventListener('pointerdown', function (e) {  // tap outside closes the list
      if (!wrap.contains(e.target) && !list.hidden) {
        list.hidden = true;
        var i = valid(); if (i >= 0) inp.value = items[i].v;
      }
    });
    valid();
  });
})();
