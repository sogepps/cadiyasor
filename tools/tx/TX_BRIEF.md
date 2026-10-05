# Cadıya Sor (Ask the Witch) — translating one locale

Ask the Witch is a playful fortune-telling app for Android, a "book of answers". The user thinks
of a yes/no question (or types it), rubs a witch's bubbling cauldron, holds a magic grimoire or
shakes a crystal ball, and the witch reveals an answer on a parchment scroll. There is also a
daily omen with a lucky number, lucky color, lucky hour and the real moon phase, and a journal of
past readings. The witch is mischievous, warm and a little cheeky: think a friendly storybook
witch who calls you "dearie". It is entertainment for all ages (teens and adults, worldwide).

You are localizing it for one or more **locales**. Each locale is a *market*: `es-ES` is Spain
only, `es-419` Latin America only, `pt-PT` Portugal only, `pt-BR` Brazil only, `fr-FR` France only,
`fr-CA` Quebec only, `zh-TW` Taiwan (Traditional), `zh-HK` Hong Kong (Traditional, Hong Kong
usage), `zh-CN` Mainland China (Simplified). `tools/tx/sets.json` names the language and market of
every code.

All paths are relative to `E:\Soge\CadiyaSor`. For each locale you write three files in
`tools/tx/out/<locale>/` and a log line in `tools/tx/reviews/<locale>.md`. Finish all three tasks
for one locale, validate, then move to the next locale.

Write files with the Write tool as UTF-8 JSON (2-space indent is fine). Never touch another
locale's folder, `src/`, `tools/tx/src/`, the validator or anything else. Run no builds, npm, git
or expo commands, only `node tools/tx/validate.cjs`.

