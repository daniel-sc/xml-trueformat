// XML comment node.
import { XmlNode } from "./xmlNode";

export class XmlComment extends XmlNode {
  constructor(public comment: string) {
    super();
  }

  toString(): string {
    return `<!--${this.comment}-->`;
  }
}
