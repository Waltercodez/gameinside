const { createClient } = require('@sanity/client');

// NOTE: the frontend queries _type == "article", so we use that type here.
// Using "post" would mean published drafts won't appear on the website.
const DOCUMENT_TYPE = 'article';

const client = createClient({
  projectId: 'aydnlbgw',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

// ── Portable Text helpers ─────────────────────────────────────────────────────

function randomKey() {
  return Math.random().toString(36).slice(2, 14);
}

/**
 * Parse a line of text with **bold** markers into Portable Text span objects.
 */
function parseInlineText(text) {
  const spans = [];
  let remaining = text;

  while (remaining.length > 0) {
    const match = remaining.match(/^([\s\S]*?)\*\*([\s\S]+?)\*\*([\s\S]*)$/);
    if (match) {
      if (match[1]) {
        spans.push({ _type: 'span', _key: randomKey(), text: match[1], marks: [] });
      }
      spans.push({ _type: 'span', _key: randomKey(), text: match[2], marks: ['strong'] });
      remaining = match[3];
    } else {
      spans.push({ _type: 'span', _key: randomKey(), text: remaining, marks: [] });
      break;
    }
  }

  return spans.length > 0 ? spans : [{ _type: 'span', _key: randomKey(), text: '', marks: [] }];
}

/**
 * Convert a markdown string (from Claude) to a Portable Text block array.
 * Handles: # headings, ## headings, ### headings, **bold**, normal paragraphs.
 */
function markdownToPortableText(markdown) {
  const paragraphs = markdown.split(/\n{2,}/).filter((p) => p.trim());

  return paragraphs.map((para) => {
    const trimmed = para.trim();

    if (trimmed.startsWith('### ')) {
      return {
        _type: 'block',
        _key: randomKey(),
        style: 'h3',
        markDefs: [],
        children: [{ _type: 'span', _key: randomKey(), text: trimmed.slice(4).trim(), marks: [] }],
      };
    }

    if (trimmed.startsWith('## ')) {
      return {
        _type: 'block',
        _key: randomKey(),
        style: 'h2',
        markDefs: [],
        children: [{ _type: 'span', _key: randomKey(), text: trimmed.slice(3).trim(), marks: [] }],
      };
    }

    if (trimmed.startsWith('# ')) {
      return {
        _type: 'block',
        _key: randomKey(),
        style: 'h1',
        markDefs: [],
        children: [{ _type: 'span', _key: randomKey(), text: trimmed.slice(2).trim(), marks: [] }],
      };
    }

    // Normal paragraph — parse inline bold
    return {
      _type: 'block',
      _key: randomKey(),
      style: 'normal',
      markDefs: [],
      children: parseInlineText(trimmed),
    };
  });
}

// ── Save draft ────────────────────────────────────────────────────────────────

/**
 * Zet een artikel in Sanity.
 *
 * Concepten krijgen een "drafts."-prefix op het _id en een [CONCEPT] marker in
 * de titel. Die zijn onzichtbaar op de site, want de frontend praat zonder
 * token met Sanity en ziet daardoor alleen gepubliceerde documenten.
 *
 * @param {object} article
 * @param {object} [options]
 * @param {boolean} [options.publish]  direct live zetten in plaats van concept
 */
async function saveDraft(article, options = {}) {
  const publish = Boolean(options.publish);
  const baseId = `auto-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  const doc = {
    _id: publish ? baseId : `drafts.${baseId}`,
    _type: DOCUMENT_TYPE,
    title: publish ? article.title : `[CONCEPT] ${article.title}`,
    slug: { _type: 'slug', current: article.slug },
    excerpt: article.excerpt,
    content: markdownToPortableText(article.content),
    category: article.category,
    author: 'Gameinside Redactie',
    publishedAt: new Date().toISOString(),
    featured: false,
    readTime: article.readTime || 4,
  };

  await client.createOrReplace(doc);
  return doc._id;
}

module.exports = { saveDraft };
