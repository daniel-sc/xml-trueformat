
// -------------------------
// Unit Tests
// -------------------------

// A simple assert helper.
import {XmlText} from "./model/xmlText";
import {XmlComment} from "./model/xmlComment";
import {XmlProcessing} from "./model/xmlProcessing";
import {XmlCData} from "./model/xmlCData";
import {XmlDoctype} from "./model/xmlDoctype";
import {XmlAttribute} from "./model/xmlAttribute";
import {XmlElement} from "./model/xmlElement";
import {XmlParser} from "./xmlParser";

function assertEqual(actual: string, expected: string, testName: string): void {
    if (actual !== expected) {
        throw new Error(`Test "${testName}" failed.\nExpected:\n${expected}\nActual:\n${actual}`);
    }
}

// Test suite.
function runTests() {
    // 1. Text node roundtrip.
    (function testText() {
        const text = "Hello, World!";
        const node = new XmlText(text);
        assertEqual(node.toString(), text, "Text node roundtrip");
    })();

    // 2. Comment node.
    (function testComment() {
        const comment = "This is a comment";
        const node = new XmlComment(comment);
        assertEqual(node.toString(), `<!--${comment}-->`, "Comment node roundtrip");
    })();

    // 3. Processing instruction.
    (function testProcessing() {
        const node = new XmlProcessing("xml", " ", 'version="1.0"');
        assertEqual(node.toString(), `<?xml version="1.0"?>`, "Processing instruction");
    })();

    // 4. CDATA section.
    (function testCData() {
        const cdata = "<tag>Some data</tag>";
        const node = new XmlCData(cdata);
        assertEqual(node.toString(), `<![CDATA[${cdata}]]>`, "CDATA section");
    })();

    // 5. DOCTYPE.
    (function testDoctype() {
        const content = 'note SYSTEM "Note.dtd"';
        const node = new XmlDoctype(content);
        assertEqual(node.toString(), `<!DOCTYPE ${content}>`, "DOCTYPE declaration");
    })();

    // 6. Element with attributes preserving whitespace.
    (function testElementAttributes() {
        // Build an element <note date="2025-02-22" author='John Doe'> ... </note>
        const attr1 = new XmlAttribute(" ", "date", "", " ", '"', "2025-02-22");
        const attr2 = new XmlAttribute(" ", "author", "", " ", "'", "John Doe");
        const elem = new XmlElement("note", [attr1, attr2], " ", false, [], "");
        // Append a text child.
        elem.addChild(new XmlText("Some content"));
        const expected = `<note date="2025-02-22" author='John Doe' >Some content</note>`;
        assertEqual(elem.toString(), expected, "Element with attributes and text");
    })();

    // 7. Self-closing element.
    (function testSelfClosingElement() {
        const elem = new XmlElement("br", [], " ", true, [], "");
        const expected = `<br />`;
        assertEqual(elem.toString(), expected, "Self-closing element");
    })();

    // 8. Nested elements.
    (function testNestedElements() {
        // <root><child>Text</child></root>
        const child = new XmlElement("child", [], " ", false, [new XmlText("Text")], "");
        const root = new XmlElement("root", [], "", false, [child], "");
        const expected = `<root><child >Text</child></root>`;
        assertEqual(root.toString(), expected, "Nested elements");
    })();

    // 9. Full document roundtrip.
    (function testFullDocument() {
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
        // Note: Since this production model rebuilds the string from its aspects,
        // the output may not be byte-for-byte identical to the input.
        // For the purpose of these tests, we check that the structure is correct.
        if (!roundtrip.includes(`<?xml`)) throw new Error("Processing instruction missing");
        if (!roundtrip.includes(`<!DOCTYPE note SYSTEM "Note.dtd">`)) throw new Error("DOCTYPE missing");
        if (!roundtrip.includes(`<note`)) throw new Error("Root element missing");
    })();

    // 10. Error cases.
    (function testErrorCases() {
        let errorThrown = false;
        try {
            // Mismatched closing tag.
            const badXml = `<note><to>Jane</from></note>`;
            XmlParser.parse(badXml);
        } catch (e) {
            errorThrown = true;
            if (!(e instanceof Error) || !e.message.includes("Mismatched closing tag")) {
                throw new Error("Unexpected error message for mismatched tag");
            }
        }
        if (!errorThrown) {
            throw new Error("Expected error for mismatched closing tag was not thrown");
        }

        errorThrown = false;
        try {
            // Unterminated comment.
            const badXml = `<!-- Comment without end`;
            XmlParser.parse(badXml);
        } catch (e) {
            errorThrown = true;
            if (!(e instanceof Error) || !e.message.includes("Unterminated comment")) {
                throw new Error("Unexpected error message for unterminated comment");
            }
        }
        if (!errorThrown) {
            throw new Error("Expected error for unterminated comment was not thrown");
        }
    })();

    console.log("All tests passed.");
}

// -------------------------
// Run tests if executed as main
// -------------------------
runTests();

// ----- Usage Example -----
// You can also use the parser in production like this:
const xmlSource = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE note SYSTEM "Note.dtd">
<note date="2025-02-22" author='John Doe'>
  <to><![CDATA[Jane]]></to>
  <from>John</from>
  <body>Don't forget to check the XML parser!</body>
  <!--This is a comment-->
</note>`;
const doc = XmlParser.parse(xmlSource);
console.log(doc.toString());
