// ─── STATE ───────────────────────────────────────────────────────────────────
let exprType = 'infija';
let derivType = 'izquierda';

const GRAMMARS = {
  infija: `<span class="nt">E</span> <span class="arrow">→</span> <span class="nt">E</span> <span class="op">+</span> <span class="nt">T</span> | <span class="nt">E</span> <span class="op">-</span> <span class="nt">T</span> | <span class="nt">T</span>
<span class="nt">T</span> <span class="arrow">→</span> <span class="nt">T</span> <span class="op">*</span> <span class="nt">F</span> | <span class="nt">T</span> <span class="op">/</span> <span class="nt">F</span> | <span class="nt">F</span>
<span class="nt">F</span> <span class="arrow">→</span> <span class="op">(</span> <span class="nt">E</span> <span class="op">)</span> | <span class="term">id</span> | <span class="term">num</span>`,
  prefija: `<span class="nt">E</span> <span class="arrow">→</span> <span class="op">+</span> <span class="nt">E</span> <span class="nt">E</span> | <span class="op">-</span> <span class="nt">E</span> <span class="nt">E</span>
  <span class="arrow">|</span> <span class="op">*</span> <span class="nt">E</span> <span class="nt">E</span> | <span class="op">/</span> <span class="nt">E</span> <span class="nt">E</span>
  <span class="arrow">|</span> <span class="term">id</span> | <span class="term">num</span>`
};

const EXAMPLES = {
  infija: ['a + b', '4 + ( a - b ) * x', 'x * y + z / 2', '( a + b ) * ( c - d )'],
  prefija: ['+ a b', '* + a b - c d', '+ * x 3 y']
};

// ─── INIT ─────────────────────────────────────────────────────────────────────
document.getElementById('grammar-display').innerHTML = GRAMMARS.infija;
renderExamples();

function renderExamples() {
  const row = document.getElementById('examples-row');
  row.innerHTML = EXAMPLES[exprType].map(e =>
    `<div class="example-chip" onclick="useExample('${e}')">${e}</div>`
  ).join('');
}

function useExample(e) {
  document.getElementById('expr-input').value = e;
}

// ─── CONTROLS ────────────────────────────────────────────────────────────────
function setType(t) {
  exprType = t;
  document.getElementById('btn-infija').className = 'seg-btn' + (t==='infija'?' active':'');
  document.getElementById('btn-prefija').className = 'seg-btn' + (t==='prefija'?' active':'');
  document.getElementById('grammar-display').innerHTML = GRAMMARS[t];
  renderExamples();
}

function setDeriv(d) {
  derivType = d;
  document.getElementById('btn-izq').className = 'seg-btn' + (d==='izquierda'?' active':'');
  document.getElementById('btn-der').className = 'seg-btn' + (d==='derecha'?' active':'');
}

function showTab(i) {
  document.querySelectorAll('.tab-btn').forEach((b,j) => b.className='tab-btn'+(i===j?' active':''));
  document.querySelectorAll('.panel').forEach((p,j) => p.className='panel'+(i===j?' active':''));
}

