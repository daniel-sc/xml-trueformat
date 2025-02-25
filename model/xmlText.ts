import { XmlNode } from './xmlNode';
import { escapeXml, unescapeXml } from '../util/escape';

export class XmlText extends XmlNode {
  constructor(
    /** The text content of the node. Special characters are expected to be escaped! */
    public text: string
  ) {
    super();
  }

  public unescapeText(): string {
    return unescapeXml(this.text);
  }

  public setText(unescapedText: string): void {
    this.text = escapeXml(unescapedText);
  }

  toString(): string {
    return this.text;
  }
}
