// DOCTYPE declaration.
import { XmlNode } from "./xmlNode";

export class XmlDoctype extends XmlNode {
  constructor(public content: string) {
    super();
  }

  toString(): string {
    return `<!DOCTYPE ${this.content}>`;
  }
}
