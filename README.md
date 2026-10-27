# Mini Juice Shop

A tiny, **intentionally vulnerable** Node.js shop modelled on [OWASP Juice Shop](https://github.com/juice-shop/juice-shop), built for Snyk remediation-agent training. It has no database and no native modules, so install takes ~25s and the whole test suite runs in about a second.

> Do not deploy this anywhere. The dependencies are deliberately outdated.

## Quick start

```bash
npm install
npm test        # 28 tests, all green on the untouched repo
npm start       # http://localhost:3000
```

Requires Node 18+ (tested on 26).

## What's in it

Every direct dependency is pinned to an old, vulnerable version and is actually used by a route, so upgrading it can break real behaviour that the tests catch.

| Area | Routes | Dependencies exercised |
| --- | --- | --- |
| Products | `/rest/products/search`, `/categories` | lodash, underscore, moment |
| Auth | `/rest/user/login`, `/whoami` | jsonwebtoken, express-jwt, crypto-js, validator |
| Feedback | `/api/feedbacks` | marked |
| Orders | `/rest/orders/:id/receipt`, `/email`, `/notify`, `/import-xml` | ejs, handlebars, nodemailer, xml2js, xmldom |
| Profile | `/api/profile/*` | pug, hoek, dot-prop, sanitize-html |
| Files | `/file-upload`, `/profile/image-upload`, `/rest/backup/inspect`, `/ftp/backup.tgz` | multer, express-fileupload, adm-zip, tar |
| Network | `/rest/proxy/image`, `/rest/webhook/test`, `/rest/exchange-rate`, `/ws/orders` | request, axios, node-fetch, ws |
| Admin | `/rest/admin/config/yaml`, `/config/ini`, `/state`, `/coupon`, `/health` | js-yaml, ini, serialize-javascript, node-forge, shelljs |
| Front end | `/`, `/vendor/*` | jquery, bootstrap |
| CLI | `server.js --port` | minimist |

## Goal for participants

Fork this repo, run the remediation agent against your fork, and get the open source vulnerabilities fixed **without breaking `npm test`**.