// ─── ANALYZE ─────────────────────────────────────────────────────────────────
async function analyze() {
  let expr = document.getElementById('expr-input').value.trim();

  expr = expr
  .replace(/\(/g, ' ( ')
  .replace(/\)/g, ' ) ')
  .replace(/\+/g, ' + ')
  .replace(/\-/g, ' - ')
  .replace(/\*/g, ' * ')
  .replace(/\//g, ' / ')
  .replace(/\s+/g, ' ')
  .trim();

  if (!expr) return;

  const btn = document.getElementById('analyze-btn');
  btn.disabled = true;
  btn.innerHTML = '<div class="spinner"></div> Analizando...';

  clearResults();

  const base = document.getElementById('server-url').value.trim().replace(/\/$/, '');

  try {
    const res = await fetch(`${base}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: expr, expressionType: exprType, derivationType: derivType })
    });
  
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }

    let data;
    
    try {
      data = await res.json();
    } catch {
      throw new Error("Respuesta inválida del servidor");
    }

    if (data.error) { showError(data.error); return; }

    renderDerivation(data.derivation);
    if (data.tree) renderTree(data.tree, 'tree-canvas', 'empty-1');
    if (data.ast)  renderTree(data.ast,  'ast-canvas',  'empty-2');

    showTab(0);

  } catch (e) {
    showError(`No se pudo conectar con el servidor en ${base}.\n\nAsegúrate de que el backend esté corriendo:\n  uvicorn main:app --reload\n\nY que tenga CORS habilitado.`);
  }

  btn.disabled = false;
  btn.innerHTML = '<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M3 2.5l9 5-9 5V2.5z" fill="currentColor"/></svg> Analizar';
}

// ─── RENDER: DERIVATION ───────────────────────────────────────────────────────
function renderDerivation(steps) {
  const dc = document.getElementById('deriv-content');
  dc.innerHTML = '';
  document.getElementById('count-deriv').textContent = steps.length;

  steps.forEach((step, i) => {
    const isLast = i === steps.length - 1;

    const row = document.createElement('div');
    row.className = 'step-row';
    row.style.animationDelay = `${i * 30}ms`;
    row.innerHTML = `
      <div class="step-idx">${i}</div>
      <div class="step-expr ${isLast ? 'final' : ''}">
        ${escape(step)}${isLast ? '<span class="result-tag">resultado</span>' : ''}
      </div>`;
    dc.appendChild(row);

    if (!isLast) {
      const connector = document.createElement('div');
      connector.className = 'step-connector';
      connector.textContent = '⟹';
      dc.appendChild(connector);
    }
  });

  document.getElementById('empty-0').style.display = 'none';
  dc.style.display = 'flex';
}

function escape(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ─── RENDER: TREE (SVG) ──────────────────────────────────────────────────────
const NODE_W = 54, NODE_H = 30, V_GAP = 58, H_GAP = 6, PAD = 28;

function layoutTree(node, depth) {
  if (!node.children || node.children.length === 0) {
    node._w = NODE_W; node._lx = 0; node._y = depth * (NODE_H + V_GAP);
    return;
  }
  node.children.forEach(c => layoutTree(c, depth + 1));
  const total = node.children.reduce((s, c) => s + c._w, 0) + (node.children.length - 1) * H_GAP;
  node._w = Math.max(NODE_W, total);
  node._y = depth * (NODE_H + V_GAP);
  let cx = 0;
  node.children.forEach(c => { c._lx = cx; cx += c._w + H_GAP; });
  node._lx = 0;
}

function flatNodes(node, ox, result) {
  const ax = ox + node._lx;
  const cx = ax + node._w / 2;
  const cy = node._y + NODE_H / 2;
  result.nodes.push({ label: node.value, cx, cy });
  if (node.children) {
    node.children.forEach(c => {
      const cax = ax + c._lx;
      const ccx = cax + c._w / 2;
      const ccy = c._y + NODE_H / 2;
      result.edges.push({ x1: cx, y1: cy + NODE_H / 2, x2: ccx, y2: ccy - NODE_H / 2 });
      flatNodes(c, ax, result);
    });
  }
}

function nodeStyle(label) {
  if (['+', '-', '*', '/'].includes(label))
    return { fill: 'rgba(78,205,196,0.12)', stroke: '#4ecdc4', text: '#4ecdc4' };
  if (['E', 'T', 'F'].includes(label))
    return { fill: 'rgba(124,106,247,0.12)', stroke: '#7c6af7', text: '#9d8ff9' };
  if (label === '(' || label === ')')
    return { fill: 'rgba(107,112,128,0.12)', stroke: '#6b7080', text: '#6b7080' };
  return { fill: 'rgba(247,162,106,0.12)', stroke: '#f7a26a', text: '#f7a26a' };
}

function renderTree(root, canvasId, emptyId) {
  layoutTree(root, 0);
  const result = { nodes: [], edges: [] };
  flatNodes(root, PAD, result);

  const maxX = Math.max(...result.nodes.map(n => n.cx)) + PAD + NODE_W / 2;
  const maxY = Math.max(...result.nodes.map(n => n.cy)) + PAD + NODE_H / 2;
  const W = Math.max(maxX, 400), H = Math.max(maxY, 300);

  let svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;

  result.edges.forEach(e => {
    svg += `<line x1="${e.x1}" y1="${e.y1}" x2="${e.x2}" y2="${e.y2}" stroke="rgba(255,255,255,0.1)" stroke-width="1.5"/>`;
  });

  result.nodes.forEach(n => {
    const s = nodeStyle(n.label);
    const rx = n.cx - NODE_W / 2, ry = n.cy - NODE_H / 2;
    svg += `<rect x="${rx}" y="${ry}" width="${NODE_W}" height="${NODE_H}" rx="7" fill="${s.fill}" stroke="${s.stroke}" stroke-width="1"/>`;
    svg += `<text x="${n.cx}" y="${n.cy + 4.5}" text-anchor="middle" font-size="12" font-family="IBM Plex Mono, monospace" fill="${s.text}" font-weight="500">${escapeXml(n.label)}</text>`;
  });

  svg += '</svg>';

  const canvas = document.getElementById(canvasId);
  canvas.innerHTML = svg;
  canvas.style.display = 'flex';
  if (emptyId) document.getElementById(emptyId).style.display = 'none';
}

function escapeXml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function clearResults() {
  document.getElementById('empty-0').style.display = 'flex';
  document.getElementById('empty-1').style.display = 'flex';
  document.getElementById('empty-2').style.display = 'flex';
  document.getElementById('deriv-content').style.display = 'none';
  document.getElementById('tree-canvas').style.display = 'none';
  document.getElementById('ast-canvas').style.display = 'none';
  document.getElementById('count-deriv').textContent = '—';
  document.querySelectorAll('.error-banner').forEach(e => e.remove());
}

function showError(msg) {
  clearResults();
  document.getElementById('empty-0').style.display = 'none';
  const div = document.createElement('div');
  div.className = 'error-banner';
  div.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;margin-top:1px"><circle cx="8" cy="8" r="7" stroke="#f76a6a" stroke-width="1.5"/><path d="M8 5v4M8 11v.5" stroke="#f76a6a" stroke-width="1.5" stroke-linecap="round"/></svg><pre style="font-family:var(--mono);font-size:12px;white-space:pre-wrap;line-height:1.6">${escapeXml(msg)}</pre>`;
  document.getElementById('panel-0').appendChild(div);
  showTab(0);
}

// Enter key shortcut
document.getElementById('expr-input').addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); analyze(); }
});