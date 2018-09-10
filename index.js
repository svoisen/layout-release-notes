#!/usr/bin/env node

const request = require('request-promise');
const fs = require('fs');

function collateBugs(bugs) {
  const components = {};

  bugs.forEach(bug => {
    const component = bug.component;
    if (!components[component]) {
      components[component] = [];
    }

    components[component].push(bug);
  });
  
  return components;
}

function formatBug(bug) {
  return `{{Bug|${bug.id}}} ${bug.summary}`;
}

function formatCollatedBugs(collatedBugs) {
  let lines = [];

  Object.keys(collatedBugs).sort().forEach(key => {
    lines.push(`===${key}===`)
    lines = lines.concat(collatedBugs[key].map(formatBug));
  });

  return lines.join('\n\n');
}

function main() {
  const uri = 'https://bugzilla.mozilla.org/rest/bug';
  const qs = {
    include_fields: ['id', 'summary', 'status', 'component'].join(','),
    bug_status: 'RESOLVED',
    resolution: 'FIXED',
    product: 'Core',
    component: [
      'CSS Animations and Transitions',
      'CSS Parsing and Computation',
      'DOM: CSS Object Model',
      'Layout',
      'Layout: Block and Inline',
      'Layout: Columns',
      'Layout: Flexbox',
      'Layout: Floats',
      'Layout: Form Controls',
      'Layout: Generated Content, Lists, and Counters',
      'Layout: Grid',
      'Layout: Images, Video, and HTML Frames',
      'Layout: Positioned',
      'Layout: Ruby',
      'Layout: Scrolling and Overflow',
      'Layout: Tables',
      'Layout: Text and Fonts',
      'Print Preview',
      'Printing: Output',
      'Printing: Setup',
      'SVG'
    ],
    f1: 'bug_group',
    o1: 'nowordssubstr',
    v1: 'sec',
    short_desc: '^\\[wpt\\-sync\\]',
    short_desc_type: 'notregexp',
    target_milestone: 'mozilla62'
  };

  request({ uri, qs, json: true, useQuerystring: true })
    .then(data => {
      const formattedData = formatCollatedBugs(collateBugs(data.bugs));
      fs.writeFile('./out.txt', formattedData, error => {
        if (error) {
          console.error(`Error writing file: ${error}`);
        }
      });
    });
}

if (require.main === module) {
  main(process.argv);
}

module.exports = main;