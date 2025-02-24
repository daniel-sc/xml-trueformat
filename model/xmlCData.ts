// CDATA section.
import {XmlNode} from "./xmlNode";

export class XmlCData extends XmlNode {
    constructor(public cdata: string) {
        super();
    }

    toString(): string {
        return `<![CDATA[${this.cdata}]]>`;
    }
}