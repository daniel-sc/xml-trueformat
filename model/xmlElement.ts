// XML element node.
// It stores the tag name, an array of attributes, the whitespace after the last attribute,
// a flag for self-closing, its child nodes, and whitespace for the closing tag.
import { XmlNode } from "./xmlNode";
import { XmlAttribute } from "./xmlAttribute";
import { XmlText } from "./xmlText";
import { XmlComment } from "./xmlComment";
import { XmlProcessing } from "./xmlProcessing";
import { XmlCData } from "./xmlCData";

export type XmlChildNode =
  | XmlText
  | XmlComment
  | XmlProcessing
  | XmlCData
  | XmlElement;

export class XmlElement extends XmlNode {
  constructor(
    public tagName: string,
    public attributes: XmlAttribute[],
    public attrTrailingWs: string, // whitespace between last attribute (or tagName if none) and the closing of the open tag
    public selfClosing: boolean,
    public children: XmlChildNode[],
    public closeTagWs: string, // whitespace inside the closing tag before '>'
  ) {
    super();
  }

  addAttribute(attr: XmlAttribute) {
    this.attributes.push(attr);
    if (this.attrTrailingWs === "") {
      // Set a default trailing whitespace.
      this.attrTrailingWs = " ";
    }
  }

  addChild(child: XmlChildNode) {
    if (this.selfClosing) {
      // Convert self-closing element into one with children.
      this.selfClosing = false;
      // Default to no extra whitespace in closing tag.
      if (this.closeTagWs === undefined) {
        this.closeTagWs = "";
      }
    }
    this.children.push(child);
  }

  toString(): string {
    let openTag = `<${this.tagName}`;
    for (const attr of this.attributes) {
      openTag += attr.toString();
    }
    openTag += this.attrTrailingWs;
    openTag += this.selfClosing ? "/>" : ">";
    let childrenStr = "";
    if (!this.selfClosing) {
      for (const child of this.children) {
        childrenStr += child.toString();
      }
    }
    let closeTag = this.selfClosing
      ? ""
      : `</${this.tagName}${this.closeTagWs}>`;
    return openTag + childrenStr + closeTag;
  }
}
