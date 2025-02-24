// Models an attribute – it stores its leading whitespace, name,
// whitespace around the equal sign, quote style, and the value.
export class XmlAttribute {
    constructor(
        public leadingWs: string,         // whitespace immediately before this attribute
        public name: string,
        public wsBeforeEqual: string,
        public wsAfterEqual: string,
        public quote: string,             // either '"' or "'"
        public value: string
    ) {
    }

    toString(): string {
        return (
            this.leadingWs +
            this.name +
            this.wsBeforeEqual +
            "=" +
            this.wsAfterEqual +
            this.quote +
            this.value +
            this.quote
        );
    }
}