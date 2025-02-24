// The document node is simply a container for a sequence of XML nodes.
import {XmlNode} from "./xmlNode";

export class XmlDocument extends XmlNode {
    constructor(public children: XmlNode[]) {
        super();
    }

    addChild(child: XmlNode) {
        this.children.push(child);
    }

    toString(): string {
        return this.children.map(child => child.toString()).join("");
    }
}