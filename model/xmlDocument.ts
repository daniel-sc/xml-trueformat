import { XmlNode } from './xmlNode';
import { XmlChildNode, XmlElement } from './xmlElement';
import { XmlDoctype } from './xmlDoctype';

/// The document node is simply a container for a sequence of XML nodes.
export class XmlDocument extends XmlNode {
  constructor(public children: (XmlChildNode | XmlDoctype)[]) {
    super();
  }

  getRootElement(): XmlElement {
    const root = this.children.find((child) => child instanceof XmlElement);
    if (!root) {
      throw new Error('No root element found');
    }
    return root;
  }

  toString(): string {
    return this.children.map((child) => child.toString()).join('');
  }
}
