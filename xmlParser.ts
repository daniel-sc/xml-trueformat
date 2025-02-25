// -------------------------
// XML Model & Parser
// -------------------------

// Text node.
import { XmlNode } from "./model/xmlNode";
import { XmlText } from "./model/xmlText";
import { XmlComment } from "./model/xmlComment";
import { XmlProcessing } from "./model/xmlProcessing";
import { XmlCData } from "./model/xmlCData";
import { XmlDoctype } from "./model/xmlDoctype";
import { XmlAttribute } from "./model/xmlAttribute";
import { XmlDocument } from "./model/xmlDocument";
import { XmlChildNode, XmlElement } from "./model/xmlElement";

// A simple recursive-descent XML parser.
// This parser makes explicit checks for termination of constructs and provides detailed error messages.
export class XmlParser {
  pos: number = 0;
  constructor(public input: string) {}

  static parse(xml: string): XmlDocument {
    const parser = new XmlParser(xml);
    const children: XmlNode[] = [];
    while (parser.pos < parser.input.length) {
      const node = parser.parseNode();
      if (node) {
        children.push(node);
      } else {
        break;
      }
    }
    return new XmlDocument(children);
  }

  parseNode(): XmlChildNode | XmlDoctype | null {
    if (this.peek() === "<") {
      if (this.input.startsWith("<!--", this.pos)) {
        return this.parseComment();
      } else if (this.input.startsWith("<![CDATA[", this.pos)) {
        return this.parseCData();
      } else if (this.input.startsWith("<!DOCTYPE", this.pos)) {
        return this.parseDoctype();
      } else if (this.input.startsWith("<?", this.pos)) {
        return this.parseProcessing();
      } else if (this.input.startsWith("</", this.pos)) {
        // End tag encountered; let caller handle.
        return null;
      } else {
        return this.parseElement();
      }
    } else {
      return this.parseText();
    }
  }

  parseText(): XmlText {
    const start = this.pos;
    while (this.pos < this.input.length && this.peek() !== "<") {
      this.pos++;
    }
    const text = this.input.substring(start, this.pos);
    return new XmlText(text);
  }

  parseComment(): XmlComment {
    const start = this.pos;
    this.pos += 4; // skip "<!--"
    const end = this.input.indexOf("-->", this.pos);
    if (end === -1) {
      throw new Error(`Unterminated comment starting at position ${start}`);
    }
    const commentContent = this.input.substring(this.pos, end);
    this.pos = end + 3; // skip "-->"
    return new XmlComment(commentContent);
  }

  parseProcessing(): XmlProcessing {
    const start = this.pos;
    this.pos += 2; // skip "<?"
    const target = this.readName();
    const wsAfterTarget = this.readWhitespace();
    const end = this.input.indexOf("?>", this.pos);
    if (end === -1) {
      throw new Error(
        `Unterminated processing instruction starting at position ${start}`,
      );
    }
    const data = this.input.substring(this.pos, end);
    this.pos = end + 2; // skip "?>"
    return new XmlProcessing(target, wsAfterTarget, data);
  }

  parseCData(): XmlCData {
    const start = this.pos;
    this.pos += 9; // skip "<![CDATA["
    const end = this.input.indexOf("]]>", this.pos);
    if (end === -1) {
      throw new Error(
        `Unterminated CDATA section starting at position ${start}`,
      );
    }
    const cdataContent = this.input.substring(this.pos, end);
    this.pos = end + 3; // skip "]]>"
    return new XmlCData(cdataContent);
  }

  parseDoctype(): XmlDoctype {
    const start = this.pos;
    this.pos += 9; // skip "<!DOCTYPE"
    const end = this.input.indexOf(">", this.pos);
    if (end === -1) {
      throw new Error(
        `Unterminated DOCTYPE declaration starting at position ${start}`,
      );
    }
    const content = this.input.substring(this.pos, end).trim();
    this.pos = end + 1; // skip ">"
    return new XmlDoctype(content);
  }

