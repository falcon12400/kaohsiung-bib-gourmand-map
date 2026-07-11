/**
 * 高雄必比登推介美食地圖 - 主程式
 */
(function () {
  'use strict';

  // ── State ──────────────────────────────
  let map;
  let markers = {};
  let activeCategory = 'all';
  let activeRestaurantId = null;
  let markerGroup;

  // ── DOM refs ───────────────────────────
  const listEl = document.getElementById('restaurant-list');
  const searchInput = document.getElementById('search-input');
  const countEl = document.getElementById('results-count');
  const pillsEl = document.getElementById('filter-pills');
  const detailPanel = document.getElementById('detail-panel');
  const detailContent = document.getElementById('detail-content');
  const detailClose = document.getElementById('detail-close');

  // ── Init ───────────────────────────────
  function init() {
    initMap();
    renderMarkers(RESTAURANTS);
    renderList(RESTAURANTS);
    bindEvents();
    updatePillCounts(RESTAURANTS);
  }

  // ── Map Init ───────────────────────────
  function initMap() {
    map = L.map('map', {
      center: [22.6350, 120.3020],
      zoom: 12,
      zoomControl: true,
      attributionControl: true
    });

    // Dark-themed tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    markerGroup = L.featureGroup().addTo(map);
  }

  // ── Create custom marker icon ──────────
  function createMarkerIcon(restaurant) {
    const cat = restaurant.category;
    const emoji = CATEGORY_ICONS[cat] || '📍';

    const html = `
      <div class="custom-marker cat-${cat}" data-id="${restaurant.id}">
        <span class="marker-emoji">${emoji}</span>
      </div>
    `;

    return L.divIcon({
      html: html,
      className: 'custom-marker-wrapper',
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -38]
    });
  }

  // ── Render Markers ─────────────────────
  function renderMarkers(restaurants) {
    markerGroup.clearLayers();
    markers = {};

    restaurants.forEach(r => {
      const icon = createMarkerIcon(r);
      const marker = L.marker([r.lat, r.lng], { icon: icon })
        .addTo(markerGroup);

      // Popup
      const popupHtml = `
        <div class="popup-content">
          <div class="popup-name">${r.name}${r.isNew ? ' <span style="color:#e74c3c;font-size:0.7rem;">● NEW</span>' : ''}</div>
          <div class="popup-cat">${CATEGORY_ICONS[r.category]} ${r.category} · ${r.district}</div>
          <div class="popup-desc">${r.description}</div>
          <div class="popup-address">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            ${r.address}
          </div>
          <a class="popup-nav-btn" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.name + ' ' + r.address)}" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
            Google Maps 導航
          </a>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        maxWidth: 300,
        closeButton: true
      });

      marker.on('click', () => {
        setActiveRestaurant(r.id);
      });

      markers[r.id] = marker;
    });
  }

  // ── Render List ────────────────────────
  function renderList(restaurants) {
    if (restaurants.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🔍</div>
          <div class="empty-state-text">找不到符合條件的餐廳<br>請嘗試其他搜尋條件</div>
        </div>
      `;
      countEl.textContent = '0';
      return;
    }

    countEl.textContent = restaurants.length;

    listEl.innerHTML = restaurants.map((r, i) => `
      <div class="restaurant-card" data-id="${r.id}" data-category="${r.category}" style="animation-delay: ${i * 0.03}s">
        <div class="card-top">
          <span class="card-name">${r.name}</span>
          ${r.isNew ? '<span class="card-badge-new">✦ NEW</span>' : ''}
        </div>
        <span class="card-category cat-${r.category}">${CATEGORY_ICONS[r.category]} ${r.category}</span>
        <div class="card-address">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          <span>${r.address}</span>
        </div>
      </div>
    `).join('');

    // Bind card clicks
    listEl.querySelectorAll('.restaurant-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = parseInt(card.dataset.id);
        setActiveRestaurant(id);
        flyToMarker(id);
      });
    });
  }

  // ── Set Active Restaurant ──────────────
  function setActiveRestaurant(id) {
    activeRestaurantId = id;

    // Highlight card
    listEl.querySelectorAll('.restaurant-card').forEach(c => c.classList.remove('active'));
    const card = listEl.querySelector(`.restaurant-card[data-id="${id}"]`);
    if (card) {
      card.classList.add('active');
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Highlight marker
    Object.values(markers).forEach(m => {
      const el = m.getElement();
      if (el) el.querySelector('.custom-marker')?.classList.remove('active-marker');
    });
    if (markers[id]) {
      const el = markers[id].getElement();
      if (el) el.querySelector('.custom-marker')?.classList.add('active-marker');
    }

    // Show detail panel on larger screens
    if (window.innerWidth > 768) {
      showDetailPanel(id);
    }
  }

  // ── Fly to Marker ──────────────────────
  function flyToMarker(id) {
    const marker = markers[id];
    if (!marker) return;

    const latLng = marker.getLatLng();
    map.flyTo(latLng, 15, { duration: 0.8 });

    setTimeout(() => {
      marker.openPopup();
    }, 900);
  }

  // ── Show Detail Panel ──────────────────
  function showDetailPanel(id) {
    const r = RESTAURANTS.find(x => x.id === id);
    if (!r) return;

    const catColor = CATEGORY_COLORS[r.category] || '#888';

    detailContent.innerHTML = `
      <span class="detail-category-badge cat-${r.category}">${CATEGORY_ICONS[r.category]} ${r.category}</span>
      <h2 class="detail-name">
        ${r.name}
        ${r.isNew ? '<span class="detail-new-badge">2025 新入選</span>' : ''}
      </h2>

      <div class="detail-divider"></div>

      <div class="detail-section-title">簡介</div>
      <p class="detail-desc">${r.description}</p>

      <div class="detail-section-title">餐廳資訊</div>
      <div class="detail-info-row">
        <svg class="detail-info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
        </svg>
        <div>
          <div class="detail-info-label">地址</div>
          <div class="detail-info-value">${r.address}</div>
        </div>
      </div>
      <div class="detail-info-row">
        <svg class="detail-info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
        </svg>
        <div>
          <div class="detail-info-label">行政區</div>
          <div class="detail-info-value">${r.district}</div>
        </div>
      </div>
      <div class="detail-info-row">
        <svg class="detail-info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
        <div>
          <div class="detail-info-label">價位</div>
          <div class="detail-info-value">${r.price === '$' ? '💰 平價（NT$300以下）' : '💰💰 中等（NT$300-1000）'}</div>
        </div>
      </div>

      ${r.tags.length > 0 ? `
        <div class="detail-divider"></div>
        <div class="detail-section-title">標籤</div>
        <div class="detail-tags">
          ${r.tags.map(t => `<span class="detail-tag">#${t}</span>`).join('')}
        </div>
      ` : ''}

      <div class="detail-divider"></div>

      <div class="detail-actions">
        <a class="detail-action-btn primary" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.name + ' ' + r.address)}" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
          Google Maps 導航
        </a>
        <button class="detail-action-btn secondary" onclick="navigator.clipboard.writeText('${r.address}').then(()=>alert('已複製地址！'))">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          複製地址
        </button>
      </div>
    `;

    detailPanel.classList.add('open');
  }

  // ── Close Detail Panel ─────────────────
  function closeDetailPanel() {
    detailPanel.classList.remove('open');
    activeRestaurantId = null;
    listEl.querySelectorAll('.restaurant-card').forEach(c => c.classList.remove('active'));
    Object.values(markers).forEach(m => {
      const el = m.getElement();
      if (el) el.querySelector('.custom-marker')?.classList.remove('active-marker');
    });
  }

  // ── Filter & Search ────────────────────
  function getFilteredRestaurants() {
    const query = searchInput.value.trim().toLowerCase();

    return RESTAURANTS.filter(r => {
      const matchCategory = activeCategory === 'all' || r.category === activeCategory;
      const matchSearch = !query ||
        r.name.toLowerCase().includes(query) ||
        r.address.toLowerCase().includes(query) ||
        r.district.toLowerCase().includes(query) ||
        r.tags.some(t => t.toLowerCase().includes(query));

      return matchCategory && matchSearch;
    });
  }

  function applyFilter() {
    const filtered = getFilteredRestaurants();
    renderList(filtered);
    renderMarkers(filtered);

    // Fit bounds if markers exist
    if (filtered.length > 0 && markerGroup.getLayers().length > 0) {
      map.fitBounds(markerGroup.getBounds().pad(0.15), { maxZoom: 14 });
    }

    closeDetailPanel();
    updatePillCounts(filtered);
  }

  function updatePillCounts() {
    const allCount = RESTAURANTS.filter(r => {
      const query = searchInput.value.trim().toLowerCase();
      return !query ||
        r.name.toLowerCase().includes(query) ||
        r.address.toLowerCase().includes(query) ||
        r.district.toLowerCase().includes(query) ||
        r.tags.some(t => t.toLowerCase().includes(query));
    });

    const counts = {
      all: allCount.length,
      '台菜合菜': allCount.filter(r => r.category === '台菜合菜').length,
      '小吃': allCount.filter(r => r.category === '小吃').length,
      '其他料理': allCount.filter(r => r.category === '其他料理').length
    };

    pillsEl.querySelectorAll('.pill').forEach(pill => {
      const cat = pill.dataset.category;
      const countSpan = pill.querySelector('.pill-count');
      if (countSpan && counts[cat] !== undefined) {
        countSpan.textContent = counts[cat];
      }
    });
  }

  // ── Bind Events ────────────────────────
  function bindEvents() {
    // Filter pills
    pillsEl.addEventListener('click', e => {
      const pill = e.target.closest('.pill');
      if (!pill) return;

      pillsEl.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeCategory = pill.dataset.category;
      applyFilter();
    });

    // Search
    let searchTimeout;
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        applyFilter();
      }, 200);
    });

    // Detail close
    detailClose.addEventListener('click', closeDetailPanel);

    // Close detail on Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeDetailPanel();
    });

    // Handle window resize for layout changes
    window.addEventListener('resize', () => {
      map.invalidateSize();
    });
  }

  // ── Launch ─────────────────────────────
  document.addEventListener('DOMContentLoaded', init);
})();
