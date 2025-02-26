import { describe, expect, it } from 'bun:test';
import { XmlDocument } from './xmlDocument';
import { XmlElement } from './xmlElement';

describe('XmlDocument', () => {
  describe('getRootElement', () => {
    it('should return the root element', () => {
      const root = new XmlElement('root');
      const document = new XmlDocument([root]);
      expect(document.getRootElement()).toBe(root);
    });

    it('should throw if no root element found', () => {
      const document = new XmlDocument([]);
      expect(() => document.getRootElement()).toThrowError('No root element found');
    });
  })
});