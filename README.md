[![npm](https://img.shields.io/npm/v/xml-trueformat)](https://www.npmjs.com/package/xml-trueformat)

# xml-trueformat

Typescript XML parser that 100% retains all formatting for creating identical XML on roundtrips.

If you have an XML file that you want to read, modify, and write back, this library will ensure that the output XML is formatted identical to the input XML.

## Features

- Retains all whitespace and line endings
- Retains all comments
- Retains whether an element is self-closing or not
- Retains attributes in the order they were defined
- Retains attribute quotes (single or double) and whitespace before and after the attribute name
- Retains XML processing instructions (including the XML declaration)
- Retains CDATA sections

## Example

The following XML:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<root>
  <!-- my comment -->
  <self-closing attribute="value with double quotes" />
  <non-self-closing attribute='value with single quotes'></non-self-closing>
  <element-with-cdata><![CDATA[<html>]]></element-with-cdata>
</root>
```

Will get parsed by `XmlParser.parse(..)` to:

```ts
new XmlDocument([
  new XmlProcessing('xml',' ', 'version="1.0" encoding="UTF-8"'),
  new XmlText('\n'),
  new XmlElement('root', [], [
    new XmlText('\n  '),
    new XmlComment(' my comment '),
    new XmlText('\n  '),
    new XmlElement('self-closing', [new XmlAttribute('attribute', 'value with double quotes')], [], ' ', true),
    new XmlText('\n  '),
    new XmlElement('non-self-closing', [new XmlAttribute('attribute', 'value with single quotes', ' ', '', '', "'")], [], '', false),
    new XmlText('\n  '),
    new XmlElement('element-with-cdata', [], [new XmlCData('<html>')]),
    new XmlText('\n')
  ])
]);
```

## Development

This project is written in Typescript and uses Bun.

```bash
bun install
bun test
```