The English source is the reference. Turkish (the app's original language) is next to it in
`tools/tx/src/catalog.json` and `src/i18n/ui/tr.json`; use it as a second view of the meaning
when the English is ambiguous.

---

## Task 1 — oracle content: `content.json`

Source: `tools/tx/src/catalog.json` has four lists of `{ "en", "tr", ... }` objects:

| list | items | what it is |
|---|---|---|
| `answers` | 200 | Book-of-answers replies shown on a scroll ("Trust your instincts", "Not today", "Ask your mother") |
| `ball` | 24 | Crystal-ball replies, clearly yes / no / unclear ("The mist glows green: yes") |
| `omens` | 60 | One or two sentences of daily fortune ("Someone is thinking about you right now.") |
| `questions` | 30 | Example yes/no questions offered when the user needs an idea |

Write `tools/tx/out/<locale>/content.json`:

```json
{ "answers": [200 strings], "ball": [24 strings], "omens": [60 strings], "questions": [30 strings] }
```

Item N of each array translates item N of the same list, in the same order.

How to translate them:

- **Write what a native fortune teller would say**, not a word-for-word copy. Answers are short,
  punchy and quotable, like lines from a real "book of answers". Keep the meaning and the tone
  (the `tone` field says whether an answer means yes, no, maybe or "act"), but use the idiom your
  language would use. "Take the plunge", "Swallow your pride", "Laugh it off" must become the
  natural local expressions, not literal translations.
- Address the user as one person, informally (tu / du / ты / sen...), unless informal address
  would sound rude in that market's apps; then use the friendly form apps normally use.
- Gender-neutral wording where the language allows it: the user can be anyone. Avoid forms that
  assume the user is male or female; rephrase if necessary.
- `answers` and `ball`: no full stop at the end (question marks, "..." and inner punctuation are
  fine). Sentence case, not Title Case. Keep them short: most are under 40 characters; nothing may
  exceed 64 (`ball`: 48).
- `omens`: full sentences with normal punctuation, under 130 characters.
- `questions`: natural questions a person in that market would really ask; adapt where needed
  ("Should I order pizza tonight?" can become the local takeaway food). Keep them light and
  harmless: no health, legal or money-advice questions.
- Keep the jokes: "Even my cat says no", "Ask again when the tea has brewed" (swap the tea for the
  local drink if tea sounds odd), "Ask your mother / father".
- Two different items must never read the same (the validator rejects it). Several pairs are
  deliberate opposites ("Follow your heart, not your head" / "Follow your head, not your heart",
  "Choose the harder path" / "Choose the easier path"); keep them opposite.

## Task 2 — interface strings: `ui.json`

Source: `src/i18n/ui/en.json` (read it; do not edit it). Write `tools/tx/out/<locale>/ui.json`
with **exactly the same keys** and translated values.

- Keep every `{{placeholder}}` exactly as it is (same name, same braces). Word order around it may
  change.
- Short, natural, warm language, what a native speaker expects in a polished mobile app. Button
  labels written in capitals in the English (`ASK AGAIN`, `REVEAL THE ANSWER`) stay in capitals
  where the script has case.
- `app.name` is the app's name in that market: a natural, catchy translation of "Ask the Witch"
  (Turkish is "Cadıya Sor"). `app.tagline` is the local term for a "book of answers". Use the same
  name in the store listing.
- `witch.*` lines are spoken by the witch: playful, a bit theatrical. `witch.poke1` is her giggle
  ("Hee hee hee!") and `witch.cat` is the cat's meow; use the local onomatopoeia.
- `home.*.title`, `home.journal`, `reveal.share`, `reveal.save`, `reveal.saved` sit on small
  buttons: keep them short (≤ 18 characters where possible).
- `color.*` are simple color names; `moon.*` the standard astronomical names of the moon phases in
  your language; `moonTip.*` short folk-wisdom tips for that phase.
- `share.message` is sent to friends: keep `{{answer}}` in quotation marks of your language and
  keep `{{link}}` at the end.
- `settings.disclaimer` must keep the meaning "for entertainment only; you make the decision".
- For RTL languages write the text naturally; the app mirrors the layout itself.

## Task 3 — store listing: `listing.json`

Source: `tools/tx/src/listing.en.json` (and `listing.tr.json`). Write
`tools/tx/out/<locale>/listing.json` with the same shape: `title`, `short`, `full`, `feature`,
`shots` (6 × `{ title, sub }`).

Google Play hard limits (count characters, not bytes): `title` ≤ 30, `short` ≤ 80, `full` ≤ 4000.

- `title`: the app name from `app.name` plus a short descriptor people in that market would
  *search* for, like "Ask the Witch: Book of Answers" (the local words for book of answers /
  fortune / yes-no oracle). ≤ 30 characters: shorten the descriptor rather than exceed.
- `short`: one inviting sentence, ≤ 80.
- `full`: adapt, don't transliterate. Keep the section structure and emoji headings, and keep the
  facts exactly: three ways to ask (cauldron, grimoire, crystal ball), 200 answers, daily omen with
  lucky number, color, hour and the real moon phase, the same question on the same day gets the
  same answer, fate journal with favorites, share as a card, 75 languages, works offline, no
  sign-up, entertainment only. No HTML, no `<` or `>`. No claims of being "the best" or "#1", no
  other brands or apps.
- `feature`: the slogan printed on the feature graphic, ≤ 34 characters if possible.
- `shots`: captions printed on six screenshots. `title` ≤ 24 characters (all capitals where the
  script has case), `sub` ≤ 52 characters. They must fit on a phone screenshot, so shorter is
  better.

## Validate and log

After each locale:

```
node tools/tx/validate.cjs <locale> all
```

It must end with `OK`. Look at every warning and fix what is really wrong (an item identical to
English is fine only when that is genuinely what a native speaker would write). Then append to
`tools/tx/reviews/<locale>.md`:

```
- content + ui + listing done — e.g. <two examples "english → yours" where you used a local idiom>
LOCALE COMPLETE
```

When all your locales are done, reply with one line per locale: the validator's final line.
