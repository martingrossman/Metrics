const fs = require('fs');

let content = fs.readFileSync('index.html', 'utf8');

// 1. CSS replacement
const cssTarget = [
  '  .matrix-layout-cell {',
  '    display: flex;',
  '    align-items: center;',
  '    justify-content: flex-end;',
  '    padding: 2px 4px;',
  '  }',
  '  .matrix-layout-select {',
  '    font-family: Inter, system-ui, sans-serif;',
  '    font-size: 11px;',
  '    font-weight: 600;',
  '    padding: 4px 6px;',
  '    border-radius: 7px;',
  '    border: 1px solid var(--border);',
  '    background: #ffffff;',
  '    color: var(--text);',
  '    cursor: pointer;',
  '    width: 100%;',
  '    max-width: 100%;',
  '  }',
  '  .matrix-layout-select:focus-visible {',
  '    outline: 2px solid #246cf0;',
  '  }',
  '  @media (max-width: 650px) {',
  '    .matrix-layout-select {',
  '      font-size: 9.5px;',
  '      padding: 2px 2px;',
  '      max-width: 68px;',
  '    }',
  '  }'
].join('\r\n');

const cssReplacement = [
  '  .matrix-layout-cell {',
  '    display: flex;',
  '    align-items: center;',
  '    justify-content: center;',
  '    padding: 2px 4px;',
  '  }',
  '  .matrix-layout-btn {',
  '    font-family: Inter, system-ui, sans-serif;',
  '    font-size: 11px;',
  '    font-weight: 600;',
  '    padding: 5px 8px;',
  '    border-radius: 7px;',
  '    border: 1px solid var(--border);',
  '    background: #ffffff;',
  '    color: var(--text);',
  '    cursor: pointer;',
  '    display: inline-flex;',
  '    align-items: center;',
  '    justify-content: center;',
  '    gap: 5px;',
  '    width: 100%;',
  '    max-width: 100%;',
  '    box-shadow: 0 1px 2px rgba(0,0,0,0.04);',
  '    transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;',
  '    user-select: none;',
  '    -webkit-user-select: none;',
  '    touch-action: manipulation;',
  '  }',
  '  .matrix-layout-btn:hover {',
  '    background: #f8fafc;',
  '    border-color: #cbd5e1;',
  '  }',
  '  .matrix-layout-btn:active {',
  '    background: #edf2f7;',
  '    transform: scale(0.98);',
  '  }',
  '  .matrix-layout-btn:focus-visible {',
  '    outline: 2px solid #246cf0;',
  '    outline-offset: 1px;',
  '  }',
  '  .matrix-layout-btn .layout-btn-icon {',
  '    font-size: 12px;',
  '    color: #475569;',
  '    line-height: 1;',
  '  }',
  '  .matrix-layout-btn .layout-label-long { display: inline; }',
  '  .matrix-layout-btn .layout-label-short { display: none; }',
  '  @media (max-width: 650px) {',
  '    .matrix-layout-cell {',
  '      padding: 1px 2px;',
  '    }',
  '    .matrix-layout-btn {',
  '      font-size: 9.5px;',
  '      padding: 4px 4px;',
  '      border-radius: 6px;',
  '      gap: 3px;',
  '    }',
  '    .matrix-layout-btn .layout-btn-icon {',
  '      font-size: 10px;',
  '    }',
  '    .matrix-layout-btn .layout-label-long { display: none; }',
  '    .matrix-layout-btn .layout-label-short { display: inline; }',
  '  }'
].join('\r\n');

// 2. HTML replacement
const htmlTarget = [
  '    <div class="matrix-layout-cell">',
  '     <label for="matrixLayoutSelect" class="sr-only">Confusion Matrix Layout</label>',
  '     <select class="matrix-layout-select" id="matrixLayoutSelect" aria-label="Confusion matrix layout" title="Choose confusion matrix layout: Standard (TP top-left), Matches graph (Score order), or scikit-learn">',
  '      <option value="standard">Standard</option>',
  '      <option value="graph">Matches graph</option>',
  '      <option value="scikit">scikit-learn</option>',
  '     </select>',
  '    </div>'
].join('\r\n');

const htmlReplacement = [
  '    <div class="matrix-layout-cell">',
  '     <button type="button" class="matrix-layout-btn" id="matrixLayoutBtn" aria-label="Confusion matrix layout: Standard. Click to cycle layout." title="Current layout: Standard (Wikipedia). Click to cycle to Matches graph." data-layout="standard">',
  '      <span class="layout-label-long">Standard</span>',
  '      <span class="layout-label-short">Standard</span>',
  '      <span class="layout-btn-icon" aria-hidden="true">⇄</span>',
  '     </button>',
  '    </div>'
].join('\r\n');

