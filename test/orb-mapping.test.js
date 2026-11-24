import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';

const read = (p) => readFileSync(join(process.cwd(), p), 'utf8');

const ENGINE = '/assets/vendor/thinking-orbs-engine.js';
const HELPER = '/assets/orb.js';
const STATES = {
  'pahchan/index.html': 'searching',
  'rachna/index.html': 'composing',
  'vibhajan/index.html': 'weaving',
  'vahak-uploader/index.html': 'connecting',
  'sanket/index.html': 'solving',
  'sankshep/index.html': 'shaping',
  'tulna/index.html': 'solving',
};

describe('thinking-orbs Phase 2', () => {
  for (const [page, state] of Object.entries(STATES)) {
    it(`${page} maps ${state} with an accessible status`, () => {
      const html = read(page);
      assert.ok(html.includes(ENGINE), 'loads the vendored engine');
      assert.ok(html.includes(HELPER), 'loads the custom element');
      assert.ok(
        html.includes(`<thinking-orb state="${state}" size="20" aria-hidden="true">`),
        'decorative orb with the mapped state and tuned size 20'
      );
      const row = html.match(/<div class="orb-status">([\s\S]*?)<\/div>/);
      assert.ok(row, 'has an orb status row');
      assert.match(row[1], /role="status"/, 'adjacent text carries role=status');
    });
  }

  it('hero uses the 64px breathing orb with hidden status text', () => {
    const html = read('index.html');
    assert.ok(html.includes(ENGINE) && html.includes(HELPER));
    assert.ok(html.includes('<thinking-orb state="breathing" size="64" aria-hidden="true">'));
    assert.match(html, /<span class="sr-only" role="status">/, 'screen-reader status is present');
    assert.ok(read('assets/landing.css').includes('.sr-only'), 'sr-only utility is defined');
  });

  it('engine supports every mapped state', () => {
    const orb = read('assets/orb.js');
    for (const state of new Set(Object.values(STATES).concat('breathing'))) {
      assert.match(orb, new RegExp(`\\b${state}\\b`), `state ${state} exists`);
    }
  });
});
