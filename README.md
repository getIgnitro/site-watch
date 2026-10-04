# site-watch

Checks our sites every 5 minutes from GitHub. A DOWN site opens an issue labelled `down` and the run fails (GitHub emails the account); the issue closes itself when all sites are back. Edit sites.txt as `url|text that must appear`.
