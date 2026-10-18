# CMatrixLab

An interactive explanation of how decision threshold, class separation, and
positive-class prevalence affect classifier metrics. Open `index.html` in a
browser; the demo has no build step or runtime dependencies.

The Simple view lives in `cmatrixlab_minimal_readable.html`, with its styles
and JavaScript together. `index.html` forwards to it. `CNAME` configures the
custom domain for GitHub Pages.

## Model

The demo represents 100 cases using two fixed distributions of 50 deterministic
score samples. Positive share changes their weights, preserving TPR and FPR
at a given threshold and separation. Precision changes with the weighted
balance of correct detections and false alarms. Counts can be fractional.

Each chart renders one marker per whole case plus a smaller marker for a
fractional remainder. Matching dots and squares highlight together on hover.
At 0% or 100% positive share, a rate with no actual cases is shown as `N/A`.
Precision is `N/A` when there are no positive predictions.

See [the code guide](CMatrixLab_CODE_GUIDE.md) for editing details.

## Share over local Wi-Fi

Install Node.js, connect this computer and your phone or other device to the
same Wi-Fi, then run this command from the repository folder:

```sh
npm run serve
```

No dependency installation is needed for serving. The terminal prints a
`Same Wi-Fi` address such as `http://192.168.1.25:8080/`. Open that address in
the other device's browser. If several addresses appear, use the one for your
Wi-Fi adapter. Keep the terminal open; press **Ctrl+C** to stop sharing.

If Windows asks about firewall access, allow Node.js on your **private** home
network. If the other device cannot connect, check that both devices use the
same network; guest Wi-Fi or a VPN may prevent device-to-device connections.
The server listens on all IPv4 network adapters and serves only the two demo
HTML pages. This shares the demo locally while your computer is running.

To use another port:

```sh
npm run serve -- --port 8081
```

On Windows PowerShell, if script execution blocks `npm`, use `npm.cmd` in
these commands (for example, `npm.cmd run serve`).

## Checks

With Node.js and npm installed:

```sh
npm ci
npx playwright install chromium
npm test
```

Checks cover the local server, weighted counts, prevalence invariance, threshold extremes,
perfect separation, slider/reset behavior, linked hover, and responsive layout.
Development dependencies are only needed for these checks.
