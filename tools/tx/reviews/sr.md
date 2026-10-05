# sr (Serbian, Cyrillic)

- content + ui + listing done — e.g. "Take the plunge" → "Скочи главачке" (the natural Serbian idiom "jump in headfirst", not a literal "заглиби се"); "Think twice, act once" → "Три пута мери, једном сеци" (the authentic Serbian proverb, "measure three times, cut once" — not the Russian/Ukrainian "seven times"). App name localized as "Питај Вештицу", tagline "Књига Одговора"; store title uses "Гатање" (fortune-telling/divination by cards or omens), the term a Serbian speaker would actually search for.
- Kept everything in Cyrillic script throughout (content, UI, listing), used standard Serbian vocabulary rather than Croatian/Bosnian variants (e.g. "недеља" not "tjedan", "хиљаду" not "tisuću"), and picked genuinely Serbian idiom/proverbs ("Ко чека, тај и дочека", "Играј на сигурно", "Прогутај понос").
- Gender-neutral handling: Serbian perfect tense and short-form adjectives agree with the subject's gender (спреман/спремна, сигуран/сигурна, срећан/срећна), so those were reworded into future tense, impersonal, or noun-based constructions, e.g. "You're not ready yet" → "Још није право време" (lit. "it's not yet the right time"), "You can be sure of it" → "У то нема сумње" (lit. "there's no doubt about it"), "Should I text them first?" → "Да ли да направим први корак?" (the adjective "први" then agrees with the neutral noun "корак", not with the user).
- Kept opposite pairs opposite (heart/head, harder/easier path, take/don't take the risk).
- `node tools/tx/validate.cjs sr all` → `sr all: OK`

LOCALE COMPLETE
