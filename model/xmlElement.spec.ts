import { describe, expect, it } from 'bun:test';
import { XmlElement } from './xmlElement';
import { XmlText } from './xmlText';

describe('XmlElement', () => {
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
      const element = new XmlElement('test', [], [existingChild1, existingChild2]);
      const child = new XmlElement('child');
      element.addElement(child, { after: existingChild1 });
      expect(element.children).toEqual([existingChild1, child, existingChild2]);
    });
    it('should update self closing', () => {
      const element = new XmlElement('test', [], [], ' ', true);
      const child = new XmlElement('child');
      element.addElement(child);
      expect(element.selfClosing).toBe(false);
    });

    describe('guessFormatting', () => {
      it('should add whitespace according previous node', () => {
        const existingChild = new XmlElement('child');
        const element = new XmlElement('test', [], [
          new XmlText('\n  '),
          existingChild,
          new XmlText('\n'),
        ]);
        const child = new XmlElement('new-child');
        element.addElement(child, { after: existingChild, guessFormatting: true});
        expect(element.toString()).toEqual(`<test>\n  <child></child>\n  <new-child></new-child>\n</test>`);
      });
    });
  });

});