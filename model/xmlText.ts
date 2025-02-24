import {XmlNode} from "./xmlNode";

export class XmlText extends XmlNode {
    constructor(public text: string) {
        super();
    }

    toString(): string {
        return this.text;
    }
}