// 3. JS function setMatrixLayout replacement
const jsTarget = [
  '  function setMatrixLayout(layout) {',
  '    activeMatrixLayout = layout;',
  '    const popHeader = getElement(\'matrixPopHeader\');',
  '    const pop = getElement(\'matrixPopulation\');',
  '    const select = getElement(\'matrixLayoutSelect\');',
  '    if (select) select.value = layout;',
  '    if (popHeader) {',
  '      popHeader.classList.remove(\'layout-standard\', \'layout-graph\', \'layout-scikit\');',
  '      popHeader.classList.add(`layout-${layout}`);',
  '    }',
  '    if (pop) {',
  '      pop.classList.remove(\'layout-standard\', \'layout-graph\', \'layout-scikit\');',
  '      pop.classList.add(`layout-${layout}`);',
  '    }',
  '    renderMetricHighlight();',
  '  }'
].join('\r\n');

const jsReplacement = [
  '  const MATRIX_LAYOUTS = [\'standard\', \'graph\', \'scikit\'];',
  '  const MATRIX_LAYOUT_CONFIG = {',
  '    standard: {',
  '      long: \'Standard\',',
  '      short: \'Standard\',',
  '      title: \'Current layout: Standard (Wikipedia). Click to switch to Matches graph.\'',
  '    },',
  '    graph: {',
  '      long: \'Matches graph\',',
  '      short: \'Graph match\',',
  '      title: \'Current layout: Matches graph (Score order). Click to switch to scikit-learn.\'',
  '    },',
  '    scikit: {',
  '      long: \'scikit-learn\',',
  '      short: \'scikit\',',
  '      title: \'Current layout: scikit-learn (Python). Click to switch to Standard.\'',
  '    }',
  '  };',
  '',
  '  function cycleMatrixLayout() {',
  '    const idx = MATRIX_LAYOUTS.indexOf(activeMatrixLayout);',
  '    const next = MATRIX_LAYOUTS[(idx + 1) % MATRIX_LAYOUTS.length];',
  '    setMatrixLayout(next);',
  '  }',
  '',
  '  function setMatrixLayout(layout) {',
  '    activeMatrixLayout = layout;',
  '    const popHeader = getElement(\'matrixPopHeader\');',
  '    const pop = getElement(\'matrixPopulation\');',
  '    const btn = getElement(\'matrixLayoutBtn\');',
  '    if (btn) {',
  '      btn.dataset.layout = layout;',
  '      const conf = MATRIX_LAYOUT_CONFIG[layout] || MATRIX_LAYOUT_CONFIG.standard;',
  '      const longSpan = btn.querySelector(\'.layout-label-long\');',
  '      const shortSpan = btn.querySelector(\'.layout-label-short\');',
  '      if (longSpan) longSpan.textContent = conf.long;',
  '      if (shortSpan) shortSpan.textContent = conf.short;',
  '      btn.title = conf.title;',
  '      btn.setAttribute(\'aria-label\', `Confusion matrix layout: ${conf.long}. Click to switch.`);',
  '    }',
  '    if (popHeader) {',
  '      popHeader.classList.remove(\'layout-standard\', \'layout-graph\', \'layout-scikit\');',
  '      popHeader.classList.add(`layout-${layout}`);',
  '    }',
  '    if (pop) {',
  '      pop.classList.remove(\'layout-standard\', \'layout-graph\', \'layout-scikit\');',
  '      pop.classList.add(`layout-${layout}`);',
  '    }',
  '    renderMetricHighlight();',
  '  }'
].join('\r\n');

// 4. JS listener replacement
const listenerTarget = [
  '  const matrixLayoutSelect = getElement(\'matrixLayoutSelect\');',
  '  if (matrixLayoutSelect) {',
  '    matrixLayoutSelect.addEventListener(\'change\', event => {',
  '      setMatrixLayout(event.target.value);',
  '    });',
  '  }'
].join('\r\n');

const listenerReplacement = [
  '  const matrixLayoutBtn = getElement(\'matrixLayoutBtn\');',
  '  if (matrixLayoutBtn) {',
  '    matrixLayoutBtn.addEventListener(\'click\', () => {',
  '      cycleMatrixLayout();',
  '    });',
  '  }'
].join('\r\n');

function replaceChunk(str, target, replacement) {
  if (str.includes(target)) return str.replace(target, replacement);
  const targetLF = target.replace(/\r\n/g, '\n');
  const replacementLF = replacement.replace(/\r\n/g, '\n');
  if (str.includes(targetLF)) return str.replace(targetLF, replacementLF);
  throw new Error('Target chunk not found: ' + target.slice(0, 40));
}

content = replaceChunk(content, cssTarget, cssReplacement);
content = replaceChunk(content, htmlTarget, htmlReplacement);
content = replaceChunk(content, jsTarget, jsReplacement);
content = replaceChunk(content, listenerTarget, listenerReplacement);

fs.writeFileSync('index.html', content, 'utf8');
console.log('Successfully updated index.html to use matrixLayoutBtn!');
