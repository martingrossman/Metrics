const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const target = '    .control, .control input[type="range"] { min-height: 30px; height: 30px; }';
const targetBlock = [
  '    .control, .control input[type="range"] { min-height: 30px; height: 30px; }',
  '    .container > .metrics { padding: 2px 0; }',
  '    .metric { padding: 4px 8px 2px; }',
  '    .metric-label small { display: none; }'
];

const replacementBlock = [
  '    .control, .control input[type="range"] { min-height: 28px; height: 28px; }',
  '    .container > .metrics { padding: 2px 0; }',
  '    .metric {',
  '      padding: 3px 6px 2px;',
  '      flex-direction: column;',
  '      align-items: flex-start;',
  '      gap: 1px;',
  '    }',
  '    .metric-label small {',
  '      display: block;',
  '      font-size: 8.5px;',
  '      line-height: 1.05;',
  '      white-space: nowrap;',
  '      overflow: hidden;',
  '      text-overflow: ellipsis;',
  '    }',
  '    .metric strong {',
  '      font-size: 19px;',
  '      line-height: 1;',
  '    }'
];

const targetCRLF = targetBlock.join('\r\n');
const targetLF = targetBlock.join('\n');

if (content.includes(targetCRLF)) {
  content = content.replace(targetCRLF, replacementBlock.join('\r\n'));
  fs.writeFileSync('index.html', content, 'utf8');
  console.log('Updated CRLF');
} else if (content.includes(targetLF)) {
  content = content.replace(targetLF, replacementBlock.join('\n'));
  fs.writeFileSync('index.html', content, 'utf8');
  console.log('Updated LF');
} else {
  console.error('Target not found');
  process.exit(1);
}
