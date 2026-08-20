# greenbar

Turn a GitHub avatar into an ASCII portrait and a ready-to-paste profile README.

**[Try it live → mustafasenses.dev/greenbar](https://mustafasenses.dev/greenbar/)**

Type a username, and greenbar pulls the avatar and the public profile, renders the
picture as monospace characters, and sets a neofetch-style detail panel next to it —
all inside one fenced code block, so GitHub draws no table borders around it.

```
               #%                     %#
              *    +#%%##########%#*    *
              :                         :       octocat@github -------------------------------------·-
              *                         +%      . Name: .................................. The Octocat
             +                            *     . Location: ............................ San Francisco
            +      .+***++:.-:++***+       #    . Company: .................................... github
            -   .*#%@@@%%%%%%%%%%%@@%#*    *    . Uptime: ................ 15 years, 6 months, 27 days
            +   #%%@###@%%%%%%%%@%##@%%*   #    . Languages: ............................... HTML, CSS
            #   #%%@***@%%%%%%%%@*+*@%%*  -%    . Last push: .............................. 2024-08-21
             #: +#%%@%@%%%%##%%%%@%@%%#+ :#
               #*:**##%%%%###%%%%%%##*-*#       Contact --------------------------------------------·-
           #*#%@@@%%###::++++++::####           . Website: ............................... github.blog
             *:*%@@@@@+          +
              #:::+*+:  *. **  *  #             GitHub Stats ---------------------------------------·-
                %####*  #. ** .#  #             . Repos: ................................ 8 | Gists: 8
                     #  #. **  #  #             . Stars: ....................... 20779 | Forks: 166365
                     * .#  **  #. *             . Followers: .................... 23717 | Following: 9
                   #***#*-*%%*-*#***#
                    %######%%######%
                     %##%######%###
```

Everything runs in the browser. No account, no token, no backend.

## Features

- **Three layouts** — portrait and details side by side, stacked, or portrait only.
- **Five character sets** — classic ramp, a detailed 60-glyph ramp, letters, digits, and
  half-block shading.
- **Two previews** — a printout view with the exact line height of a GitHub code block,
  and a GitHub view that renders the README the way your profile will.
- **Light and dark** targets, plus crop, tone and contrast controls.
- **Turkish and English interface.** The generated README is always English.
- Upload your own image instead of the avatar.

## How the portrait is made

Naive ASCII conversion — average a block of pixels, index into a hand-ordered ramp — is
what makes most avatars come out as mush. greenbar does a few things differently:

1. **Linear-light sampling.** Pixels are averaged in linear light, not gamma space, so
   dark areas keep their weight and the face does not turn to soup.
2. **Measured character ramps.** Every glyph is drawn into a cell and its ink coverage is
   measured, then the set is sorted by real density. A hand-ordered ramp bunches tones in
   the middle; a measured one spreads them evenly. This is also why any character set you
   pick — even digits — reproduces tone correctly.
3. **Adaptive masking.** Flat backdrops are flood-filled away, which is what makes logo
   avatars come out clean. Busy photographic backgrounds get a circle crop instead, since
   flood fill would eat into the subject.
4. **CLAHE.** Contrast-limited adaptive histogram equalisation, blended lightly with a
   global stretch: enough local range to bring out features, not so much that the
   silhouette dissolves.
5. **Automatic polarity.** The subject is drawn dense and the background left empty,
   whichever way the photo runs. A dark portrait against a bright wall otherwise reads as
   a hole rather than a face.

## Getting started

The [live version](https://mustafasenses.dev/greenbar/) is the same build this repo
produces. To run it yourself:

```bash
npm install
npm run dev
```

Then open the URL Vite prints. To produce a static build:

```bash
npm run build
npm run preview
```

The build lands in `dist/` and is plain static files — host it anywhere.

## Putting it on your profile

Create a public repository named exactly like your GitHub username, add a `README.md`,
and paste the output in. GitHub pins that file to the top of your profile.

## Deployment

Two workflows live in `.github/workflows`:

- **CI** builds every pull request, so a branch has to compile before it can be merged.
- **Deploy** runs on every push to `main`, including merged pull requests. It builds the
  site and publishes `dist/` to GitHub Pages.

To switch it on, go to *Settings → Pages* in the repository and set the source to
**GitHub Actions**. The first push to `main` after that will publish the site — which is
how <https://mustafasenses.dev/greenbar/> is served.

Assets are referenced relatively (`base: './'` in `vite.config.js`), so the build works
from a subpath as well as from a domain root.

## Project structure

```
src/
  ascii/          image → characters
    color.js      sRGB ↔ linear light, canvas pool
    sample.js     supersampled box filter down to the cell grid
    mask.js       circle crop, background flood fill, auto choice
    charsets.js   character sets and measured density ramps
    tone.js       levels, CLAHE, sharpening, brightness → ink
    index.js      character and half-block renderers
  readme/         characters → markdown
    panel.js      neofetch-style detail panel (English only)
    compose.js    side-by-side and stacked assembly
    markdown.js   README output and preview rendering
  github.js       profile and repository statistics
  i18n.js         interface copy, TR and EN
  main.js         state and DOM wiring
```

## Notes

- The GitHub API allows 60 unauthenticated requests per hour per IP, and each render uses
  two. If you hit the limit, wait it out or upload the image yourself.
- Avatars are read through a canvas, so they need CORS. If a browser blocks one, the file
  upload path always works.
- Half-block output relies on `▀ ▄ ░ ▒ ▓ █` being present and single-width in the reader's
  monospace font. Every other character set is plain ASCII.

## License

MIT
