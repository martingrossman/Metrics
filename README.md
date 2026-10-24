# CMatrixLab

An interactive explanation of how decision threshold, class separation, and
positive-class prevalence affect classifier metrics. Open `index.html` in a
browser; the demo has no build step or runtime dependencies.

The complete demo lives in `index.html`, with its styles and JavaScript together.
It opens directly without a redirect. `CNAME` configures the custom domain for
GitHub Pages.

Drag the blue threshold line in the first graph with a mouse or finger, or use
the matching slider. You can also focus the graph and use the arrow keys.

Use **Try an example** to choose Medical test, Car braking, Spam filter, Fraud
detection, or Generic ML. The medical example opens first. Use the existing 10%
and 50% population buttons to compare class balance within the same example.
Editing a slider marks the selection as Custom while keeping the current example
context. Reset returns to the medical example with a 50/50 population.

Hover over a metric or tap it on your phone to see its calculation in both
graphs. A solid outline marks the numerator; a dashed outline marks the total
it is divided by. Tap the same metric again to clear it. Keyboard users can
focus a metric, press Enter to keep its explanation visible, and Escape to clear.

The **Learn more** entry points are temporarily removed from the main page.
The complete learning view remains in `learn.html` for later work. Open that file
directly to use its Basics, Formulas, Bayes, and Trade-offs tabs. Its **Simulator**
link returns to the main page. The cheatsheet and reference remain linked from
the simulator.

## Model

The demo represents 1,000 weighted cases using two fixed distributions of 50 deterministic
score samples. Positive portion changes their weights, preserving TPR and FPR
at a given threshold and separation. Precision changes with the weighted
balance of correct detections and false alarms. Counts can be fractional.

Each full marker represents 10 cases, with a smaller marker for any remainder.
Marker area is proportional to its case count. Both charts use the same
representative scores and counts; matching dots and squares highlight on hover.
At 0% or 100% positive portion, a rate with no actual cases is shown as `N/A`.
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
The server listens on all IPv4 network adapters and serves only `index.html`.
This shares the demo locally while your computer is running.

To use another port:

```sh
npm run serve -- --port 8081
```

On Windows PowerShell, if script execution blocks `npm`, use `npm.cmd` in
these commands (for example, `npm.cmd run serve`).

After saving an edit to `index.html`, refresh the page on your iPhone to
see it. The server reads the file again on every request, so it can stay running.

## Checks

With Node.js and npm installed:

```sh
npm ci
npx playwright install chromium
npx playwright install webkit
npm test
```

Checks cover the local server, weighted counts, prevalence invariance, threshold extremes,
perfect separation, slider/reset behavior, linked hover, and responsive layout.
Development dependencies are only needed for these checks.
