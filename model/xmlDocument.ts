import { XmlNode } from './xmlNode';

/// The document node is simply a container for a sequence of XML nodes.
export class XmlDocument extends XmlNode {
  constructor(public children: XmlNode[]) {
    super();
  }

  toString(): string {
    return this.children.map((child) => child.toString()).join('');
  }
}
