# Brand Pulse Creatives | private demo

1. Extract the entire ZIP.
2. Open `site/index.html` for a desktop walkthrough.
3. On Windows, double-click `START-PHONE-PREVIEW.cmd`. On other systems, run `node start.mjs --lan` in this folder. This uses Node.js. Open the printed phone URL with both devices on the same private Wi-Fi. Stop with Ctrl+C.
4. For a desktop-only server, run `node start.mjs` and open the desktop URL it prints.

Select **Design a sign** from the homepage. Try the shopfront and reception presets, or choose a JPG, PNG or WebP photo from your device. Change the lettering, then choose **Continue to checkout**. The design can also prefill the estimate form. Order signs in the navigation opens checkout directly.

UPI, card and bank transfer are demo choices. The displayed prices are examples and the demo charge is ₹0. Leads, the latest demo order and a resized preview of the selected photo stay in the browser tab when session storage is available. Downloading the mockup saves a PNG to your device.

See `OWNER-HANDOFF.md` for the presentation script and launch requirements. Edit `src/` and `build.mjs`, then run `node build.mjs`. The output is in `site/`.