  parseElement(): XmlElement {
    const start = this.pos;
    if (this.peek() !== "<") {
      throw new Error(`Expected '<' at position ${this.pos}`);
    }
    this.pos++; // skip "<"
    const tagName = this.readName();
    if (tagName === "") {
      throw new Error(`Expected tag name at position ${this.pos}`);
    }
    const attributes: XmlAttribute[] = [];
    let attrTrailingWs = "";
    // Parse attributes until we hit ">" or "/>".
    while (this.pos < this.input.length && !this.startsWithAny([">", "/>"])) {
      const leadingWs = this.readWhitespace();
      if (this.startsWithAny([">", "/>"])) {
        // The whitespace belongs to the element.
        attrTrailingWs = leadingWs;
        break;
      }
      const attrName = this.readName();
      if (attrName === "") {
        throw new Error(`Expected attribute name at position ${this.pos}`);
      }
      const wsBeforeEqual = this.readWhitespace();
      let wsAfterEqual = "";
      let quote = "";
      let value = "";
      if (this.peek() === "=") {
        this.pos++; // skip "="
        wsAfterEqual = this.readWhitespace();
        quote = this.peek();
        if (quote === '"' || quote === "'") {
          this.pos++; // skip opening quote
          const startVal = this.pos;
          const endVal = this.input.indexOf(quote, this.pos);
          if (endVal === -1) {
            throw new Error(
              `Unterminated attribute value for "${attrName}" starting at position ${startVal}`,
            );
          }
          value = this.input.substring(startVal, endVal);
          this.pos = endVal + 1; // skip closing quote
        } else {
          // Unquoted attribute value.
          value = this.readUntil(/[\s>]/);
        }
      }
      attributes.push(
        new XmlAttribute(
          attrName,
          value,
          leadingWs,
          wsBeforeEqual,
          wsAfterEqual,
          quote,
        ),
      );
    }
    // End of open tag.
    let selfClosing = false;
    if (this.startsWithAny(["/>"])) {
      selfClosing = true;
      this.pos += 2;
    } else if (this.peek() === ">") {
      this.pos++;
    } else {
      throw new Error(`Expected '>' or '/>' at position ${this.pos}`);
    }
    // Parse children if not self-closing.
    const children: XmlChildNode[] = [];
    let closeTagWs = "";
    if (!selfClosing) {
      while (this.pos < this.input.length) {
        if (this.input.startsWith(`</${tagName}`, this.pos)) {
          break;
        }
        const child = this.parseNode();
        if (child instanceof XmlDoctype) {
          throw new Error(
            `Unexpected node type XmlDoctype as child of <${tagName}> at position ${this.pos}`,
          );
        }
        if (child) {
          children.push(child);
        } else {
          break;
        }
      }
      // Parse closing tag.
      if (this.input.startsWith(`</${tagName}`, this.pos)) {
        this.pos += 2; // skip "</"
        const closingTagName = this.readName();
        if (closingTagName !== tagName) {
          throw new Error(
            `Mismatched closing tag at position ${this.pos}: expected </${tagName}> but found </${closingTagName}>`,
          );
        }
        closeTagWs = this.readWhitespace();
        if (this.peek() === ">") {
          this.pos++; // skip ">"
        } else {
          throw new Error(
            `Expected '>' at end of closing tag for <${tagName}> at position ${this.pos}`,
          );
        }
      } else {
        throw new Error(
          `Unterminated element <${tagName}> starting at position ${start}`,
        );
      }
    }
    return new XmlElement(
      tagName,
      attributes,
      attrTrailingWs,
      selfClosing,
      children,
      closeTagWs,
    );
  }

  // Reads a name (letters, digits, underscore, hyphen, colon, period).
  readName(): string {
    const start = this.pos;
    while (
      this.pos < this.input.length &&
      /[A-Za-z0-9_\-.:]/.test(this.input[this.pos])
    ) {
      this.pos++;
    }
    return this.input.substring(start, this.pos);
  }

  // Reads a run of whitespace characters.
  readWhitespace(): string {
    const start = this.pos;
    while (this.pos < this.input.length && /\s/.test(this.input[this.pos])) {
      this.pos++;
    }
    return this.input.substring(start, this.pos);
  }

  // Reads until the given pattern is matched.
  readUntil(pattern: RegExp): string {
    const start = this.pos;
    while (
      this.pos < this.input.length &&
      !pattern.test(this.input[this.pos])
    ) {
      this.pos++;
    }
    return this.input.substring(start, this.pos);
  }

  // Helper: check if input at current position starts with any string in the list.
  startsWithAny(strings: string[]): boolean {
    for (const s of strings) {
      if (this.input.startsWith(s, this.pos)) {
        return true;
      }
    }
    return false;
  }

  peek(): string {
    return this.input[this.pos];
  }
}
