// Processing instruction node.
// Captures the target, any whitespace after it, and the instruction data.
import { XmlNode } from './xmlNode';

export class XmlProcessing extends XmlNode {
  constructor(
    public target: string,
    public wsAfterTarget: string,
    public data: string,
  ) {
    super();
  }

  toString(): string {
    return `<?${this.target}${this.wsAfterTarget}${this.data}?>`;
  }
}
