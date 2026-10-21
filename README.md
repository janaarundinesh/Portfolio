# Arun Dinesh Jana — portfolio

A single-page, no-build portfolio: hand-written HTML, CSS and vanilla JavaScript.
Dark, high-contrast editorial layout with an acid-lime accent, a canvas flow
field in the hero, scroll-reveal sections, animated stat counters, a custom
cursor and a marquee ticker. A small GSAP/ScrollTrigger layer adds the cinematic
entrance, pinned project showcases and pointer tilt.

The page opens on a full-screen welcome: a spotlight portrait sits beside your
name, and as you scroll it slides right, shrinks into the photo window of a
hanging ID badge and dissolves into the headshot, while the intro copy fades in.
The badge can be flipped by clicking it. Below that, the experience cards open
in place, projects animate underneath them, the toolkit is a radial map of tool
logos, and the contact block has a working message form followed by bare icon
links to email, phone, GitHub and LinkedIn.

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
| `index.html` | All content and structure: hero, about, experience, projects, education, awards, toolkit, contact. |
| `styles.css` | The whole visual system — design tokens at the top, then sections, responsive rules, reduced-motion and print styles. |
| `script.js` | Hero canvas and the welcome→badge scroll morph, the ID badge flip, reveals, counters, mobile menu, the experience card accordion, custom cursor, magnetic buttons, the FILTER2 sweep animation, figure tabs, the toolkit logo dial, project-card glow, anchor scrolling and the contact form. |
| `motion.js` | Optional cinematic layer: GSAP entrance, section cues, the experience-card stagger, pinned showcases, scroll-driven figure scenes, pointer tilt. Safe to remove — the page falls back to its CSS motion. |
| `assets/vendor/` | Vendored `gsap.min.js` and `ScrollTrigger.min.js` (3.13.0), so the page loads no third-party script at runtime. |
| `assets/portrait.jpg` | 933 × 1100 web-optimised portrait (plus `portrait-640.jpg` for small screens). |
| `assets/welcome.jpg` | The full-body spotlight photo used on the welcome screen. |
| `assets/welcome-mobile.jpg` | Optional 900 px version of the welcome photo; the page no longer requests it. |
| `assets/Arun_Dinesh_Jana_CV.pdf` | The downloadable CV linked from the hero. |
| `assets/projects/` | Figures pulled from the GitHub repos: `thesis-runtime-5d.jpg`, `fhp-flow.jpg`, plus the derived animation frames `fhp-thermal.webp` and the filter stills in `assets/projects/filter-*.jpg`. |
| `screenshots/` | Reference captures of the finished layout. Safe to delete. |

## Editing content

Everything is plain text in `index.html`, in reading order. Search for the
section you want:

- `<!-- ============ WELCOME + HERO ============ -->` — the opening screen. `.welcome` holds
  the spotlight photo; the hero copy and the ID badge sit underneath it. The scroll
  morph targets `.hero__portrait-frame`, the photo window inside the badge, using
  the frame's on-screen centre, so the nested card and its tilt do not break it.
  `.hero__badge-flip` covers the card and toggles `.is-flipped`; the lanyard and
  clip are decorative siblings of the flipping card. On screens under 981 px the
  morph is skipped and the badge is the hero portrait on its own.
- `<!-- ============ ABOUT ============ -->` — statement, facts column, four stat counters.
  Counter values live in `data-count` (and optional `data-suffix`).
- `<!-- ============ EXPERIENCE ============ -->` — one `<article class="xp-card">` per role,
  newest first. The left half is a decorative CSS scene (a road with a car and its
  sensor cone, a terminal, a marketplace grid, a turbine) and the right half holds
  the title and the toggle. Each card's detail block
  has an `id` matched by the toggle's `aria-controls`; the toggle's `[data-xp-label]`
  text is swapped between "Details" and "Close" in `script.js`. Hovering previews a
  card, clicking pins it open, Escape closes it.
- `<!-- ============ PROJECTS ============ -->` — two `.feature` articles (text + figure)
  and a `.more__grid` of three `.mini` cards. Each featured project links to its
  repository with `.repo-link`; each mini card is itself an `<a>` pointing at the repo.
  The figure panels use `data-media` with two tabs (the live animation and the
  static evidence); `data-interval` sets how long each tab holds, and the tabs
  only rotate while the figure is on screen.
