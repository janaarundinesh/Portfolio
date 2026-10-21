# Arun Dinesh Jana — portfolio

A single-page, no-build portfolio: hand-written HTML, CSS and vanilla JavaScript.
Dark, high-contrast editorial layout with an acid-lime accent, a canvas flow
field in the hero, scroll-reveal sections, animated stat counters, a custom
cursor and a marquee ticker.

The page opens on a full-screen welcome: a spotlight portrait sits beside your
name, and as you scroll it slides right, shrinks into the portrait frame and
dissolves into the headshot, while the intro copy fades in. Below that, projects
animate in place, the toolkit is a radial map of tool logos, and the contact
block has a working message form.

The projects section is built from the public GitHub repositories of
[janaarundinesh](https://github.com/janaarundinesh): two featured projects with
live, self-drawn animations next to the real benchmark and simulation figures,
and three smaller project cards. Education, awards and the toolkit are separate
sections; the toolkit is a radial dial that maps one ring to each category.

## Run it locally

No dependencies, no build step. Any static file server works:

```bash
python3 -m http.server 4321 --bind 127.0.0.1
# then open http://127.0.0.1:4321/
```

Opening `index.html` directly from disk also works, but a server is better so
relative asset paths and `srcset` behave exactly as they will when deployed.

## Files

| Path | What it is |
| --- | --- |
| `index.html` | All content and structure: hero, about, projects, experience, education, awards, toolkit, contact. |
| `styles.css` | The whole visual system — design tokens at the top, then sections, responsive rules, reduced-motion and print styles. |
| `script.js` | Hero canvas and the welcome→portrait scroll morph, reveals, counters, mobile menu, custom cursor, tilt/magnetic effects, copy-email button, the FILTER2 sweep animation, figure tabs, the toolkit logo dial, project-card glow and the contact form. |
| `assets/portrait.jpg` | 933 × 1100 web-optimised portrait (plus `portrait-640.jpg` for small screens). |
| `assets/welcome.jpg` | The full-body spotlight photo used on the welcome screen (and as the portrait on phones). |
| `assets/welcome-mobile.jpg` | 900 px version of the same photo for small screens. |
| `assets/Arun_Dinesh_Jana_CV.pdf` | The downloadable CV linked from the hero and contact sections. |
| `assets/projects/` | Figures pulled from the GitHub repos: `thesis-runtime-5d.jpg`, `fhp-flow.jpg`, plus the derived animation frames `fhp-thermal.webp` and the filter stills in `assets/projects/filter-*.jpg`. |
| `screenshots/` | Reference captures of the finished layout. Safe to delete. |

## Editing content

Everything is plain text in `index.html`, in reading order. Search for the
section you want:

- `<!-- ============ WELCOME + HERO ============ -->` — the opening screen. `.welcome` holds
  the spotlight photo; the hero copy and the real portrait sit underneath it. The
  scroll morph is measured from the portrait's frame, so changing the copy or the
  portrait size does not break it. On screens under 981 px the morph is skipped
  and the welcome photo becomes the portrait (via `<picture>`).
- `<!-- ============ ABOUT ============ -->` — statement, facts column, four stat counters.
  Counter values live in `data-count` (and optional `data-suffix`).
- `<!-- ============ PROJECTS ============ -->` — two `.feature` articles (text + figure)
  and a `.more__grid` of three `.mini` cards. Each featured project links to its
  repository with `.repo-link`; each mini card is itself an `<a>` pointing at the repo.
  The figure panels use `data-media` with two tabs (the live animation and the
  static evidence); `data-interval` sets how long each tab holds, and the tabs
  only rotate while the figure is on screen.
- `<!-- ============ EXPERIENCE ============ -->` — one `<article class="xp">` per role,
  newest first.
- `<!-- ============ EDUCATION ============ -->` — one `.edu__row` per degree.
- `<!-- ============ AWARDS ============ -->` — publications and awards side by side.
- `<!-- ============ TOOLKIT ============ -->` — a `.stack` block. Each `.stack__item`
  lists its tools as logo slugs in `data-logos` (`python cmake docker …`); the dial
  draws one ring per item and one chip per slug. The slugs point at `<symbol id="lg-…">`
  entries in the inline icon sprite at the top of `<body>`; add a 24×24 symbol there
  to add a logo. `.stack__tag` is the count and `.stack__tools` is the expanded row.
- `<!-- ============ CONTACT ============ -->` — email, phone, GitHub, LinkedIn, location.

### Refreshing a project from GitHub

The cards are static HTML on purpose — no API calls, no rate limits, no layout
shift, and search engines can read them. To update one:

1. Copy the current figures from the repository (raw URLs work, e.g.
   `https://raw.githubusercontent.com/janaarundinesh/<repo>/main/<path>`).
2. Downscale to about 1600 px wide and save as JPEG in `assets/projects/`
   (on macOS: `sips -Z 1600 -s format jpeg -s formatOptions 90 in.png --out out.jpg`).
3. Update the matching `.feature` card: title, tags, bullet list, chips, `year`,
   `<img src>`, `width`/`height` and the caption. Keep the intrinsic size
   attributes accurate so the page does not jump while loading.

Figures sit on a warm paper plate and use `mix-blend-mode: multiply` so white
plot backgrounds blend into the plate. Keep that in mind if you swap in a
dark-background image — remove the blend mode for those.

The live thesis animation is drawn in `script.js` (the "FILTER2 sweep" block) —
no video, no GIF. The FHP thermal/velocity loop is `assets/projects/fhp-thermal.webp`,
generated from the repo's simulation output; the mini cards use small CSS/canvas
animations (filter pass, GPS ping).

Projects with no repository (the B.E. accident-detection system) use
`.mini--static` instead of a link.

To replace the portrait, export a new image at roughly a 4:5 ratio (1100 px tall
is plenty) to `assets/portrait.jpg`, and optionally a ~640 px wide version to
`assets/portrait-640.jpg`. Keep the `width`/`height` attributes on the `<img>`
in sync. The welcome photo is `assets/welcome.jpg` (any tall portrait crop works);
keep `assets/welcome-mobile.jpg` as its smaller copy.

### Turning on the contact form

The form posts to [Web3Forms](https://web3forms.com), a free service that emails
form submissions to you — no server needed.

1. Go to <https://web3forms.com>, enter the address you want messages sent to, and
   the access key arrives by email.
2. Put that key in the form's hidden field in `index.html`:
   `<input type="hidden" name="access_key" value="YOUR_KEY" data-mail-key />`
3. Submit the form once from the live site and check your inbox.

Until a key is present, the form is not dead: JavaScript opens the visitor's mail
app with the subject and message already filled in, addressed to you.

## Changing the look

All colours, fonts and spacing live in `:root` at the top of `styles.css`:

```css
--ink: #07080a;      /* page background */
--paper: #f4f1e8;    /* body text and figure plates */
--acid: #ccff00;     /* accent */
--display: "Archivo"; --body: "Inter"; --mono: "JetBrains Mono";
```

Fonts are loaded from Google Fonts in `<head>`. To go fully offline, download
the families and swap the `<link>` for local `@font-face` rules.

If you change the accent colour, also update the canvas trail colours in
`script.js` (`draw()`, the `rgba(204,255,0,…)` values).

## Deploying

It is a static site, so anything that serves files will do:

- **GitHub Pages** — push the folder, then Settings → Pages → deploy from branch,
  root directory.
- **Netlify / Vercel / Cloudflare Pages** — drag the folder in, or connect the repo
  with no build command and `.` as the publish directory.
- **Any web host** — upload `index.html`, `styles.css`, `script.js` and `assets/`
  to the same directory.

After you have a real URL, add it back to `<head>` for clean sharing:

```html
<link rel="canonical" href="https://your-domain.com/" />
<meta property="og:url" content="https://your-domain.com/" />
<meta property="og:image" content="https://your-domain.com/assets/portrait.jpg" />
```

## Notes

- The site works without JavaScript: the hero intro is pure CSS and the content
  is all in the HTML. Without JS you lose the canvas, welcome morph, reveal
  animations and counters, and the toolkit dial is hidden (the category list
  remains). The contact form falls back to a `mailto:` post.
- `prefers-reduced-motion` is respected, and `.reveal` elements are fully
  readable when motion is reduced.
- The phone number and email are intentionally public and clickable (`tel:` and
  `mailto:`). Remove them from the contact section if you'd rather not publish them.
- There is no analytics or third-party script beyond Google Fonts.
