import { Marked, Renderer, Tokens } from 'marked';

/**
 * Custom Marked renderer that converts Markdown to Telegram-compatible HTML.
 *
 * Telegram supports a limited set of HTML tags:
 * - <b>, <strong> - Bold
 * - <i>, <em> - Italic
 * - <u>, <ins> - Underline
 * - <s>, <strike>, <del> - Strikethrough
 * - <code> - Inline code
 * - <pre> - Code block
 * - <a href="..."> - Links
 *
 * Unsupported tags like <h1>, <ul>, <li>, <br>, <p> are converted to text equivalents.
 */
class TelegramHtmlRenderer extends Renderer {
  // Headers: Convert to bold text with line break
  heading({ text, depth }: Tokens.Heading): string {
    const prefix = depth <= 2 ? '📌 ' : '';
    return `\n${prefix}<b>${text}</b>\n\n`;
  }

  // Paragraphs: Just text with newlines (NO <p> tags!)
  paragraph({ text }: Tokens.Paragraph): string {
    return `${text}\n\n`;
  }

  // Lists: Convert to bullet points
  list({ items, ordered }: Tokens.List): string {
    const result = items
      .map((item, index) => {
        const bullet = ordered ? `${index + 1}.` : '•';
        // Remove any trailing newlines from item text
        const itemText = item.text.replace(/\n+$/, '');
        return `${bullet} ${itemText}`;
      })
      .join('\n');
    return `${result}\n\n`;
  }

  // List items (handled by list method above)
  listitem(item: Tokens.ListItem): string {
    return item.text;
  }

  // Code blocks
  code({ text, lang }: Tokens.Code): string {
    if (lang) {
      return `<pre language="${lang}">${this.escapeHtml(text)}</pre>\n\n`;
    }
    return `<pre>${this.escapeHtml(text)}</pre>\n\n`;
  }

  // Inline code
  codespan({ text }: Tokens.Codespan): string {
    return `<code>${this.escapeHtml(text)}</code>`;
  }

  // Bold
  strong({ text }: Tokens.Strong): string {
    return `<b>${text}</b>`;
  }

  // Italic
  em({ text }: Tokens.Em): string {
    return `<i>${text}</i>`;
  }

  // Strikethrough
  del({ text }: Tokens.Del): string {
    return `<s>${text}</s>`;
  }

  // Links
  link({ href, text }: Tokens.Link): string {
    return `<a href="${href}">${text}</a>`;
  }

  // Line breaks
  br(): string {
    return '\n';
  }

  // Horizontal rule
  hr(): string {
    return '\n———————————\n\n';
  }

  // Blockquotes
  blockquote({ text }: Tokens.Blockquote): string {
    const lines = text
      .trim()
      .split('\n')
      .map((line) => `│ ${line}`)
      .join('\n');
    return `${lines}\n\n`;
  }

  // Images (not supported by Telegram, convert to link)
  image({ href, text }: Tokens.Image): string {
    return `[${text || 'Image'}](${href})`;
  }

  // Text (just return the text as-is)
  text({ text }: Tokens.Text): string {
    return text;
  }

  // Escape HTML special characters
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}

/**
 * Strips any remaining unsupported HTML tags from the output.
 * This is a safety net in case marked generates unexpected tags.
 */
function stripUnsupportedTags(html: string): string {
  // Telegram supported tags
  const supportedTags = [
    'b',
    'strong',
    'i',
    'em',
    'u',
    'ins',
    's',
    'strike',
    'del',
    'code',
    'pre',
    'a',
    'tg-spoiler',
  ];

  // Remove any HTML tags that are NOT in the supported list
  // This regex matches opening and closing tags
  return html.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g, (match, tagName) => {
    const tag = tagName.toLowerCase();
    // Keep supported tags and their attributes
    if (supportedTags.includes(tag)) {
      return match;
    }
    // Remove unsupported tags completely
    return '';
  });
}

/**
 * Converts Markdown text to Telegram-compatible HTML.
 * Uses a custom renderer to handle unsupported HTML tags.
 */
export function convertMarkdownToTelegramHtml(markdown: string): string {
  const marked = new Marked({
    renderer: new TelegramHtmlRenderer(),
    gfm: true,
    breaks: true,
    async: false, // Force synchronous parsing
  });

  const result = marked.parse(markdown);

  // Ensure we have a string (marked.parse can return Promise if async is true)
  const htmlString = typeof result === 'string' ? result : '';

  // Strip any remaining unsupported tags as a safety measure
  const cleanedHtml = stripUnsupportedTags(htmlString);

  // Clean up extra whitespace
  return cleanedHtml.replace(/\n{3,}/g, '\n\n').trim();
}
