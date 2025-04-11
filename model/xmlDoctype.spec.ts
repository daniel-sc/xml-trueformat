import { describe, expect, it } from 'bun:test';
import { XmlDoctype } from './xmlDoctype';

describe('XmlDoctype', () => {
  it('DOCTYPE declaration', () => {
    const content = 'note SYSTEM "Note.dtd"';
    const node = new XmlDoctype(content);
    expect(node.toString()).toBe(`<!DOCTYPE ${content}>`);
  });
});
