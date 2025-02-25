import { describe, expect, it } from 'bun:test';
import { XmlAttribute } from './xmlAttribute';

describe('XmlAttribute', () => {
  describe('unescapeValue', () => {
    it('should return "&" unescaped', () => {
      const attribute = new XmlAttribute('test', 'a &amp; b');
      expect(attribute.unescapeValue()).toBe('a & b');
    });
    it('should return "\'" unescaped', () => {
      const attribute = new XmlAttribute('test', 'a &apos; b');
      expect(attribute.unescapeValue()).toBe('a \' b');
    });
    it('should return """ unescaped', () => {
      const attribute = new XmlAttribute('test', 'a &quot; b');
      expect(attribute.unescapeValue()).toBe('a " b');
    });
    it('should return "<" unescaped', () => {
      const attribute = new XmlAttribute('test', 'a &lt; b');
      expect(attribute.unescapeValue()).toBe('a < b');
    });
    it('should return ">" unescaped', () => {
      const attribute = new XmlAttribute('test', 'a &gt; b');
      expect(attribute.unescapeValue()).toBe('a > b');
    });
    it('should handle double escaped correctly', () => {
      const attribute = new XmlAttribute('test', 'a &amp;lt; b');
      expect(attribute.unescapeValue()).toBe('a &lt; b');
    });
  });
  describe('setValue', () => {
    it('should escape "&"', () => {
      const attribute = new XmlAttribute('test', '');
      attribute.setValue('a & b');
      expect(attribute.value).toBe('a &amp; b');
    });
    it('should escape "\'"', () => {
      const attribute = new XmlAttribute('test', '');
      attribute.setValue('a \' b');
      expect(attribute.value).toBe('a &apos; b');
    });
    it('should escape """', () => {
      const attribute = new XmlAttribute('test', '');
      attribute.setValue('a " b');
      expect(attribute.value).toBe('a &quot; b');
    });
    it('should escape "<"', () => {
      const attribute = new XmlAttribute('test', '');
      attribute.setValue('a < b');
      expect(attribute.value).toBe('a &lt; b');
    });
    it('should escape ">"', () => {
      const attribute = new XmlAttribute('test', '');
      attribute.setValue('a > b');
      expect(attribute.value).toBe('a &gt; b');
    });
    it('should escape escaped value', () => {
      const attribute = new XmlAttribute('test', '');
      attribute.setValue('a &amp; b');
      expect(attribute.value).toBe('a &amp;amp; b');
    });

  });
});
