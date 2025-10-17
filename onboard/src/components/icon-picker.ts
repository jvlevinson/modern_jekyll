/**
 * Icon Picker Component (Font Awesome Free - solid/regular/brands)
 * - Search with previews
 * - Supports selecting icon set via tabs or restriction
 */

interface FaIconEntry {
  class: string;
  label: string;
}

type IconSet = 'solid' | 'regular' | 'brands';

const SET_TO_FILE: Record<IconSet, string> = {
  solid: '/onboard/assets/fa-solid.json',
  regular: '/onboard/assets/fa-regular.json',
  brands: '/onboard/assets/fa-brands.json'
};

const SET_TO_PREFIX: Record<IconSet, string> = {
  solid: 'fa-solid',
  regular: 'fa-regular',
  brands: 'fa-brands'
};

const cache: Partial<Record<IconSet, FaIconEntry[]>> = {};

async function loadSet(iconSet: IconSet): Promise<FaIconEntry[]> {
  const maybe = cache[iconSet];
  if (maybe) return maybe;
  const res = await fetch(SET_TO_FILE[iconSet], { cache: 'no-cache' });
  if (!res.ok) return [];
  const data = (await res.json()) as FaIconEntry[];
  cache[iconSet] = data;
  return data;
}

function createContainer(allowTabs: boolean, initialSet: IconSet): HTMLDivElement {
  const el = document.createElement('div');
  el.className = 'icon-picker';
  el.setAttribute('role', 'dialog');
  el.innerHTML = `
    ${allowTabs ? `
    <div class="icon-picker__tabs" role="tablist">
      <button type="button" class="icon-picker__tab" data-set="solid" ${initialSet === 'solid' ? 'aria-selected="true"' : ''}>Solid</button>
      <button type="button" class="icon-picker__tab" data-set="regular" ${initialSet === 'regular' ? 'aria-selected="true"' : ''}>Regular</button>
      <button type="button" class="icon-picker__tab" data-set="brands" ${initialSet === 'brands' ? 'aria-selected="true"' : ''}>Brands</button>
    </div>` : ''}
    <div class="icon-picker__search">
      <input type="text" class="icon-picker__input" placeholder="Search icons..." aria-label="Search icons" />
    </div>
    <div class="icon-picker__list" role="listbox"></div>
  `;
  return el;
}

function fuzzyFilter(items: FaIconEntry[], query: string): FaIconEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return items.slice(0, 200);
  const scored: { e: FaIconEntry; s: number }[] = [];
  for (const e of items) {
    const l = e.label.toLowerCase();
    const c = e.class.toLowerCase();
    let s = 0;
    if (l === q || c === q) s = 100;
    else if (l.startsWith(q)) s = 85;
    else if (l.includes(q)) s = 70;
    else if (c.includes(q)) s = 55;
    if (s) scored.push({ e, s });
  }
  scored.sort((a, b) => b.s - a.s || a.e.label.localeCompare(b.e.label));
  return scored.slice(0, 200).map((v) => v.e);
}

function render(list: HTMLElement, items: FaIconEntry[], prefixClass: string, activeIndex: number): void {
  list.innerHTML = '';
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'icon-picker__row';
    if (i === activeIndex) row.classList.add('is-active');
    row.dataset.iconClass = it.class;
    row.dataset.iconLabel = it.label;
    row.innerHTML = `<i class="${prefixClass} ${it.class}" aria-hidden="true"></i><span class="icon-picker__label">${it.label}</span>`;
    list.appendChild(row);
  }
}

function position(anchor: HTMLElement, popup: HTMLElement): void {
  const r = anchor.getBoundingClientRect();
  popup.style.position = 'absolute';
  popup.style.minWidth = `${Math.max(r.width, 260)}px`;
  popup.style.top = `${window.scrollY + r.bottom + 4}px`;
  popup.style.left = `${window.scrollX + r.left}px`;
  popup.style.zIndex = '9999';
}

export interface IconPickerOptions {
  restrictTo?: IconSet; // when set, tabs disabled and only that set is searchable
}

