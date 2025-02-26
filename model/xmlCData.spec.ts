import { describe, expect, it } from 'bun:test';
import { XmlCData } from './xmlCData';

describe('XmlCData', () => {
  it('CDATA section', () => {
    const cdata = '<tag>Some data</tag>';
    const node = new XmlCData(cdata);
    expect(node.toString()).toBe(`<![CDATA[${cdata}]]>`);
  });
});