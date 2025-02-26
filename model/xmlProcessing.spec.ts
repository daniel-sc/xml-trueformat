import { describe, expect, it } from 'bun:test';
import { XmlProcessing } from './xmlProcessing';

describe('XmlProcessing', () => {

  it('Processing instruction', () => {
    const node = new XmlProcessing('xml', ' ', 'version="1.0"');
    expect(node.toString()).toBe(`<?xml version="1.0"?>`);
  });
});