import { describe, it, expect } from "bun:test";
import { XmlText } from "./model/xmlText";
import { XmlComment } from "./model/xmlComment";
import { XmlProcessing } from "./model/xmlProcessing";
import { XmlCData } from "./model/xmlCData";
import { XmlDoctype } from "./model/xmlDoctype";
import { XmlAttribute } from "./model/xmlAttribute";
import { XmlElement } from "./model/xmlElement";
import { XmlParser } from "./xmlParser";

describe("XML Parser Tests", () => {
    it("Text node roundtrip", () => {
        const text = "Hello, World!";
        const node = new XmlText(text);
        expect(node.toString()).toBe(text);
    });

    it("Comment node roundtrip", () => {
        const comment = "This is a comment";
        const node = new XmlComment(comment);
        expect(node.toString()).toBe(`<!--${comment}-->`);
    });

    it("Processing instruction", () => {
        const node = new XmlProcessing("xml", " ", 'version="1.0"');
        expect(node.toString()).toBe(`<?xml version="1.0"?>`);
    });

    it("CDATA section", () => {
        const cdata = "<tag>Some data</tag>";
        const node = new XmlCData(cdata);
        expect(node.toString()).toBe(`<![CDATA[${cdata}]]>`);
    });

    it("DOCTYPE declaration", () => {
        const content = 'note SYSTEM "Note.dtd"';
        const node = new XmlDoctype(content);
        expect(node.toString()).toBe(`<!DOCTYPE ${content}>`);
    });

    it("Element with attributes and text", () => {
        const attrDate = new XmlAttribute(" ", "date", "", " ", '"', "2025-02-22");
        const attrAuthor = new XmlAttribute(" ", "author", " ", "", "'", "John Doe");
        const elem = new XmlElement("note", [attrDate, attrAuthor], " ", false, [], "");
        elem.addChild(new XmlText("Some content"));
        const expected = `<note date= "2025-02-22" author ='John Doe' >Some content</note>`;
        expect(elem.toString()).toBe(expected);
    });

    it("Self-closing element", () => {
        const elem = new XmlElement("br", [], " ", true, [], "");
        const expected = `<br />`;
        expect(elem.toString()).toBe(expected);
    });

    it("Nested elements", () => {
        const child = new XmlElement("child", [], " ", false, [new XmlText("Text")], "");
        const root = new XmlElement("root", [], "", false, [child], "");
        const expected = `<root><child >Text</child></root>`;
        expect(root.toString()).toBe(expected);
    });

    it("Full document roundtrip", () => {
        const xmlSource = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE note SYSTEM "Note.dtd">
<note date="2025-02-22" author='John Doe'>
  <to><![CDATA[Jane]]></to>
  <from>John</from>
  <body>Don't forget to check the XML parser!</body>
  <!--This is a comment-->
</note>`;
        const doc = XmlParser.parse(xmlSource);
        const roundtrip = doc.toString();
        expect(roundtrip).toContain(`<?xml`);
        expect(roundtrip).toContain(`<!DOCTYPE note SYSTEM "Note.dtd">`);
        expect(roundtrip).toContain(`<note`);
    });

    it("Error cases - mismatched closing tag", () => {
        const badXml = `<note><to>Jane</from></note>`;
        expect(() => XmlParser.parse(badXml)).toThrow("Unterminated element <to> starting at position 6");
    });

    it("Error cases - unterminated comment", () => {
        const badXml = `<!-- Comment without end`;
        expect(() => XmlParser.parse(badXml)).toThrow("Unterminated comment");
    });
});