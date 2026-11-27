---
name: zimols-hierarchy
description: Use when designing or reviewing Stasta Speks / MI aģenti social slides (Instagram 1080x1350, LinkedIn 1200x1200). Defines the 3-level type hierarchy, the single green accent, neutral background, and the highlight rule. Trigger on requests for slide design, layout review, or "make it look like the others".
---

# Stasta Speks slide hierarchy

## Palette
- Background: neutral paper `#F5F5F7`. Never a coloured full-bleed background.
- Text: ink `#1D1D1F`; secondary `#6E6E73`.
- Accent: green `#128C4A` by default. Yellow `#F5B800` (text ink `#1D1D1F`) only when the user asks for it on a specific slide. Claude orange `#D97757` only for the word "Claude" or the Claude mark.
- One accent colour per slide.

## Three levels, no more
1. **Headline**: 96-120 px bold (Inter), ink. One per slide.
2. **Pill or highlight**: 46 px, white text on accent. Highlights the key value or the key phrase. Max one pill per slide.
3. **Body / cards / caption**: 42 px regular. Cards are white with a soft shadow and an accent check circle.

Rule: if a fourth text size appears, remove one level.

## Highlight rule
- Highlight the one phrase that carries the decision (e.g. "„Jā“ uzreiz"), not whole sentences.
- Use the inline `<span class="hl">` for phrase highlights.
- Save/comment line: ink bold text, grey (`#6E6E73`) bookmark icon, placed last.

## Slide types
- `cover`: photo with bottom dark gradient, optional emoji, headline in 2 lines, subline below.
- `features`: headline, accent pill, 2-4 white cards with check marks, optional closing line.
- `list`: same as features without cards. Use for plain data.
- `question`: one large question, optional subline, optional highlight, last slide only.

## Language
- LinkedIn: always English, unless the user says otherwise.
- Instagram: Latvian.

## Headroom (photo covers)
- Keep the face clear of text. Either text sits at the bottom below the chin, or the photo is shifted down so the headline sits in the free space above the head (LinkedIn cover: `photoShift` + `textTop`).
- Never place a subline over the eyes or forehead.

## Safe zones
- 110 px from left and right, 190 px from bottom on IG (1080x1350).
- Keep 100 px margins on LinkedIn (1200x1200).

## Checklist before rendering
- [ ] Headline is the largest element.
- [ ] Only one accent colour.
- [ ] No more than one pill.
- [ ] Text is Latvian with correct macrons (ā ē ī ū ķ ļ ņ ģ č š ž).
- [ ] Each slide has one job: claim, data, comparison or question.
