// XML element node.
// It stores the tag name, an array of attributes, the whitespace after the last attribute,
// a flag for self-closing, its child nodes, and whitespace for the closing tag.
import { XmlNode } from './xmlNode';
import { XmlAttribute } from './xmlAttribute';
import { XmlText } from './xmlText';
import { XmlComment } from './xmlComment';
import { XmlProcessing } from './xmlProcessing';
import { XmlCData } from './xmlCData';

export type XmlChildNode =
  | XmlText
  | XmlComment
  | XmlProcessing
  | XmlCData
  | XmlElement;

export class XmlElement extends XmlNode {
  constructor(
    public tagName: string,
    public attributes: XmlAttribute[] = [],
    public children: XmlChildNode[] = [],
    /** whitespace between last attribute (or tagName if none) and the closing of the open tag */
    public attrTrailingWs = '',
    public selfClosing = false,
    /** whitespace inside the closing tag before '>' */
    public closeTagWs: string = '',
  ) {
    super();
  }

  addElement(
    child: XmlElement,
    options?: {
      after?: XmlElement;
      before?: XmlElement;
      /** if `true` or not set, add leading whitespace analogous to sister node, to match formatting. */
      guessFormatting?: boolean;
    },
  ): void {
    let index: number;
    if (options?.after) {
      index = this.children.indexOf(options.after) + 1;
    } else if (options?.before) {
      index = this.children.indexOf(options.before);
      while (index > 0 && this.children[index - 1] instanceof XmlText) {
        index--;
      }
    } else {
      index = this.children.length;
    }

    if (options?.guessFormatting ?? true) {
      const sibling =
        this.children
          .slice(0, index)
          .reverse()
          .find((c) => c instanceof XmlElement) ??
        this.children.slice(index).find((c) => c instanceof XmlElement);
      if (sibling) {
        const siblingIndex = this.children.indexOf(sibling);
        const textBefore: XmlText | undefined =
          siblingIndex > 0 && this.children[siblingIndex - 1] instanceof XmlText
            ? (this.children[siblingIndex - 1] as XmlText)
            : undefined;
        const leadingWs = textBefore?.text ?? '';
        this.addChild(index, new XmlText(leadingWs), child);
      } else {
        this.addChild(index, child);
      }
    } else {
      this.addChild(index, child);
    }
  }

  addChild(index: number, ...children: XmlChildNode[]): void {
    if (this.selfClosing) {
      this.selfClosing = false;
    }
    this.children.splice(index, 0, ...children);
    this.joinTextNodes();
  }

  getAttribute(name: string): XmlAttribute | undefined {
    return this.attributes.find((attr) => attr.name === name);
  }

  /** returns unescaped attribute value or undefined if not found */
  getAttributeValue(name: string): string | undefined {
    return this.getAttribute(name)?.unescapeValue();
  }

  toString(): string {
    let openTag = `<${this.tagName}`;
    for (const attr of this.attributes) {
      openTag += attr.toString();
    }
    openTag += this.attrTrailingWs;
    openTag += this.selfClosing ? '/>' : '>';
    let childrenStr = '';
    if (!this.selfClosing) {
      for (const child of this.children) {
        childrenStr += child.toString();
      }
    }
    const closeTag = this.selfClosing
      ? ''
      : `</${this.tagName}${this.closeTagWs}>`;
    return openTag + childrenStr + closeTag;
  }

  private joinTextNodes() {
    for (let i = 0; i < this.children.length - 1; i++) {
      let child = this.children[i];
      if (child instanceof XmlText && child.text === '') {
        this.children.splice(i, 1);
        i--;
      }
      if (child instanceof XmlText && this.children[i + 1] instanceof XmlText) {
        child.text += (this.children[i + 1] as XmlText).text;
        this.children.splice(i + 1, 1);
        i--;
      }
    }
  }
}
