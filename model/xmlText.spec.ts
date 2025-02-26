import { describe, expect, it } from 'bun:test';
import { XmlText } from './xmlText';

describe('XmlText', () => {
  describe('unescapeText', () => {
    it('Text node roundtrip', () => {
      const text = 'Hello, World!';
      const node = new XmlText(text);
      expect(node.toString()).toBe(text);
    });

    it('should return "&" unescaped', () => {
      const text = new XmlText('a &amp; b');
      expect(text.unescapeText()).toBe('a & b');
    });
    it('should return "\'" unescaped', () => {
      const text = new XmlText('a &apos; b');
      expect(text.unescapeText()).toBe("a ' b");
    });
    it('should return """ unescaped', () => {
      const text = new XmlText('a &quot; b');
      expect(text.unescapeText()).toBe('a " b');
    });
    it('should return "<" unescaped', () => {
      const text = new XmlText('a &lt; b');
      expect(text.unescapeText()).toBe('a < b');
    });
    it('should return ">" unescaped', () => {
      const text = new XmlText('a &gt; b');
      expect(text.unescapeText()).toBe('a > b');
    });
    it('should handle double escaped correctly', () => {
      const text = new XmlText('a &amp;lt; b');
      expect(text.unescapeText()).toBe('a &lt; b');
    });
    it('should handle unescaped " gracefully', () => {
      const text = new XmlText('a " b');
      expect(text.unescapeText()).toBe('a " b');
    });
    it("should handle unescaped ' gracefully", () => {
      const text = new XmlText("a ' b");
      expect(text.unescapeText()).toBe("a ' b");
    });
    it('should handle unescaped > gracefully', () => {
      const text = new XmlText('a > b');
      expect(text.unescapeText()).toBe('a > b');
    });
  });
  describe('setText', () => {
    it('should escape "&"', () => {
      const text = new XmlText('');
      text.setText('a & b');
      expect(text.text).toBe('a &amp; b');
    });
    it('should escape "\'"', () => {
      const text = new XmlText('');
      text.setText("a ' b");
      expect(text.text).toBe('a &apos; b');
    });
    it('should escape """', () => {
      const text = new XmlText('');
      text.setText('a " b');
      expect(text.text).toBe('a &quot; b');
    });
    it('should escape "<"', () => {
      const text = new XmlText('');
      text.setText('a < b');
      expect(text.text).toBe('a &lt; b');
    });
    it('should escape ">"', () => {
      const text = new XmlText('');
      text.setText('a > b');
      expect(text.text).toBe('a &gt; b');
    });
    it('should escape escaped value', () => {
      const text = new XmlText('');
      text.setText('a &amp; b');
      expect(text.text).toBe('a &amp;amp; b');
    });
  });
  describe('isWhitespace', () => {
    it('should return true for whitespace', () => {
      const text = new XmlText(' \n\t');
      expect(text.isWhitespace()).toBe(true);
    });
    it('should return false for non-whitespace', () => {
      const text = new XmlText(' a ');
      expect(text.isWhitespace()).toBe(false);
    });
  });
});
