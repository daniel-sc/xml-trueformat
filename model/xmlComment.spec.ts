import { describe, expect, it } from 'bun:test';
import { XmlComment } from './xmlComment';

describe('XmlComment', () => {
  it('Comment node roundtrip', () => {
    const comment = 'This is a comment';
    const node = new XmlComment(comment);
    expect(node.toString()).toBe(`<!--${comment}-->`);
  });
});