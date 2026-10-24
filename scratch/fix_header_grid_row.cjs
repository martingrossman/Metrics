const fs = require('fs');

let content = fs.readFileSync('index.html', 'utf8');

// 1. Add .population-header > div { grid-row: 1; }
const headerTarget = [
  '  .population-header {',
  '    display: grid;',
  '    grid-template-columns: 110px minmax(0, 1fr) minmax(0, 1fr);',
  '    gap: 8px;',
  '    margin-bottom: 8px;',
  '  }'
].join('\r\n');

const headerReplacement = [
  '  .population-header {',
  '    display: grid;',
  '    grid-template-columns: 110px minmax(0, 1fr) minmax(0, 1fr);',
  '    grid-template-rows: auto;',
  '    gap: 8px;',
  '    margin-bottom: 8px;',
  '  }',
  '  .population-header > div {',
  '    grid-row: 1;',
  '  }'
].join('\r\n');

// 2. Add grid-row: 1 to layout classes for header columns
const layoutTarget = [
  '  /* Matrix Layout: Standard (Default) */',
  '  .population-header.layout-standard .col-pos,',
  '  .population-header:not(.layout-graph):not(.layout-scikit) .col-pos { grid-column: 2; }',
  '  .population-header.layout-standard .col-neg,',
  '  .population-header:not(.layout-graph):not(.layout-scikit) .col-neg { grid-column: 3; }',
  '',
  '  .population.layout-standard .row-pos,',
  '  .population:not(.layout-graph):not(.layout-scikit) .row-pos { grid-row: 1; grid-column: 1; }',
  '  .population.layout-standard .group.tp,',
  '  .population:not(.layout-graph):not(.layout-scikit) .group.tp { grid-row: 1; grid-column: 2; }',
  '  .population.layout-standard .group.fn,',
  '  .population:not(.layout-graph):not(.layout-scikit) .group.fn { grid-row: 1; grid-column: 3; }',
  '',
  '  .population.layout-standard .row-neg,',
  '  .population:not(.layout-graph):not(.layout-scikit) .row-neg { grid-row: 2; grid-column: 1; }',
  '  .population.layout-standard .group.fp,',
  '  .population:not(.layout-graph):not(.layout-scikit) .group.fp { grid-row: 2; grid-column: 2; }',
  '  .population.layout-standard .group.tn,',
  '  .population:not(.layout-graph):not(.layout-scikit) .group.tn { grid-row: 2; grid-column: 3; }',
  '',
  '  /* Matrix Layout: Matches Graph (Score Order: Negative on Left, Positive on Right) */',
  '  .population-header.layout-graph .col-neg { grid-column: 2; }',
  '  .population-header.layout-graph .col-pos { grid-column: 3; }',
  '',
  '  .population.layout-graph .row-pos { grid-row: 1; grid-column: 1; }',
  '  .population.layout-graph .group.fn { grid-row: 1; grid-column: 2; }',
  '  .population.layout-graph .group.tp { grid-row: 1; grid-column: 3; }',
  '',
  '  .population.layout-graph .row-neg { grid-row: 2; grid-column: 1; }',
  '  .population.layout-graph .group.tn { grid-row: 2; grid-column: 2; }',
  '  .population.layout-graph .group.fp { grid-row: 2; grid-column: 3; }',
  '',
  '  /* Matrix Layout: scikit-learn (Negative class 0 first in rows and columns) */',
  '  .population-header.layout-scikit .col-neg { grid-column: 2; }',
  '  .population-header.layout-scikit .col-pos { grid-column: 3; }'
].join('\r\n');

const layoutReplacement = [
  '  /* Matrix Layout: Standard (Default) */',
  '  .population-header.layout-standard .col-pos,',
  '  .population-header:not(.layout-graph):not(.layout-scikit) .col-pos { grid-row: 1; grid-column: 2; }',
  '  .population-header.layout-standard .col-neg,',
  '  .population-header:not(.layout-graph):not(.layout-scikit) .col-neg { grid-row: 1; grid-column: 3; }',
  '',
  '  .population.layout-standard .row-pos,',
  '  .population:not(.layout-graph):not(.layout-scikit) .row-pos { grid-row: 1; grid-column: 1; }',
  '  .population.layout-standard .group.tp,',
  '  .population:not(.layout-graph):not(.layout-scikit) .group.tp { grid-row: 1; grid-column: 2; }',
  '  .population.layout-standard .group.fn,',
  '  .population:not(.layout-graph):not(.layout-scikit) .group.fn { grid-row: 1; grid-column: 3; }',
  '',
  '  .population.layout-standard .row-neg,',
  '  .population:not(.layout-graph):not(.layout-scikit) .row-neg { grid-row: 2; grid-column: 1; }',
  '  .population.layout-standard .group.fp,',
  '  .population:not(.layout-graph):not(.layout-scikit) .group.fp { grid-row: 2; grid-column: 2; }',
  '  .population.layout-standard .group.tn,',
  '  .population:not(.layout-graph):not(.layout-scikit) .group.tn { grid-row: 2; grid-column: 3; }',
  '',
  '  /* Matrix Layout: Matches Graph (Score Order: Negative on Left, Positive on Right) */',
  '  .population-header.layout-graph .col-neg { grid-row: 1; grid-column: 2; }',
  '  .population-header.layout-graph .col-pos { grid-row: 1; grid-column: 3; }',
  '',
  '  .population.layout-graph .row-pos { grid-row: 1; grid-column: 1; }',
  '  .population.layout-graph .group.fn { grid-row: 1; grid-column: 2; }',
  '  .population.layout-graph .group.tp { grid-row: 1; grid-column: 3; }',
  '',
  '  .population.layout-graph .row-neg { grid-row: 2; grid-column: 1; }',
  '  .population.layout-graph .group.tn { grid-row: 2; grid-column: 2; }',
  '  .population.layout-graph .group.fp { grid-row: 2; grid-column: 3; }',
  '',
  '  /* Matrix Layout: scikit-learn (Negative class 0 first in rows and columns) */',
  '  .population-header.layout-scikit .col-neg { grid-row: 1; grid-column: 2; }',
  '  .population-header.layout-scikit .col-pos { grid-row: 1; grid-column: 3; }'
].join('\r\n');

let replaced = 0;
if (content.includes(headerTarget)) {
  content = content.replace(headerTarget, headerReplacement);
  replaced++;
} else if (content.includes(headerTarget.replace(/\r\n/g, '\n'))) {
  content = content.replace(headerTarget.replace(/\r\n/g, '\n'), headerReplacement.replace(/\r\n/g, '\n'));
  replaced++;
}

if (content.includes(layoutTarget)) {
  content = content.replace(layoutTarget, layoutReplacement);
  replaced++;
} else if (content.includes(layoutTarget.replace(/\r\n/g, '\n'))) {
  content = content.replace(layoutTarget.replace(/\r\n/g, '\n'), layoutReplacement.replace(/\r\n/g, '\n'));
  replaced++;
}

fs.writeFileSync('index.html', content, 'utf8');
console.log('Replaced sections:', replaced);
