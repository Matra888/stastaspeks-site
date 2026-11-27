# Zīmola dizaina sistēma — MI aģenti

Avots: fotogrāfijas (`assets/`) un iepriekšējie posti. Viss, ko ģenerē, balstās uz `tokens.json`.

## Formāti
| Formāts | Izmērs | Lietošana |
|---|---|---|
| IG karuselis / single | 1080×1350 | Instagram 4:5 |
| LinkedIn | 1200×1200 | LinkedIn kvadrāts |
| Bloga attēls | 1200×630 | Bloga galvene / OG |

## Krāsas (no Stasta Speks lapām)
- Paper `#F5F5F7` — neitrālais fons (noklusējums)
- Ink `#1D1D1F` — teksts, tumšais gradients uz foto
- Accent `#128C4A` — tikai akcenti (aplis, apakšvirsraksta marķieri, cena)
- Muted `#6E6E73` — sekundārais teksts
- Line `#D2D2D7` — līnijas, ja vajag

## Tipogrāfija
- Virsraksts un teksts: Inter (bold virsrakstam). Ja nav instalēts, renderē `Liberation Sans`.
- Hierarhija: **1 lielais** virsraksts (112 px IG) + **1 mazāks** paraksts/saraksts (44–46 px). Vairāk līmeņu nav.

## Drošā zona
- 110 px no malām, 190 px no apakšas (IG profila režģis apgriež 3:4).

## Foto apstrāde
- Pilnā platumā, `object-position: 50% 15%`.
- Teksta vietā apakšā tumšs gradients (no 42% augstuma līdz ink).

## Slaidu tipi
- `cover` — foto + lielais virsraksts + paraksts (āķis, 1. slaids)
- `list` — krāsains fons + virsraksts + 3–4 punkti + cena (2. slaids)
- `cta` — akcenta fons + aicinājums (pēdējais slaids)

## Balss
Tokens.json → `voice.rules`. Īsi teikumi, bez solījumiem, skaitļi tikai no pārbaudāmiem faktiem.

## Lietošana
```bash
cd brand/zimols
NODE_PATH=$(npm root -g) node render.js carousel.example.json out
```
Jauns karuselis = jauns JSON ar `slides`. Fails `carousel.example.json` ir paraugs.
