# xml-integrity

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
