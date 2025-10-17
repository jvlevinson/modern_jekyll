/**
 * Debug Overlay: lists loaded CSS and provides environment info.
 * Collapsible; only enabled on localhost.
 */

function isLocalhost(): boolean {
  const h = window.location.hostname;
  return h === 'localhost' || h === '127.0.0.1' || h === '[::1]' || h.endsWith('.local');
}

function getLoadedStylesheets(): { href: string; rel: string }[] {
  const out: { href: string; rel: string }[] = [];
  const links = Array.from(
    document.querySelectorAll('link[rel="stylesheet"], link[as="style"], link[rel="preload"][as="style"]')
  );
  for (const el of links) {
    const href = String(el.getAttribute('href') ?? '');
    const rel = String(el.getAttribute('rel') ?? el.getAttribute('as') ?? '');
    out.push({ href, rel });
  }
  // Inline <style> tags
  const styles = Array.from(document.querySelectorAll('style'));
  for (const el of styles) {
    const idAttr = el.getAttribute('id');
    const id = idAttr ? `#${idAttr}` : '';
    out.push({ href: `[inline<style>${id}]`, rel: 'inline' });
  }
  return out;
}

function createOverlay(): HTMLElement {
  const wrap = document.createElement('div');
  wrap.id = 'onboard-debug-overlay';
  wrap.style.position = 'fixed';
  wrap.style.bottom = '12px';
  wrap.style.right = '12px';
  wrap.style.zIndex = '99999';
  wrap.style.fontFamily = 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif';

  const panel = document.createElement('div');
  panel.style.background = 'rgba(17,24,39,0.98)';
  panel.style.color = '#e5e7eb';
  panel.style.border = '1px solid rgba(255,255,255,0.08)';
  panel.style.borderRadius = '8px';
  panel.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)';
  panel.style.width = '380px';
  panel.style.maxHeight = '60vh';
  panel.style.overflow = 'hidden';

  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.alignItems = 'center';
  header.style.justifyContent = 'space-between';
  header.style.padding = '10px 12px';
  header.style.background = 'rgba(31,41,55,0.98)';
  header.style.fontWeight = '700';
  header.style.letterSpacing = '0.02em';
  header.textContent = 'Onboard Debug';

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.textContent = '▼';
  toggle.title = 'Collapse';
  toggle.style.background = 'transparent';
  toggle.style.color = '#e5e7eb';
  toggle.style.border = '0';
  toggle.style.cursor = 'pointer';
  toggle.style.fontSize = '14px';
  header.appendChild(toggle);

  const body = document.createElement('div');
  body.style.padding = '10px 12px';
  body.style.display = 'block';
  body.style.overflow = 'auto';

  const info = document.createElement('div');
  info.style.marginBottom = '8px';
  info.innerHTML = `
    <div style="opacity:.85; font-size:12px;">Host: <code>${location.host}</code></div>
    <div style="opacity:.85; font-size:12px;">UA: <code>${navigator.userAgent}</code></div>
  `;
  body.appendChild(info);

  const listTitle = document.createElement('div');
  listTitle.style.margin = '6px 0 4px 0';
  listTitle.style.fontSize = '12px';
  listTitle.style.opacity = '0.85';
  listTitle.textContent = 'Loaded CSS:';
  body.appendChild(listTitle);

  const list = document.createElement('div');
  list.style.display = 'grid';
  list.style.gridTemplateColumns = '1fr';
  list.style.gap = '6px';
  const sheets = getLoadedStylesheets();
  for (const s of sheets) {
    const row = document.createElement('div');
    row.style.fontSize = '12px';
    row.style.wordBreak = 'break-all';
    row.innerHTML = `<code>${s.rel}</code> — <span>${s.href || '(inline)'}</span>`;
    list.appendChild(row);
  }
  body.appendChild(list);

  panel.appendChild(header);
  panel.appendChild(body);
  wrap.appendChild(panel);

  let collapsed = false;
  toggle.addEventListener('click', () => {
    collapsed = !collapsed;
    body.style.display = collapsed ? 'none' : 'block';
    toggle.textContent = collapsed ? '▲' : '▼';
    toggle.title = collapsed ? 'Expand' : 'Collapse';
  });

  return wrap;
}

export function initDebugOverlay(): void {
  if (!isLocalhost()) return;
  if (document.getElementById('onboard-debug-overlay')) return;
  const overlay = createOverlay();
  document.body.appendChild(overlay);
}