export function attachIconPicker(input: HTMLInputElement, options: IconPickerOptions = {}): void {
  let open = false;
  let activeSet: IconSet = options.restrictTo || 'solid';
  let items: FaIconEntry[] = [];
  let filtered: FaIconEntry[] = [];
  let activeIndex = 0;

  let container: HTMLDivElement | null = null;
  let listEl: HTMLDivElement | null = null;
  let searchEl: HTMLInputElement | null = null;

  const allowTabs = !options.restrictTo;

  async function show(): Promise<void> {
    if (open) return;
    open = true;

    container = createContainer(allowTabs, activeSet);
    listEl = container.querySelector('.icon-picker__list');
    searchEl = container.querySelector('.icon-picker__input');

    document.body.appendChild(container);
    position(input, container);

    async function loadAndRender(set: IconSet): Promise<void> {
      activeSet = set;
      items = await loadSet(set);
      const currentQuery = searchEl ? searchEl.value : '';
      filtered = fuzzyFilter(items, currentQuery);
      const prefix = SET_TO_PREFIX[set];
      if (listEl) render(listEl, filtered, prefix, activeIndex);
    }

    await loadAndRender(activeSet);

    // Events
    const onScrollOrResize = () => {
      if (container) position(input, container);
    };

    function close(): void {
      if (!open) return;
      open = false;
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
      document.removeEventListener('mousedown', onDocDown);
      document.removeEventListener('keydown', onKey, true);
      if (container) container.remove();
      container = null;
      listEl = null;
      searchEl = null;
    }

    function commit(idx: number): void {
      const it = filtered[idx];
      if (!it) return;
      input.value = it.class;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      close();
      input.focus();
    }

    function onDocDown(e: MouseEvent): void {
      if (!container) return;
      const t = e.target as Node;
      if (t === input || container.contains(t)) return;
      close();
    }

    function onKey(e: KeyboardEvent): void {
      if (!open) return;
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          activeIndex = Math.min(activeIndex + 1, Math.max(filtered.length - 1, 0));
          if (listEl) render(listEl, filtered, SET_TO_PREFIX[activeSet], activeIndex);
          break;
        case 'ArrowUp':
          e.preventDefault();
          activeIndex = Math.max(activeIndex - 1, 0);
          if (listEl) render(listEl, filtered, SET_TO_PREFIX[activeSet], activeIndex);
          break;
        case 'Enter':
          e.preventDefault();
          commit(activeIndex);
          break;
        case 'Escape':
          e.preventDefault();
          close();
          break;
      }
    }

    // Tab switching
    if (allowTabs) {
      const tabs = container.querySelectorAll('.icon-picker__tab');
      tabs.forEach((btn) => {
        btn.addEventListener('click', (ev) => {
          const setAttr = (ev.currentTarget as HTMLElement).getAttribute('data-set');
          const set = (setAttr === 'solid' || setAttr === 'regular' || setAttr === 'brands') ? setAttr : null;
          if (!set) return;
          activeIndex = 0;
          // Avoid async listener lint: call async function but don't return its Promise
          void (async () => {
            await loadAndRender(set);
            // update selected state
            tabs.forEach((b) => b.removeAttribute('aria-selected'));
            (ev.currentTarget as HTMLElement).setAttribute('aria-selected', 'true');
          })();
        });
      });
    }

    // Search
    if (searchEl) {
      searchEl.addEventListener('input', () => {
        if (!searchEl || !listEl) return;
        activeIndex = 0;
        filtered = fuzzyFilter(items, searchEl.value);
        render(listEl, filtered, SET_TO_PREFIX[activeSet], activeIndex);
      });
    }

    // Click selection
    if (listEl) {
      listEl.addEventListener('click', (e) => {
        if (!listEl) return;
        const row = (e.target as HTMLElement).closest('.icon-picker__row');
        if (!row) return;
        const children = Array.from(listEl.children);
        const idx = children.indexOf(row);
        commit(idx);
      });
    }

    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    document.addEventListener('mousedown', onDocDown);
    document.addEventListener('keydown', onKey, true);

    // Prefill search from current input value (strip fa- and hyphens)
    if (searchEl) {
      searchEl.value = input.value.replace(/^fa-/, '').replace(/-/g, ' ');
      searchEl.focus();
    }
  }

  function ensure(): void {
    void show();
  }

  input.addEventListener('focus', ensure);
  input.addEventListener('click', ensure);
}

export default attachIconPicker;
