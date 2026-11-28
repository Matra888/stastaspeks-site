---
name: zimols-content-system
description: Use for any new Stasta Speks / MI aģenti social content: Instagram carousel (1080x1350, Latvian), LinkedIn carousel (1200x1200, English), and the 30 s progress-globe video. Gives the fixed visual system, slide types, safe zones, render commands and the JSON template. Trigger on requests for new carousels, posts, covers, closing slides or videos in this series.
---

# Stasta Speks content system

The look is fixed. Only the ideas and text change. Always build from `brand/zimols/render.js` and the JSON templates. Never hand-write HTML.

## Language and format
| Channel | Size | Language | Script |
|---|---|---|---|
| Instagram carousel / post | 1080x1350 (`ig_carousel`) | Latvian | `render.js` |
| LinkedIn carousel | 1200x1200 (`linkedin`) | English | `render.js` |
| Video (30 s) | 1080x1350, 30 fps | match the channel | `spin-7en.js`, `spin-3week.js`, `spin5.js` (LV) |

## Palette and type
- Background: paper `#F5F5F7`. No coloured full-bleed backgrounds.
- Text: ink `#1D1D1F`. Never grey for body text. Grey `#6E6E73` is allowed only for the bookmark icon.
- Accent: green `#128C4A` (checkmarks, pills, highlights, progress). Yellow `#F5B800` only when asked (use `accent` + `accentInk` on that slide).
- Claude orange `#D97757` only for the word "Claude" or the Claude mark.
- Font: Inter bold for headlines, regular for body.

## Three levels, no more
1. Headline 96-120 px bold.
2. Pill or one green highlight (46 px, white on green). One per slide.
3. Body / cards 42 px. Cards are white with check marks.

## Slide types (`render.js`)
- `cover`: photo, optional emoji, headline in 2-3 lines. For LinkedIn use `centerBottom`, `leftText`, `photoBox`, or `textTop`.
- `features`: headline, green pill, 2-5 check cards, optional footer. Use `compact` for 5 items.
- `list`: headline and plain items.
- `quotes`: testimonials with logos.
- `question`: big question or closing message, optional `top`, `sub`, `sub2`.

## Safe zones
- IG: 110 px sides, 190 px bottom.
- LinkedIn: text 130 px from sides (the preview crops the sides), top 110 px. Never put the head under text. The LinkedIn cover text sits at 250 px margins.
- Video: headline and sub at x=110, bottom text not past x=970.

## Checkmarks and bullets
- Use green check marks (✓) or the card check circles. Never arrows (→) in client-facing text.
- Max one emoji per caption. In slides, the only emoji is the 💍 on covers.

## Captions
- IG: Latvian. LinkedIn: English. Hook → short explanation → one practical tip → one question → one action (save OR comment). Hashtags last.
- Proof: only numbers from the user's table or a checked source. Put the source on the slide or in the note.

## Video template (30 s)
- Globe: "3 weeks" (or "7 days"), "Claude" in orange, subtitle "online challenge".
- Progress line: green fill, numbered nodes, pop-up name per step.
- Closing: "Learn content and marketing systems" + "Join skilled content creators who know how to use Claude".
- Keep the 7 steps in this order: Artifacts / Design system / Instagram carousels / LinkedIn posts / Automated blog posts / Web audit / Video editing (EN). LV: Artifacts / Dizaina sistēma / Instagram karuseļi / LinkedIn posti / Automatizēti bloga raksti / Web lapas audits / Video montāža.

## Render
```bash
cd brand/zimols
NODE_PATH=$(npm root -g) node render.js <file>.json out
NODE_PATH=$(npm root -g) node spin-7en.js <framesDir>   # then ffmpeg to mp4
```

## JSON template
```json
{ "name": "post-name", "format": "ig_carousel",
  "slides": [
    { "type": "cover", "photo": "assets/p3.jpg", "emoji": "💍", "headline": ["Line 1", "Line 2"], "sub": "Subline" },
    { "type": "features", "bg": "paper", "headline": "Headline", "headlineSize": 96, "sub": "Pill text",
      "items": ["Item 1", "Item 2", "Item 3"], "footer": "Closing line" },
    { "type": "question", "bg": "paper", "plain": true, "headlineSize": 120, "headline": "Question?", "sub": "Subline" }
  ] }
```

## Checklist before sending
- [ ] Text inside safe zone for the channel.
- [ ] Head not covered by text.
- [ ] One accent colour; one pill.
- [ ] Text in ink, not grey.
- [ ] Checkmarks, not arrows.
- [ ] Correct language for the channel.
- [ ] Numbers sourced.
- [ ] Commit and push to `claude/affectionate-hopper-gd4vc1`.

## Problem / solution slides (`type: "problem"`)
- Use one shared layout for every problem slide in a series so they line up.
- Eyebrow label "PROBLĒMA n" in green, letter-spaced, 30 px.
- Headline 84 px, box reserved for 3 lines (`height = 3 × 84 × 1.08`), so the cards start at the same y on every slide regardless of headline length.
- Small pill "Risinājums" at 34 px (clearly smaller than the headline), 48-56 px gap above it.
- Cards at 38 px, check circles at 52 px.
- Closing slide of a series: a question headline that names the topic (e.g. "Kas tev vislabāk darbojas Meta reklāmās?") and a short comment invite.
