(function(){
  'use strict';

  var PAGE = document.documentElement.getAttribute('data-lx-page') || '';
  var S = null;
  try { S = window.sessionStorage; } catch (e) {}

  function get(k) {
    try { return JSON.parse(S.getItem(k)); } catch (e) { return null; }
  }
  function set(k, v) {
    try { S.setItem(k, JSON.stringify(v)); } catch (e) {}
  }
  function del(k) {
    try { S.removeItem(k); } catch (e) {}
  }

  window.LX = {
    get: get,
    set: set,
    del: del,
    page: PAGE
  };

  /* Navigation trail maintenance */
  function syncTrail() {
    var pageId = PAGE || 'step1';
    var t = get('lx_trail') || [];
    if (t[t.length - 1] === pageId) {
      /* reload on same page */
    } else if (t.length > 1 && t[t.length - 2] === pageId) {
      t.pop(); /* user navigated Back */
    } else {
      t.push(pageId); /* forward navigation */
    }
    set('lx_trail', t);
  }
  syncTrail();

  /* Selection storage helpers */
  LX.getSelection = function() {
    var sel = get('lx_selection');
    if (!sel) {
      var legacy = get('lx_tech');
      if (legacy) {
        sel = { preset: 'asset-tracking', useCase: legacy.use, tech: legacy.tech };
      }
    }
    return sel;
  };

  LX.setSelection = function(sel) {
    set('lx_selection', sel);
    if (sel) {
      set('lx_tech', { use: sel.useCase, tech: sel.tech });
    }
  };

  /* Navigation back and start over */
  LX.goBack = function(fallback) {
    var t = get('lx_trail') || [];
    var prev = t[t.length - 2];
    if (prev && history.length > 1 && prev !== 'step1') {
      history.back();
    } else {
      var target = fallback;
      if (!target && window.LX_ROUTES) {
        var sel = LX.getSelection();
        if (sel && sel.preset && window.LX_ROUTES.presets[sel.preset]) {
          target = window.LX_ROUTES.presets[sel.preset];
        }
      }
      location.href = target || 'step1.html';
    }
  };

  LX.startOver = function() {
    del('lx_selection');
    del('lx_tech');
    del('lx_query');
    set('lx_trail', ['step1']);
    location.href = 'step1.html';
  };

  LX.go = function(url) {
    location.href = url;
  };

  /* Wire generic buttons */
  function wireGlobalButtons() {
    var buttons = document.querySelectorAll('button');
    for (var i = 0; i < buttons.length; i++) {
      var txt = buttons[i].textContent.trim();
      if (txt === 'Start over') {
        buttons[i].addEventListener('click', LX.startOver);
      }
      if (txt === 'Back to configuration') {
        buttons[i].addEventListener('click', function() {
          var sel = LX.getSelection();
          var fallback = 'step2-asset-tracking.html';
          if (sel && sel.preset && window.LX_ROUTES && window.LX_ROUTES.presets[sel.preset]) {
            fallback = window.LX_ROUTES.presets[sel.preset];
          } else if (document.referrer && document.referrer.indexOf('step2') !== -1) {
            fallback = document.referrer;
          }
          LX.goBack(fallback);
        });
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wireGlobalButtons);
  } else {
    wireGlobalButtons();
  }

  /* Handle pageshow, especially with event.persisted (browser Back via cache) */
  window.addEventListener('pageshow', function(e) {
    syncTrail();
    if (window.LX.onShow) {
      window.LX.onShow(e.persisted);
    }
  });

  /* ----------------------------------------------------
     STEP 1: Landing Page Logic
  ---------------------------------------------------- */
  function initStep1() {
    var input = document.getElementById('lx-query');
    var go = document.getElementById('lx-get-roi');
    if (!input || !go) return;

    function toggle() {
      go.disabled = !input.value.trim();
    }

    function submit(query) {
      var q = (query || input.value || '').trim();
      if (!q) return;
      LX.set('lx_query', q);
      var presetKey = 'asset-tracking';
      if (window.LX_ROUTES) {
        presetKey = window.LX_ROUTES.matchQuery(q);
      }
      LX.setSelection({ preset: presetKey, useCase: null, tech: null });
      var target = (window.LX_ROUTES && window.LX_ROUTES.presets[presetKey]) ? window.LX_ROUTES.presets[presetKey] : 'step2-asset-tracking.html';
      LX.go(target);
    }

    function selectPreset(presetName) {
      var presetKey = 'asset-tracking';
      if (window.LX_ROUTES && window.LX_ROUTES.presetAliases[presetName]) {
        presetKey = window.LX_ROUTES.presetAliases[presetName];
      } else if (presetName) {
        presetKey = presetName.toLowerCase().replace(/\s+/g, '-');
      }
      LX.set('lx_query', presetName);
      LX.setSelection({ preset: presetKey, useCase: null, tech: null });
      var target = (window.LX_ROUTES && window.LX_ROUTES.presets[presetKey]) ? window.LX_ROUTES.presets[presetKey] : 'step2-asset-tracking.html';
      LX.go(target);
    }

    input.addEventListener('input', toggle);
    toggle();

    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && input.value.trim()) {
        submit(input.value.trim());
      }
    });

    go.addEventListener('click', function() {
      if (input.value.trim()) {
        submit(input.value.trim());
      }
    });

    var presetButtons = document.querySelectorAll('.lx-preset');
    presetButtons.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var p = btn.getAttribute('data-preset') || btn.querySelector('h3, b, span').textContent.trim();
        selectPreset(p);
      });

      function place() {
        var tip = btn.querySelector('.lx-tip');
        if (!tip) return;
        tip.style.setProperty('--tip-shift', '0px');
        var r = btn.getBoundingClientRect();
        var w = tip.offsetWidth;
        var c = r.left + r.width / 2;
        var m = 12;
        var shift = 0;
        if (c - w / 2 < m) {
          shift = m - (c - w / 2);
        } else if (c + w / 2 > window.innerWidth - m) {
          shift = (window.innerWidth - m) - (c + w / 2);
        }
        tip.style.setProperty('--tip-shift', shift + 'px');
      }

      btn.addEventListener('mouseenter', place);
      btn.addEventListener('focus', place);
    });
  }

  /* ----------------------------------------------------
     STEP 2: Selection Page Logic
  ---------------------------------------------------- */
  function initStep2() {
    var opts = [].slice.call(document.querySelectorAll('.lx-opt'));
    if (opts.length === 0) return;

    // Detect preset for this page
    var currentPreset = 'asset-tracking';
    var path = location.pathname.toLowerCase();
    if (path.indexOf('infant-protection') !== -1) {
      currentPreset = 'infant-protection';
    } else if (path.indexOf('forklift-safety') !== -1) {
      currentPreset = 'forklift-safety';
    } else if (path.indexOf('asset-tracking') !== -1 || path.indexOf('step2') !== -1) {
      currentPreset = 'asset-tracking';
    }

    // Maturity journey panel toggle
    var hovers = document.querySelectorAll('.lx-hover');
    hovers.forEach(function(h) {
      var head = h.querySelector('.lx-hover-head');
      if (head) {
        head.addEventListener('click', function(e) {
          h.classList.toggle('lx-open');
          e.stopPropagation();
        });
        head.addEventListener('keydown', function(e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            h.classList.toggle('lx-open');
          }
        });
      }
    });
    document.addEventListener('click', function(e) {
      hovers.forEach(function(h) {
        if (!h.contains(e.target)) h.classList.remove('lx-open');
      });
    });

    var btn = document.getElementById('lx-calc');
    var btnText = document.getElementById('lx-calc-text');
    var btnIcon = document.getElementById('lx-calc-icon');
    var btnSpinner = document.getElementById('lx-calc-spinner');
    var selDisplay = document.getElementById('lx-selection-display');
    var statusText = document.getElementById('lx-status-text');
    var errorDisplay = document.getElementById('lx-error-display');
    var retryBtn = document.getElementById('lx-retry-btn');
    var compareToggle = document.getElementById('lx-compare-toggle');
    var compareBody = document.getElementById('lx-compare-body');

    var isCalculating = false;
    var currentSel = null;

    opts.forEach(function(o) {
      o.setAttribute('role', 'radio');
      o.setAttribute('aria-checked', 'false');
    });

    function cardOf(o) {
      return o.closest('.lx-card');
    }

    function useCaseOfCard(card) {
      if (!card) return '';
      return card.getAttribute('data-usecase') || (card.querySelector('h3') ? card.querySelector('h3').textContent.trim() : '');
    }

    // Retrieve technologies belonging to a specific use case
    function techsForUseCase(useCase) {
      if (window.TECH_COMPARISON_DATA && window.TECH_COMPARISON_DATA.useCaseTechs && window.TECH_COMPARISON_DATA.useCaseTechs[useCase]) {
        return window.TECH_COMPARISON_DATA.useCaseTechs[useCase];
      }
      // Fallback: examine card on the page
      var cards = document.querySelectorAll('.lx-card');
      for (var i = 0; i < cards.length; i++) {
        if (useCaseOfCard(cards[i]) === useCase) {
          var cardOpts = cards[i].querySelectorAll('.lx-opt');
          var found = [];
          cardOpts.forEach(function(co) {
            var t = co.getAttribute('data-tech') || co.querySelector('span').textContent.trim();
            if (found.indexOf(t) === -1) found.push(t);
          });
          if (found.length > 0) return found;
        }
      }
      return ['UWB', 'BLE RSSI'];
    }

    // Quick comparison panel dynamic rendering
    function updateComparisonPanel(useCase, activeTech) {
      if (!compareBody) return;
      var cards = document.querySelectorAll('.lx-card');
      var activeUc = useCase || (cards.length > 0 ? useCaseOfCard(cards[0]) : '');
      var offeredTechs = techsForUseCase(activeUc).slice(0, 2); // Show only the 2 technologies of the use case

      // Build or update the comparison panel HTML
      var dataObj = window.TECH_COMPARISON_DATA;
      if (!dataObj) return;

      var colCount = offeredTechs.length;
      var colStyle = 'style="grid-template-columns: repeat(' + colCount + ', minmax(0, 1fr));"';

      var html = '';
      // Header row
      html += '<div class="lx-compare-tech-row" ' + colStyle + '>';
      offeredTechs.forEach(function(t) {
        var isSel = (activeTech && t.toLowerCase() === activeTech.toLowerCase());
        html += '<div class="lx-compare-col-header' + (isSel ? ' lx-selected-tech' : '') + '" data-tech="' + t + '">';
        html += '<span class="lx-tech-title">' + t + '</span>';
        html += '<span class="lx-unoffered-badge lx-is-hidden" title="Not offered for this use-case">Not offered for this use-case</span>';
        html += '</div>';
      });
      html += '</div>';

      // Metric rows
      dataObj.metrics.forEach(function(m, idx) {
        var isLast = (idx === dataObj.metrics.length - 1);
        html += '<div class="lx-metric-block' + (isLast ? ' lx-metric-block-last' : '') + '">';
        html += '<div class="lx-metric-label">' + m.label + '</div>';
        html += '<div class="lx-metric-row" ' + colStyle + '>';
        offeredTechs.forEach(function(t) {
          var isSel = (activeTech && t.toLowerCase() === activeTech.toLowerCase());
          var val = m.values[t];
          if (!val) {
            // try case-insensitive lookup
            var tNorm = t.replace(/\s+/g, '').toUpperCase();
            var keys = Object.keys(m.values);
            for (var k = 0; k < keys.length; k++) {
              if (keys[k].replace(/\s+/g, '').toUpperCase() === tNorm) {
                val = m.values[keys[k]];
                break;
              }
            }
          }
          if (!val) val = 'Data pending';
          html += '<div class="lx-metric-cell' + (isSel ? ' lx-selected-tech' : '') + '" data-tech="' + t + '">' + val + '</div>';
        });
        html += '</div></div>';
      });

      compareBody.innerHTML = html;
    }

    function render(sel) {
      currentSel = sel;
      opts.forEach(function(o) {
        var on = (o === sel);
        o.classList.toggle('lx-selected', on);
        o.setAttribute('aria-checked', on ? 'true' : 'false');
        o.tabIndex = (sel ? on : (o === opts[0])) ? 0 : -1;
      });

      var activeCard = sel ? cardOf(sel) : null;
      document.querySelectorAll('.lx-card').forEach(function(c) {
        var active = (!!sel && c === activeCard);
        c.classList.toggle('lx-card-active', active);
        var badge = c.querySelector('.lx-card-badge');
        if (badge) {
          badge.classList.toggle('lx-is-hidden', !active);
        }
      });

      if (sel) {
        var use = useCaseOfCard(cardOf(sel));
        var tech = sel.getAttribute('data-tech') || sel.querySelector('span').textContent.trim();
        if (selDisplay) {
          selDisplay.innerHTML = 'Selected: <b>' + tech + '</b> for ' + use;
        }
        if (btn && !isCalculating) {
          btn.disabled = false;
          btn.title = '';
        }
        updateComparisonPanel(use, tech);
      } else {
        if (selDisplay) {
          selDisplay.textContent = 'No selection yet';
        }
        if (btn) {
          btn.disabled = true;
          btn.title = 'Choose a technology option first';
        }
        var firstCard = document.querySelector('.lx-card');
        var firstUse = firstCard ? useCaseOfCard(firstCard) : '';
        updateComparisonPanel(firstUse, null);
      }
    }

    function pick(o) {
      var use = useCaseOfCard(cardOf(o));
      var tech = o.getAttribute('data-tech') || o.querySelector('span').textContent.trim();
      LX.setSelection({ preset: currentPreset, useCase: use, tech: tech });
      render(o);
    }

    opts.forEach(function(o, i) {
      o.addEventListener('click', function() { pick(o); });
      o.addEventListener('keydown', function(e) {
        var d = (e.key === 'ArrowDown' || e.key === 'ArrowRight') ? 1 : (e.key === 'ArrowUp' || e.key === 'ArrowLeft') ? -1 : 0;
        if (d) {
          e.preventDefault();
          var next = opts[(i + d + opts.length) % opts.length];
          next.focus();
          pick(next);
        }
      });
    });

    function restore() {
      var st = LX.getSelection();
      var found = null;
      if (st && st.tech) {
        var stNormTech = st.tech.replace(/\s+/g, '').toUpperCase();
        var stNormUse = (st.useCase || '').toLowerCase().trim();
        opts.forEach(function(o) {
          var oTech = (o.getAttribute('data-tech') || o.querySelector('span').textContent).replace(/\s+/g, '').toUpperCase();
          var oUse = useCaseOfCard(cardOf(o)).toLowerCase().trim();
          if (oTech === stNormTech && (!stNormUse || oUse === stNormUse || oUse.indexOf(stNormUse) !== -1 || stNormUse.indexOf(oUse) !== -1)) {
            found = o;
          }
        });
      }
      render(found);
    }

    function resetButtonState() {
      isCalculating = false;
      if (btn) {
        btn.setAttribute('aria-busy', 'false');
        if (currentSel) {
          btn.disabled = false;
          btn.title = '';
        } else {
          btn.disabled = true;
          btn.title = 'Choose a technology option first';
        }
      }
      if (btnSpinner) btnSpinner.classList.add('lx-is-hidden');
      if (btnIcon) btnIcon.classList.remove('lx-is-hidden');
      if (btnText) btnText.textContent = 'Calculate ROI & view financial analysis';
      if (statusText) statusText.classList.add('lx-is-hidden');
      if (errorDisplay) errorDisplay.classList.add('lx-is-hidden');
    }

    function runCalculation() {
      if (isCalculating || !currentSel || !btn || btn.disabled) return;
      isCalculating = true;
      btn.disabled = true;
      btn.setAttribute('aria-busy', 'true');
      if (btnIcon) btnIcon.classList.add('lx-is-hidden');
      if (btnSpinner) btnSpinner.classList.remove('lx-is-hidden');
      if (btnText) btnText.textContent = 'Calculating...';
      if (statusText) statusText.classList.remove('lx-is-hidden');
      if (errorDisplay) errorDisplay.classList.add('lx-is-hidden');

      var use = useCaseOfCard(cardOf(currentSel));
      var tech = currentSel.getAttribute('data-tech') || currentSel.querySelector('span').textContent.trim();
      var target = 'step4.html';
      if (window.LX_ROUTES) {
        target = window.LX_ROUTES.resolveTarget(currentPreset, use, tech);
      }

      setTimeout(function() {
        LX.go(target);
      }, 900);
    }

    if (btn) btn.addEventListener('click', runCalculation);
    if (retryBtn) {
      retryBtn.addEventListener('click', function(e) {
        e.preventDefault();
        runCalculation();
      });
    }

    if (compareToggle && compareBody) {
      compareToggle.addEventListener('click', function() {
        if (window.innerWidth < 768) {
          var isHidden = compareBody.classList.contains('lx-is-hidden');
          compareBody.classList.toggle('lx-is-hidden', !isHidden);
          compareToggle.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
          var chv = compareToggle.querySelector('.lx-compare-chevron');
          if (chv) chv.classList.toggle('is-open', isHidden);
        }
      });
    }

    LX.onShow = function() {
      restore();
      resetButtonState();
    };

    restore();
    resetButtonState();
  }

  /* ----------------------------------------------------
     STEP 4: Results Page Interactive Chart
  ---------------------------------------------------- */
  function initStep4() {
    var svg = document.querySelector('svg[role=img]');
    if (!svg) return;

    var card = svg.closest('.rounded-2xl');
    if (!card) return;
    card.classList.add('lx-chart-card');

    function money(t) {
      var n = parseFloat(String(t).replace(/[^0-9.\-]/g, ''));
      return /^\s*-/.test(t) ? -Math.abs(n) : n;
    }
    function fmt(n) {
      return (n < 0 ? '-' : '') + '$' + Math.abs(Math.round(n)).toLocaleString('en-US');
    }

    var years = [].slice.call(document.querySelectorAll('dl')).map(function(dl, i) {
      var v = {};
      [].slice.call(dl.children).forEach(function(row) {
        var dt = row.querySelector('dt'), dd = row.querySelector('dd');
        if (dt && dd) v[dt.textContent.trim()] = money(dd.textContent);
      });
      return {
        name: 'Year ' + (i + 1),
        invest: (v.Investment || 0) + (v.Recurring || 0),
        savings: v.Savings || 0,
        net: v.Net || 0
      };
    });

    if (years.length < 3) return;

    var NS = 'http://www.w3.org/2000/svg', X0 = 56, W = 648, colW = W / 3;
    var bands = [], dots = [].slice.call(svg.querySelectorAll('circle'));

    years.forEach(function(y, i) {
      var b = document.createElementNS(NS, 'rect');
      b.setAttribute('x', X0 + i * colW);
      b.setAttribute('y', 0);
      b.setAttribute('width', colW);
      b.setAttribute('height', 280);
      b.setAttribute('class', 'lx-band');
      svg.insertBefore(b, svg.firstChild);
      bands.push(b);
    });

    svg.setAttribute('tabindex', '0');
    svg.setAttribute('aria-label', (svg.getAttribute('aria-label') || 'Financial projection chart') + '. Hover or use arrow keys to see exact figures for each year.');

    var tip = document.createElement('div');
    tip.className = 'lx-chart-tip';
    tip.setAttribute('role', 'status');
    card.appendChild(tip);

    var current = -1;
    function row(color, label, val, cls) {
      return '<div class="lx-tt-row"><span class="d" style="background:' + color + '"></span><span class="l">' + label + '</span><b class="' + (cls || '') + '">' + val + '</b></div>';
    }

    function show(i) {
      if (i !== current) {
        current = i;
        var y = years[i];
        tip.innerHTML = '<div class="lx-tt-title">' + y.name + '</div>' +
          row('#94a3b8', 'Investment', fmt(y.invest)) +
          row('#34d399', 'Annual savings', fmt(y.savings)) +
          row('#2563eb', 'Net benefit', fmt(y.net), y.net < 0 ? 'neg' : 'pos');
        bands.forEach(function(b, k) { b.classList.toggle('on', k === i); });
        dots.forEach(function(d, k) { d.setAttribute('r', k === i ? 6 : 4); });
      }
      tip.classList.add('on');
    }

    function hide() {
      current = -1;
      tip.classList.remove('on');
      bands.forEach(function(b) { b.classList.remove('on'); });
      dots.forEach(function(d) { d.setAttribute('r', 4); });
    }

    function place(px, py) {
      var c = card.getBoundingClientRect(), w = tip.offsetWidth, h = tip.offsetHeight;
      var x = px - c.left + 16, y = py - c.top + 16;
      if (x + w > c.width - 8) x = px - c.left - w - 16;
      if (x < 8) x = 8;
      if (y + h > c.height - 8) y = c.height - h - 8;
      tip.style.left = x + 'px';
      tip.style.top = Math.max(8, y) + 'px';
    }

    function idxAt(clientX) {
      var r = svg.getBoundingClientRect();
      var x = (clientX - r.left) * (720 / r.width);
      if (x < X0 || x > X0 + W) return -1;
      return Math.min(2, Math.floor((x - X0) / colW));
    }

    function move(e) {
      var i = idxAt(e.clientX);
      if (i < 0) { hide(); return; }
      show(i);
      place(e.clientX, e.clientY);
    }

    svg.addEventListener('pointermove', move);
    svg.addEventListener('pointerdown', move);
    svg.addEventListener('pointerleave', hide);
    svg.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') { hide(); return; }
      var d = (e.key === 'ArrowRight') ? 1 : (e.key === 'ArrowLeft') ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      var i = current < 0 ? (d > 0 ? 0 : 2) : Math.max(0, Math.min(2, current + d));
      show(i);
      var r = svg.getBoundingClientRect();
      place(r.left + (X0 + (i + 0.5) * colW) * r.width / 720, r.top + r.height * 0.25);
    });
    svg.addEventListener('blur', hide);
  }

  /* Initialize appropriate modules on load */
  function initPage() {
    if (document.getElementById('lx-query')) {
      initStep1();
    }
    if (document.querySelector('.lx-opt')) {
      initStep2();
    }
    if (document.querySelector('svg[role=img]')) {
      initStep4();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPage);
  } else {
    initPage();
  }
})();
