import { describe, expect, it } from 'bun:test';
import { XmlText } from './model/xmlText';
import { XmlComment } from './model/xmlComment';
import { XmlProcessing } from './model/xmlProcessing';
import { XmlAttribute } from './model/xmlAttribute';
import { XmlElement } from './model/xmlElement';
import { XmlParser } from './xmlParser';
import { XmlDocument } from './model/xmlDocument';

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
  <element attribute="value" />
  <element attribute='value'></element>
</root>`;
      const doc = XmlParser.parse(xml);
      expect(doc).toEqual(new XmlDocument([
        new XmlProcessing('xml',' ', 'version="1.0" encoding="UTF-8"'),
        new XmlText('\n'),
        new XmlElement('root', [], [
          new XmlText('\n  '),
          new XmlComment(' my comment '),
          new XmlText('\n  '),
          new XmlElement('element', [new XmlAttribute('attribute', 'value')], [], ' ', true),
          new XmlText('\n  '),
          new XmlElement('element', [new XmlAttribute('attribute', 'value', ' ', '', '', "'")], [], '', false),
          new XmlText('\n')
        ])
      ]));
    });

    it('Error cases - mismatched closing tag', () => {
      const badXml = `<note><to>Jane</from></note>`;
      expect(() => XmlParser.parse(badXml)).toThrow(
        'Unterminated element <to> starting at position 6'
      );
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
  });
  describe('parseFragment', () => {
    it('should parse fragment starting with text', () => {
      const fragment = 'Hello, <my /> World!';
      const nodes = XmlParser.parseFragment(fragment);
      expect(nodes).toEqual([
        new XmlText('Hello, '),
        new XmlElement('my', [], [], ' ', true),
        new XmlText(' World!')
      ]);
    });
  });
});