- `<!-- ============ EDUCATION ============ -->` — one `.edu__row` per degree.
- `<!-- ============ AWARDS ============ -->` — publications and awards side by side.
- `<!-- ============ TOOLKIT ============ -->` — a `.stack` block. Each `.stack__item`
  lists its tools as logo slugs in `data-logos` (`python cmake docker …`); the dial
  draws one ring per item and one chip per slug. The slugs point at `<symbol id="lg-…">`
  entries in the inline icon sprite at the top of `<body>`; add a 24×24 symbol there
  to add a logo. `.stack__tag` is the count and `.stack__tools` is the expanded row.
- `<!-- ============ CONTACT ============ -->` — the message form (headed "Get in
  touch") plus four bare icon links — email, phone, GitHub, LinkedIn — centred
  above the closing marquee and built from the sprite symbols. The
  headline's `.line` elements are masks; keep the inner `<span>` so the outline
  style and the masked rise continue to work.

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
in sync. The badge crops the photo to a 4:5 window, so keep the face centred near
the top. The welcome photo is `assets/welcome.jpg` (any tall portrait crop works).

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

## Motion

`motion.js` is a separate, optional layer on top of `script.js`, built with
GSAP 3.13 and ScrollTrigger (vendored in `assets/vendor/`, so the page makes no
third-party requests). It loads with `defer` after the base script.

- **Hero entrance** — the name lines lift out of their masks in sequence, the
  eyebrow and nav settle, and the spotlight photo wipes open from the top. On
  phones, where the welcome morph is not used, the portrait and lede join the
  same stagger.
- **Section cues** — each `.section__head` arrives as one beat: the number, the
  title, then the rule drawing across with a short acid glow that burns off.
- **Showcases** — on screens at least 981 px wide and 780 px tall, each
  `.feature` pins at a centred stage while its figure settles and switches from
  the live animation to the static evidence at the halfway point. A card has to
  fit the viewport; if it does not, it gets the unpinned treatment. Below those
  sizes the figure still zooms and changes scene as it crosses the screen, with
  no pin.
- **Cards** — the mini cards and project figures tilt a few degrees toward the
  pointer, and project images zoom slightly on hover.
- **Closing** — the contact headline masks up and the form settles in.

The section cues and the closing headline are fired by `IntersectionObserver`,
not ScrollTrigger. Pinning adds height to the document while ScrollTrigger is
measuring, so a trigger created before the pins can keep a stale start position;
the observer always reads the element's live box.

The figure tabs still belong to `script.js`. The motion layer only asks for a
scene through `portfolio:scene` events and holds autoplay with `portfolio:hold`
while scroll is in charge. Clicking a tab yourself always wins.

Tuning lives in `motion.js`: `PIN_MARGIN`, the `+=72%` pin length, the
`center center` stage start and the tilt maxima in the two `attachTilt` calls.
The pinned stage centres itself, so changes to the nav height need no offset.

Motion is never required:

- `prefers-reduced-motion: reduce` skips the layer entirely — no tweens, pins or
  tilt are created, and the CSS entrance still runs.
- If GSAP or ScrollTrigger is missing, `motion.js` releases the hero immediately
  and the original CSS entrance takes over.
- The small `<script>` in `<head>` only arms `motion-pending` when motion is
  welcome, and removes it after 2.5 s even if the layer never loads.
- Without JavaScript nothing is hidden: section headings are plain text and all
  content stays in the HTML.

Smooth anchor scrolling lives in `script.js` rather than
`html { scroll-behavior: smooth }`, because ScrollTrigger has to measure pins on
a document that is not animating its own scroll position. Anchors still glide,
and reduced-motion visitors jump straight there.

GSAP is used under its standard licence; the minified files are checked in so
the site stays a no-build static page.

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
`script.js` (`draw()`, the `rgba(204,255,0,…)` values) and the glow colours in
`motion.js` (the section rule and showcase `boxShadow` strings).

## Deploying

It is a static site, so anything that serves files will do:

- **GitHub Pages** — push the folder, then Settings → Pages → deploy from branch,
  root directory.
- **Netlify / Vercel / Cloudflare Pages** — drag the folder in, or connect the repo
  with no build command and `.` as the publish directory.
- **Any web host** — upload `index.html`, `styles.css`, `script.js`, `motion.js`
  and `assets/` (including `assets/vendor/`) to the same directory.

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
- `prefers-reduced-motion` is respected: the motion layer is skipped entirely
  (no tweens, pins or tilt), the CSS entrance runs, and `.reveal` elements are
  fully readable.
- The phone number and email are intentionally public and clickable (`tel:` and
  `mailto:`). Remove them from the contact section if you'd rather not publish them.
- There is no analytics and no third-party script at runtime beyond Google
  Fonts. GSAP is vendored locally in `assets/vendor/`.
