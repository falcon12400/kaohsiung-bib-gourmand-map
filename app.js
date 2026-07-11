/**
 * 高雄必比登推介美食地圖 - 主程式
 */
(function () {
  'use strict';

  const DEFAULT_TYPE = '必比登美食';

  // ── State ──────────────────────────────
  let map;
  let markers = {};
  let activeCategory = 'all';
  let activeRestaurantId = null;
  let activeSidebarTab = 'list';
  let markerGroup;
  let userLocationMarker = null;
  let restaurants = [];
  let filterOptions = [];
  const hiddenFacets = new Set();
  const groupCollapsedState = {};  // track collapsed groups by category name

  // ── DOM refs ───────────────────────────
  const listEl = document.getElementById('restaurant-list');
  const searchInput = document.getElementById('search-input');
  const countEl = document.getElementById('results-count');
  const pillsEl = document.getElementById('filter-pills');
  const mapLegendEl = document.getElementById('map-legend');
  const locateMeBtn = document.getElementById('locate-me-btn');
  const mapStatusBanner = document.getElementById('map-status-banner');
  const sidebarTabsEl = document.getElementById('sidebar-tabs');
  const sidebarPanelList = document.getElementById('sidebar-panel-list');
  const sidebarPanelFilters = document.getElementById('sidebar-panel-filters');
  const typeFilterList = document.getElementById('type-filter-list');
  const categoryFilterList = document.getElementById('category-filter-list');
  const facetFilterList = document.getElementById('facet-filter-list');
  const showAllBtn = document.getElementById('show-all-btn');
  const hideAllBtn = document.getElementById('hide-all-btn');
  const showBibBtn = document.getElementById('show-bib-btn');
  const detailPanel = document.getElementById('detail-panel');
  const detailContent = document.getElementById('detail-content');
  const detailClose = document.getElementById('detail-close');
  const sidebarEl = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const legendToggleBtn = document.getElementById('legend-toggle-btn');
  const appHeader = document.getElementById('app-header');

  const BIB_TYPE = TYPE_ORDER[0];
  const ATTRACTION_TYPE = TYPE_ORDER[1];
  const BIB_CATEGORIES = new Set(CATEGORY_ORDER[BIB_TYPE] || []);
  let isMobileSheetExpanded = false;
  let isLegendExpanded = false;

  // ── Init ───────────────────────────────
  function init() {
    restaurants = normalizeRestaurants(RESTAURANTS);
    filterOptions = buildFilterOptions(restaurants);
    initMap();
    renderPills();
    renderFilterControls();
    renderMarkers(restaurants);
    renderList(restaurants);
    renderLegend(restaurants);
    syncResponsiveUi();
    bindEvents();
    updatePillCounts();
  }

  function normalizeRestaurants(items) {
    return items.map(item => {
      const type = item.type || DEFAULT_TYPE;
      const facets = Array.from(new Set([
        type,
        item.category,
        ...(item.facets || [])
      ].filter(Boolean)));

      return {
        ...item,
        type,
        facets
      };
    });
  }

  function buildFilterOptions(items) {
    const options = new Map();

    items.forEach(item => {
      options.set(item.type, {
        key: item.type,
        kind: 'type',
        label: item.type,
        color: TYPE_CONFIG[item.type]?.color || '#5b8def'
      });

      options.set(item.category, {
        key: item.category,
        kind: 'category',
        label: item.category,
        color: CATEGORY_COLORS[item.category] || '#888'
      });

      item.facets.forEach(facet => {
        if (facet === item.type || facet === item.category) return;
        options.set(facet, {
          key: facet,
          kind: 'facet',
          label: facet,
          color: '#7f8c8d'
        });
      });
    });

    return Array.from(options.values()).sort((a, b) => a.label.localeCompare(b.label, 'zh-Hant'));
  }

  function renderFilterControls() {
    renderFilterGroup(typeFilterList, filterOptions.filter(option => option.kind === 'type'));
    renderFilterGroup(categoryFilterList, filterOptions.filter(option => option.kind === 'category'));
    renderFilterGroup(facetFilterList, filterOptions.filter(option => option.kind === 'facet'));
  }

  function getOrderedCategories(items = restaurants) {
    const categories = Array.from(new Set(items.map(item => item.category)));
    const ordered = [];
    const seen = new Set();

    TYPE_ORDER.forEach(type => {
      const typeOrder = CATEGORY_ORDER[type] || [];
      typeOrder.forEach(category => {
        if (categories.includes(category) && !seen.has(category)) {
          ordered.push(category);
          seen.add(category);
        }
      });
    });

    categories
      .sort((a, b) => a.localeCompare(b, 'zh-Hant'))
      .forEach(category => {
        if (!seen.has(category)) {
          ordered.push(category);
          seen.add(category);
        }
      });

    return ordered;
  }

  function getVisibleTypes(items = restaurants) {
    const types = Array.from(new Set(items.map(item => item.type)));
    const ordered = TYPE_ORDER.filter(type => types.includes(type));
    const remaining = types
      .filter(type => !TYPE_ORDER.includes(type))
      .sort((a, b) => a.localeCompare(b, 'zh-Hant'));

    return ordered.concat(remaining);
  }

  function useTypeLevelIcons(items = restaurants) {
    return getVisibleTypes(items).length > 1;
  }

  function getItemIcon(item, items = restaurants) {
    if (useTypeLevelIcons(items)) {
      return TYPE_CONFIG[item.type]?.emoji || '📍';
    }

    return CATEGORY_ICONS[item.category] || '📍';
  }

  function getLegendEntries(items = restaurants) {
    if (useTypeLevelIcons(items)) {
      return getVisibleTypes(items).map(type => ({
        key: type,
        label: type,
        color: TYPE_CONFIG[type]?.color || '#888',
        emoji: TYPE_CONFIG[type]?.emoji || '📍'
      }));
    }

    return getOrderedCategories(items).map(category => ({
      key: category,
      label: category,
      color: CATEGORY_COLORS[category] || '#888',
      emoji: CATEGORY_ICONS[category] || '📍'
    }));
  }

  function getMarkerColor(item, items = restaurants) {
    if (useTypeLevelIcons(items)) {
      return TYPE_CONFIG[item.type]?.color || '#888';
    }

    return CATEGORY_COLORS[item.category] || TYPE_CONFIG[item.type]?.color || '#888';
  }

  function renderPills() {
    const orderedCategories = getOrderedCategories();
    pillsEl.innerHTML = [
      `<button class="pill${activeCategory === 'all' ? ' active' : ''}" data-category="all">全部 <span class="pill-count">${restaurants.length}</span></button>`,
      ...orderedCategories.map(category => `
        <button class="pill${activeCategory === category ? ' active' : ''}" data-category="${category}">
          ${category}
          <span class="pill-count">0</span>
        </button>
      `)
    ].join('');
  }

  function renderLegend(items) {
    const legendEntries = getLegendEntries(items);
    mapLegendEl.innerHTML = `
      <div class="legend-title">圖例</div>
      ${legendEntries.map(entry => `
        <div class="legend-item">
          <span class="legend-dot" style="background: ${entry.color};"></span>
          <span>${entry.emoji} ${entry.label}</span>
        </div>
      `).join('')}
    `;
  }

  function setMobileSheetExpanded(expanded) {
    isMobileSheetExpanded = expanded;
    if (!sidebarEl || !sidebarToggle) return;

    sidebarEl.classList.toggle('sheet-expanded', expanded);
    sidebarEl.classList.toggle('sheet-collapsed', !expanded);
    sidebarToggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  }

  function toggleMobileSheet(forceExpanded) {
    const expanded = typeof forceExpanded === 'boolean'
      ? forceExpanded
      : !isMobileSheetExpanded;

    setMobileSheetExpanded(expanded);

    if (window.innerWidth <= 768) {
      setTimeout(() => map.invalidateSize(), 320);
    }
  }

  function setLegendExpanded(expanded) {
    isLegendExpanded = expanded;
    if (!mapLegendEl || !legendToggleBtn) return;

    mapLegendEl.classList.toggle('is-expanded', expanded);
    mapLegendEl.classList.toggle('is-collapsed', !expanded);
    legendToggleBtn.classList.toggle('is-active', expanded);
    legendToggleBtn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  }

  function toggleLegend(forceExpanded) {
    const expanded = typeof forceExpanded === 'boolean'
      ? forceExpanded
      : !isLegendExpanded;
    setLegendExpanded(expanded);
  }

  function updateHeaderOffset() {
    const headerHeight = appHeader?.offsetHeight || 0;
    document.documentElement.style.setProperty('--app-header-offset', `${headerHeight}px`);
  }

  function syncResponsiveUi() {
    updateHeaderOffset();

    if (window.innerWidth <= 768) {
      setMobileSheetExpanded(false);
      setLegendExpanded(false);
      return;
    }

    sidebarEl?.classList.remove('sheet-expanded', 'sheet-collapsed');
    sidebarToggle?.setAttribute('aria-expanded', 'true');
    setLegendExpanded(true);
  }

  function renderFilterGroup(container, options) {
    if (!container) return;

    if (options.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-text">目前沒有可用項目</div>
        </div>
      `;
      return;
    }

    container.innerHTML = options.map(option => {
      const isHidden = hiddenFacets.has(option.key);
      const count = restaurants.filter(item => item.facets.includes(option.key)).length;
      return `
        <button type="button" class="filter-option${isHidden ? ' is-hidden' : ''}" data-facet="${option.key}">
          <div class="filter-option-left">
            <span class="filter-option-dot" style="background:${option.color};"></span>
            <span class="filter-option-label">${option.label}</span>
          </div>
          <span class="filter-option-meta">${isHidden ? '已隱藏' : `顯示中 · ${count}`}</span>
        </button>
      `;
    }).join('');
  }

  function setSidebarTab(tabName) {
    activeSidebarTab = tabName;
    sidebarTabsEl.querySelectorAll('.sidebar-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    sidebarPanelList.classList.toggle('active', tabName === 'list');
    sidebarPanelFilters.classList.toggle('active', tabName === 'filters');
  }

  function toggleFacet(facet) {
    if (hiddenFacets.has(facet)) {
      hiddenFacets.delete(facet);
    } else {
      hiddenFacets.add(facet);
    }
    applyFilter();
  }

  function showAllFacets() {
    if (hiddenFacets.size === 0) return;
    hiddenFacets.clear();
    applyFilter();
  }

  function hideAllFacets() {
    hiddenFacets.clear();
    filterOptions.forEach(option => hiddenFacets.add(option.key));
    applyFilter();
  }

  function showOnlyType(typeKey) {
    hiddenFacets.clear();
    filterOptions
      .filter(option => option.kind === 'type' && option.key !== typeKey)
      .forEach(option => hiddenFacets.add(option.key));
    applyFilter();
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
  function createMarkerIcon(restaurant, items) {
    const emoji = getItemIcon(restaurant, items);
    const color = getMarkerColor(restaurant, items);

    const html = `
      <div class="custom-marker" data-id="${restaurant.id}" style="background: ${color};">
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

  function createUserLocationIcon() {
    return L.divIcon({
      html: `
        <div class="custom-marker cat-目前位置">
          <span class="marker-emoji">📍</span>
        </div>
      `,
      className: 'custom-marker-wrapper',
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -38]
    });
  }

  function setStatusMessage(message, { isError = false } = {}) {
    if (!message) {
      mapStatusBanner.hidden = true;
      mapStatusBanner.textContent = '';
      mapStatusBanner.classList.remove('is-error');
      return;
    }

    mapStatusBanner.hidden = false;
    mapStatusBanner.textContent = message;
    mapStatusBanner.classList.toggle('is-error', isError);
  }

  function getGeolocationErrorMessage(error) {
    if (!error) return '無法取得目前位置。';

    switch (error.code) {
      case error.PERMISSION_DENIED:
        return '定位權限被拒絕，請允許瀏覽器存取位置資訊。';
      case error.POSITION_UNAVAILABLE:
        return '目前無法判斷裝置位置，請確認 GPS 或網路訊號。';
      case error.TIMEOUT:
        return '定位逾時，請稍後再試一次。';
      default:
        return '定位失敗，請稍後再試一次。';
    }
  }

  function updateUserLocation(lat, lng) {
    const latLng = [lat, lng];

    if (!userLocationMarker) {
      userLocationMarker = L.marker(latLng, { icon: createUserLocationIcon() }).addTo(map);
      userLocationMarker.bindPopup(`
        <div class="popup-content">
          <div class="popup-name">你的位置</div>
          <div class="popup-desc">目前裝置定位結果</div>
        </div>
      `);
    } else {
      userLocationMarker.setLatLng(latLng);
    }

    map.flyTo(latLng, 14, { duration: 0.8 });
    userLocationMarker.openPopup();
  }

  function locateUser() {
    if (!navigator.geolocation) {
      setStatusMessage('這個瀏覽器不支援定位功能。', { isError: true });
      return;
    }

    locateMeBtn.disabled = true;
    setStatusMessage('正在取得目前位置...');

    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude, accuracy } = position.coords;
        updateUserLocation(latitude, longitude);
        locateMeBtn.disabled = false;
        setStatusMessage(`已定位，目前誤差約 ${Math.round(accuracy)} 公尺。`);
      },
      error => {
        locateMeBtn.disabled = false;
        setStatusMessage(getGeolocationErrorMessage(error), { isError: true });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  }

  // ── Render Markers ─────────────────────
  function renderMarkers(restaurants) {
    markerGroup.clearLayers();
    markers = {};

    restaurants.forEach(r => {
      const icon = createMarkerIcon(r, restaurants);
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

  // ── Render List (grouped by category) ──
  function renderList(restaurants) {
    if (restaurants.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🔍</div>
          <div class="empty-state-text">找不到符合條件的地點<br>請嘗試其他搜尋條件</div>
        </div>
      `;
      countEl.textContent = '0';
      return;
    }

    countEl.textContent = restaurants.length;

    const groupedByType = new Map();
    restaurants.forEach(item => {
      if (!groupedByType.has(item.type)) {
        groupedByType.set(item.type, new Map());
      }

      const typeGroup = groupedByType.get(item.type);
      if (!typeGroup.has(item.category)) {
        typeGroup.set(item.category, []);
      }

      typeGroup.get(item.category).push(item);
    });

    const orderedTypes = TYPE_ORDER
      .filter(type => groupedByType.has(type))
      .concat(
        Array.from(groupedByType.keys())
          .filter(type => !TYPE_ORDER.includes(type))
          .sort((a, b) => a.localeCompare(b, 'zh-Hant'))
      );

    let html = '';
    let cardIndex = 0;

    orderedTypes.forEach(type => {
      const typeKey = `type:${type}`;
      const isTypeCollapsed = groupCollapsedState[typeKey] === true;
      const typeCategories = groupedByType.get(type);
      const typeCategoryOrder = (CATEGORY_ORDER[type] || [])
        .filter(category => typeCategories.has(category))
        .concat(
          Array.from(typeCategories.keys())
            .filter(category => !(CATEGORY_ORDER[type] || []).includes(category))
            .sort((a, b) => a.localeCompare(b, 'zh-Hant'))
        );
      const typeCount = Array.from(typeCategories.values()).reduce((sum, items) => sum + items.length, 0);

      html += `
        <div class="type-section" data-type="${type}">
          <div class="type-header${isTypeCollapsed ? ' collapsed' : ''}" data-type="${type}">
            <div class="type-header-left">
              <span class="type-emoji">${TYPE_CONFIG[type]?.emoji || '📂'}</span>
              <span class="type-title">${type}</span>
              <span class="type-count">${typeCount}</span>
            </div>
            <svg class="type-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
          <div class="type-body${isTypeCollapsed ? ' collapsed' : ''}">
      `;

      typeCategoryOrder.forEach(cat => {
        const items = typeCategories.get(cat);
        if (!items || items.length === 0) return;

        const groupKey = `category:${type}:${cat}`;
        const isCollapsed = groupCollapsedState[groupKey] === true;
        const color = CATEGORY_COLORS[cat] || '#888';
        const emoji = CATEGORY_ICONS[cat] || '📍';

        html += `
          <div class="group-section" data-group="${groupKey}">
            <div class="group-header${isCollapsed ? ' collapsed' : ''}" data-group="${groupKey}">
              <div class="group-header-left">
                <span class="group-color-dot" style="background: ${color};"></span>
                <span class="group-emoji">${emoji}</span>
                <span class="group-title">${cat}</span>
                <span class="group-count">${items.length}</span>
              </div>
              <svg class="group-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
            <div class="group-body${isCollapsed ? ' collapsed' : ''}">
        `;

        items.forEach(r => {
          html += `
              <div class="restaurant-card" data-id="${r.id}" data-category="${r.category}" data-type="${r.type}" style="animation-delay: ${cardIndex * 0.03}s">
                <div class="card-top">
                  <span class="card-name">${r.name}</span>
                  ${r.isNew ? '<span class="card-badge-new">✦ NEW</span>' : ''}
                </div>
                <div class="card-address">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span>${r.address}</span>
                </div>
              </div>
          `;
          cardIndex++;
        });

        html += `
            </div>
          </div>
        `;
      });

      html += `
          </div>
        </div>
      `;
    });

    listEl.innerHTML = html;

    listEl.querySelectorAll('.type-header').forEach(header => {
      header.addEventListener('click', () => {
        const type = header.dataset.type;
        toggleTypeGroup(type);
      });
    });

    // Bind group header clicks
    listEl.querySelectorAll('.group-header').forEach(header => {
      header.addEventListener('click', () => {
        const groupKey = header.dataset.group;
        toggleGroup(groupKey);
      });
    });

    // Bind card clicks
    listEl.querySelectorAll('.restaurant-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = parseInt(card.dataset.id);
        setActiveRestaurant(id);
        flyToMarker(id);
      });
    });
  }

  // ── Toggle Group ───────────────────────
  function toggleGroup(category) {
    groupCollapsedState[category] = !groupCollapsedState[category];
    const section = listEl.querySelector(`.group-section[data-group="${category}"]`);
    if (!section) return;

    const header = section.querySelector('.group-header');
    const body = section.querySelector('.group-body');

    if (groupCollapsedState[category]) {
      header.classList.add('collapsed');
      body.classList.add('collapsed');
    } else {
      header.classList.remove('collapsed');
      body.classList.remove('collapsed');
    }
  }

  function toggleTypeGroup(type) {
    const typeKey = `type:${type}`;
    groupCollapsedState[typeKey] = !groupCollapsedState[typeKey];
    const section = listEl.querySelector(`.type-section[data-type="${type}"]`);
    if (!section) return;

    const header = section.querySelector('.type-header');
    const body = section.querySelector('.type-body');

    if (groupCollapsedState[typeKey]) {
      header.classList.add('collapsed');
      body.classList.add('collapsed');
    } else {
      header.classList.remove('collapsed');
      body.classList.remove('collapsed');
    }
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
    if (window.innerWidth <= 768) {
      setMobileSheetExpanded(false);
    }
    map.flyTo(latLng, 15, { duration: 0.8 });

    setTimeout(() => {
      marker.openPopup();
    }, 900);
  }

  // ── Show Detail Panel ──────────────────
  function showDetailPanel(id) {
    const r = restaurants.find(x => x.id === id);
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

      <div class="detail-section-title">地點資訊</div>
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
          <path d="M12 3l7 4v10l-7 4-7-4V7l7-4z"/><path d="M12 22V12"/><path d="m19 7-7 5-7-5"/>
        </svg>
        <div>
          <div class="detail-info-label">類型</div>
          <div class="detail-info-value">${r.type}</div>
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

    return restaurants.filter(r => {
      const matchCategory = activeCategory === 'all' || r.category === activeCategory;
      const matchHiddenFacets = !r.facets.some(facet => hiddenFacets.has(facet));
      const matchSearch = !query ||
        r.name.toLowerCase().includes(query) ||
        r.address.toLowerCase().includes(query) ||
        r.district.toLowerCase().includes(query) ||
        r.tags.some(t => t.toLowerCase().includes(query));

      return matchCategory && matchHiddenFacets && matchSearch;
    });
  }

  function applyFilter() {
    const filtered = getFilteredRestaurants();
    renderList(filtered);
    renderMarkers(filtered);
    renderLegend(filtered);

    // Fit bounds if markers exist
    if (filtered.length > 0 && markerGroup.getLayers().length > 0) {
      map.fitBounds(markerGroup.getBounds().pad(0.15), { maxZoom: 14 });
    }

    closeDetailPanel();
    updatePillCounts();
    renderFilterControls();

    if (window.innerWidth <= 768) {
      setTimeout(() => map.invalidateSize(), 320);
    }
  }

  function updatePillCounts() {
    const allCount = restaurants.filter(r => {
      const query = searchInput.value.trim().toLowerCase();
      const matchHiddenFacets = !r.facets.some(facet => hiddenFacets.has(facet));

      return matchHiddenFacets && (
        !query ||
        r.name.toLowerCase().includes(query) ||
        r.address.toLowerCase().includes(query) ||
        r.district.toLowerCase().includes(query) ||
        r.tags.some(t => t.toLowerCase().includes(query))
      );
    });

    const counts = { all: allCount.length };
    restaurants.forEach(item => {
      counts[item.category] = (counts[item.category] || 0) + (allCount.includes(item) ? 1 : 0);
    });

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

    sidebarTabsEl.addEventListener('click', e => {
      const tab = e.target.closest('.sidebar-tab');
      if (!tab) return;
      setSidebarTab(tab.dataset.tab);
    });

    [typeFilterList, categoryFilterList, facetFilterList].forEach(container => {
      container.addEventListener('click', e => {
        const option = e.target.closest('.filter-option');
        if (!option) return;
        toggleFacet(option.dataset.facet);
      });
    });

    showAllBtn.addEventListener('click', showAllFacets);
    hideAllBtn.addEventListener('click', hideAllFacets);
    showBibBtn.addEventListener('click', () => showOnlyType('必比登美食'));
    locateMeBtn.addEventListener('click', locateUser);

    sidebarToggle?.addEventListener('click', () => toggleMobileSheet());
    legendToggleBtn?.addEventListener('click', () => toggleLegend());

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
      syncResponsiveUi();
      map.invalidateSize();
    });

    if (window.ResizeObserver && appHeader) {
      const headerObserver = new ResizeObserver(() => {
        updateHeaderOffset();
      });
      headerObserver.observe(appHeader);
    }
  }

  // ── Launch ─────────────────────────────
  document.addEventListener('DOMContentLoaded', init);
})();
