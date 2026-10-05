# deploy

Files placed here as `<site>/<path>` are picked up by the agent on the web server within about 10 minutes and put live
at that path on that site. Static web files only (no PHP, no .htaccess), each checked against its SHA-256. Nothing is
ever deleted from a site, and a file is applied once. `manifest.json` is written by the workflow, never by hand.
