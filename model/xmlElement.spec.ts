import { describe, expect, it } from 'bun:test';
import { XmlElement } from './xmlElement';
import { XmlText } from './xmlText';
import { XmlAttribute } from './xmlAttribute';

describe('XmlElement', () => {
  describe('toString', () => {
    it('Element with attributes and text', () => {
      const attrDate = new XmlAttribute('date', '2025-02-22', ' ', '', ' ', '"');
      const attrAuthor = new XmlAttribute(
        'author',
        'John Doe',
        ' ',
        ' ',
        '',
        '\''
      );
      const elem = new XmlElement(
        'note',
        [attrDate, attrAuthor],
        [new XmlText('Some content')],
        ' ',
        false,
        ''
      );
      const expected = `<note date= "2025-02-22" author ='John Doe' >Some content</note>`;
      expect(elem.toString()).toBe(expected);
    });

    it('Self-closing element', () => {
      const elem = new XmlElement('br', [], [], ' ', true, '');
      const expected = `<br />`;
      expect(elem.toString()).toBe(expected);
    });

    it('Nested elements', () => {
      const child = new XmlElement(
        'child',
        [],
        [new XmlText('Text')],
        ' ',
        false,
        ''
      );
      const root = new XmlElement('root', [], [child], '', false, '');
      const expected = `<root><child >Text</child></root>`;
      expect(root.toString()).toBe(expected);
    });
  });
  describe('addElement', () => {
    it('should add a child element', () => {
      const existingChild = new XmlElement('child1');
      const element = new XmlElement('test', [], [existingChild]);
      const child = new XmlElement('child');
      element.addElement(child);
      expect(element.children).toEqual([existingChild, child]);
    });

    it('should add child after the given child', () => {
      const existingChild1 = new XmlElement('child1', [], []);
      const existingChild2 = new XmlElement('child2', [], []);
      const element = new XmlElement(
        'test',
        [],
        [existingChild1, existingChild2]
      );
      const child = new XmlElement('child');
      element.addElement(child, { after: existingChild1 });
      expect(element.children).toEqual([existingChild1, child, existingChild2]);
    });

    it('should add child before the given child', () => {
      const existingChild1 = new XmlElement('child1', [], []);
      const existingChild2 = new XmlElement('child2', [], []);
      const element = new XmlElement(
        'test',
        [],
        [existingChild1, existingChild2]
      );
      const child = new XmlElement('child');
      element.addElement(child, { before: existingChild2 });
      expect(element.children).toEqual([existingChild1, child, existingChild2]);
    });

    it('should update self closing', () => {
      const element = new XmlElement('test', [], [], ' ', true);
      const child = new XmlElement('child');
      element.addElement(child);
      expect(element.selfClosing).toBe(false);
    });

    describe('guessFormatting', () => {
      it('should add whitespace according previous node with after', () => {
        const existingChild = new XmlElement('child');
        const element = new XmlElement(
          'test',
          [],
          [new XmlText('\n  '), existingChild, new XmlText('\n')]
        );
        const child = new XmlElement('new-child');
        element.addElement(child, {
          after: existingChild
        });
        expect(element.toString()).toEqual(
          `<test>\n  <child></child>\n  <new-child></new-child>\n</test>`
        );
      });
      it('should add whitespace according previous node with before', () => {
        const existingChild = new XmlElement('child');
        const element = new XmlElement(
          'test',
          [],
          [new XmlText('\n  '), existingChild, new XmlText('\n')]
        );
        const child = new XmlElement('new-child');
        element.addElement(child, {
          before: existingChild
        });
        expect(element.toString()).toEqual(
          `<test>\n  <new-child></new-child>\n  <child></child>\n</test>`
        );
      });
      it('should handle trailing whitespace', () => {
        const element = new XmlElement('root', [], [
          new XmlText('\n  '),
          new XmlElement('child'),
          new XmlText('\n')
        ]);
        element.addElement(new XmlElement('new-child'));
        expect(element).toEqual(new XmlElement('root', [], [
          new XmlText('\n  '),
          new XmlElement('child'),
          new XmlText('\n  '),
          new XmlElement('new-child'),
          new XmlText('\n')
        ]));
      });
    });
  });
  describe('getAttributeValue', () => {
    it('should return the value of the attribute', () => {
      const element = new XmlElement('test', [new XmlAttribute('key', 'value &amp;')]);
      expect(element.getAttributeValue('key')).toBe('value &');
    });

    it('should return undefined if the attribute does not exist', () => {
      const element = new XmlElement('test');
      expect(element.getAttributeValue('key')).toBeUndefined();
    });
  });
  describe('setAttributeValue', () => {
    it('should set the value of the attribute', () => {
      const element = new XmlElement('test', [new XmlAttribute('key', 'value')]);
      element.setAttributeValue('key', 'new & value');
      expect(element.getAttributeValue('key')).toBe('new & value');
      expect(element.attributes).toEqual([new XmlAttribute('key', 'new &amp; value')]);
    });

    it('should add the attribute if it does not exist', () => {
      const element = new XmlElement('test');
      element.setAttributeValue('key', 'value');
      expect(element.getAttributeValue('key')).toBe('value');
    });

    it('should add the attribute with analogous formatting', () => {
      const element = new XmlElement('test', [new XmlAttribute('key', 'value', '\n  ', ' ', ' ', '\'')]);
      element.setAttributeValue('another-key', 'value');
      expect(element.toString()).toBe(`<test
  key = 'value'
  another-key = 'value'></test>`);
    });
  });
  describe('getFirstElementByName', () => {
    it('should return the first element with the given name', () => {
      const child1 = new XmlElement('child');
      const child2 = new XmlElement('child');
      const element = new XmlElement('test', [], [child1, child2]);
      expect(element.getFirstElementByName('child')).toBe(child1);
    });

    it('should return undefined if no element with the given name exists', () => {
      const element = new XmlElement('test');
      expect(element.getFirstElementByName('child')).toBeUndefined();
    });
  });

  describe('getElementsByName', () => {
    it('should return all elements with the given name', () => {
      const child1 = new XmlElement('child');
      const child2 = new XmlElement('child');
      const element = new XmlElement('test', [], [child1, child2]);
      expect(element.getElementsByName('child')).toEqual([child1, child2]);
    });

    it('should return an empty array if no element with the given name exists', () => {
      const element = new XmlElement('test');
      expect(element.getElementsByName('child')).toEqual([]);
    });
  });
});
