# Style Guide

Rules for all copy on the site: pages, forms, emails sent by Pages Functions, and client documents.

## Punctuation

- **Never use em dashes (—).** This includes `&mdash;` and `&#8212;`. Use a comma, or end the sentence and start a new one.
  - Instead of: "Get these tools for free — fill out the form"
  - Write: "Get these tools for free. Fill out the form"
- En dashes (–) are fine only in number ranges, like "2–3 weeks".

## Messaging

- Never promise artists "the sound in their head" or any variant. It overpromises and sets a bad expectation.

## Checking before you commit

```bash
grep -rn "—\|&mdash;\|&#8212;" src functions
```

Hits inside code comments or console logs are fine. Anything a visitor or email recipient can read is not.
