# greenbar

Turn a GitHub avatar into an ASCII portrait and a ready-to-paste profile README.

**[Try it live → mustafasenses.dev/greenbar](https://mustafasenses.dev/greenbar/)**

Type a username, and greenbar pulls the avatar and the public profile, renders the
picture as monospace characters, and sets a neofetch-style detail panel next to it.

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
- **You decide what gets published.** Every panel row is a checkbox: untick your location
  or email and it disappears from the block — and from the links underneath it. Labels and
  values are editable, and you can add rows of your own to any section.
- **Two previews** — a printout view with the exact line height of a GitHub code block,
  and a GitHub view that renders the README the way your profile will.
- **Light and dark** targets, plus crop, tone and contrast controls.
- **Turkish and English interface.** The generated README is always English.
- Upload your own image instead of the avatar.

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

## Putting it on your profile

Create a public repository named exactly like your GitHub username, add a `README.md`,
and paste the output in. GitHub pins that file to the top of your profile.

## Deployment

Two workflows live in `.github/workflows`:

- **CI** builds every pull request.
- **Deploy** publishes `dist/` to GitHub Pages on every push to `main`.

To switch it on, go to *Settings → Pages* in the repository and set the source to
**GitHub Actions**.

## License

MIT
