// Models an attribute – it stores its leading whitespace, name,
// whitespace around the equal sign, quote style, and the value.

import { escapeXml, unescapeXml } from '../util/escape';

export class XmlAttribute {
  constructor(
    public name: string,
    /** The attribute value. Special characters are expected to be escaped! */
    public value: string,
    /** Whitespace immediately before the attribute name. */
    public leadingWs: string = ' ',
    public wsBeforeEqual: string = '',
    public wsAfterEqual: string = '',
    public quote: '"' | '\'' = '"'
  ) {
  }

  unescapeValue(): string {
    return unescapeXml(this.value);
  }

  setValue(unescapedValue: string): void {
    this.value = escapeXml(unescapedValue);
  }

  toString(): string {
    return (
      this.leadingWs +
      this.name +
      this.wsBeforeEqual +
      '=' +
      this.wsAfterEqual +
      this.quote +
      this.value +
      this.quote
    );
  }
}
