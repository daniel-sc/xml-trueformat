import { describe, expect, it } from 'bun:test';
import { XmlText } from './model/xmlText';
import { XmlComment } from './model/xmlComment';
import { XmlProcessing } from './model/xmlProcessing';
import { XmlAttribute } from './model/xmlAttribute';
import { XmlElement } from './model/xmlElement';
import { XmlParser } from './xmlParser';
import { XmlDocument } from './model/xmlDocument';
import { XmlCData } from './model/xmlCData';

describe('XmlParser', () => {
  describe('parse', () => {
    it('Full document roundtrip', () => {
      const xmlSource = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE note SYSTEM "Note.dtd">
<note date="2025-02-22" author='John Doe'>
  <to><![CDATA[Jane]]></to>
  <from>John</from>
  <body>Don't forget to check the XML parser!</body>
  <!--This is a comment-->
</note>`;
      const doc = XmlParser.parse(xmlSource);
      const roundtrip = doc.toString();
      expect(roundtrip).toEqual(xmlSource);
    });

    it('should parse complex example', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<root>
  <!-- my comment -->
  <self-closing attribute="value with double quotes" />
  <non-self-closing attribute='value with single quotes'></non-self-closing>
  <element-with-cdata><![CDATA[<html>]]></element-with-cdata>
</root>`;
      const doc = XmlParser.parse(xml);
      expect(doc).toEqual(
        new XmlDocument([
          new XmlProcessing('xml', ' ', 'version="1.0" encoding="UTF-8"'),
          new XmlText('\n'),
          new XmlElement(
            'root',
            [],
            [
              new XmlText('\n  '),
              new XmlComment(' my comment '),
              new XmlText('\n  '),
              new XmlElement(
                'self-closing',
                [new XmlAttribute('attribute', 'value with double quotes')],
                [],
                ' ',
                true,
              ),
              new XmlText('\n  '),
              new XmlElement(
                'non-self-closing',
                [new XmlAttribute('attribute', 'value with single quotes', ' ', '', '', "'")],
                [],
                '',
                false,
              ),
              new XmlText('\n  '),
              new XmlElement('element-with-cdata', [], [new XmlCData('<html>')]),
              new XmlText('\n'),
            ],
          ),
        ]),
      );
    });

    it('Error cases - mismatched closing tag', () => {
      const badXml = `<note><to>Jane</from></note>`;
      expect(() => XmlParser.parse(badXml)).toThrow('Unterminated element <to> starting at position 6');
    });

    it('Error cases - unterminated comment', () => {
      const badXml = `<!-- Comment without end`;
      expect(() => XmlParser.parse(badXml)).toThrow('Unterminated comment');
    });
    it('should parse document with escaped values', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<root>
  <note date="some'apos" author='some"quote'>
    <to><![CDATA[<inline-that-is-not-closed>]]></to>
    <from>John</from>
    <body>Don't forget&lt; to check the XML parser!</body>
    <!--This is <a> comment-->
  </note>
</root>`;
      const doc = XmlParser.parse(xml);
      expect(doc.toString()).toBe(xml);
    });
    it('should round trip attribute without value', () => {
      const xml = `<root><element attribute></element><other  attribute2  attribute3  /></root>`;
      const doc = XmlParser.parse(xml);
      const roundtrip = doc.toString();
      expect(roundtrip).toEqual(xml);
    });
    it('should round trip attribute with empty value', () => {
      const xml = `<root><element attribute=""></element></root>`;
      const doc = XmlParser.parse(xml);
      const roundtrip = doc.toString();
      expect(roundtrip).toEqual(xml);
    });
  });
  describe('parseFragment', () => {
    it('should parse fragment starting with text', () => {
      const fragment = 'Hello, <my /> World!';
      const nodes = XmlParser.parseFragment(fragment);
      expect(nodes).toEqual([new XmlText('Hello, '), new XmlElement('my', [], [], ' ', true), new XmlText(' World!')]);
    });
    it('should parse angular template', () => {
      const fragment = `<div someDirective #someRef></div>
  <app-radio-group [formControl]="control">
    <app-radio-button *ngFor="let item of dialogData.items" [value]="item">
      {{ displayLabel(item) }}
    </app-radio-button>
  </app-radio-group>
  <button type="button" (click)="confirmChoice()" i18n="@@APPLY_BUTTON">OK</button>
`;
      const nodes = XmlParser.parseFragment(fragment);

      expect(nodes.map(n => n.toString()).join('')).toEqual(fragment);
      expect(nodes).toEqual([
        new XmlElement('div', [new XmlAttribute('someDirective', '', ' ', '', '', '"', false), new XmlAttribute('#someRef', '', ' ', '', '', '"', false)], [], ''),
        new XmlText('\n  '),
        new XmlElement(
          'app-radio-group',
          [new XmlAttribute('[formControl]', 'control')],
          [
            new XmlText('\n    '),
            new XmlElement(
              'app-radio-button',
              [new XmlAttribute('*ngFor', 'let item of dialogData.items'), new XmlAttribute('[value]', 'item')],
              [new XmlText('\n      {{ displayLabel(item) }}\n    ')],
              '',
              false,
            ),
            new XmlText('\n  '),
          ],
          '',
        ),
        new XmlText('\n  '),
        new XmlElement(
          'button',
          [
            new XmlAttribute('type', 'button'),
            new XmlAttribute('(click)', 'confirmChoice()'),
            new XmlAttribute('i18n', '@@APPLY_BUTTON'),
          ],
          [new XmlText('OK')],
          '',
          false,
        ),
        new XmlText('\n'),
      ]);
    });
  });
});
