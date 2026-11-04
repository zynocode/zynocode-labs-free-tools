# Changelog

Release notes for [Zynocode Labs](https://labs.zynocode.com). The full history is also at https://labs.zynocode.com/changelog.

## v2.17.2 — 2026-11-04

### Security

- Sign-in checks are now stricter: every session must belong to a signed-in device, and leftover testing exceptions have been removed from the sign-in code

## v2.17.1 — 2026-11-04

### Features

- Every account section now has its own page in the main menu: Profile, Security, Sessions, Notifications, Preferences, Workspace, Billing, API Keys, AI Integrations, Privacy & Data and Activity
- Security and Sessions are separate pages, so you can review signed-in devices without opening password and two-factor settings

### Fixes

- Removed the second tab menu inside the Account Center page that repeated the main menu
- Old account links, including those in earlier emails and notifications, still open the right page

## v2.17.0 — 2026-11-04

### Features

- Transfer ownership of a workspace to another member, with a full workspace overview
- Download a copy of your personal data from Account, protected by a fresh sign-in check
- API keys can now be limited to specific scopes, given an expiry date and rotated without downtime, and each key shows its own usage
- Get an email reminder before an API key expires
- Backup codes for two-factor authentication and a default workspace in your profile
- Projects and collections now open into their own detail pages

### Fixes

- Buttons that did nothing now work or have been removed
- The GitHub icon and Open Source card in the footer link to the public free-tools repository
- Long addresses on invoice PDFs now wrap instead of being cut off
- Your profile no longer exposes secret values to the page
- Fixed a database connection pool issue that could slow requests under load

### Security

- Removed an old two-factor route that is no longer needed
- Turned off verbose authentication debug logging in production

## v2.16.0 — 2026-11-02

### Breaking changes

- Everyone needs to sign in once again after this update

### Features

- Branded emails for your account, security and support activity, including welcome, password, two-factor and API key notices
- Support replies and status changes now reach you by email, and you can follow and reply to your tickets under My Tickets
- See every device signed in to your account and sign any of them out from Security
- Delete your account with a 30-day grace period during which you can change your mind
- Change your account email with verification of the new address
- Choose which emails you receive, with one-click unsubscribe for optional emails
- Add billing details with your GSTIN and download invoices as PDF
- Account, workspace settings, billing and support pages are all reachable from the menu, including on mobile

### Fixes

- Workspace Settings and Billing pages no longer show a 404
- Invoice amounts on the billing page display correctly
- Public contact addresses on the legal and support pages now point to contact@zynocode.com

### Security

- Signing out a device takes effect within 30 seconds on every server
- Suspended or banned accounts can no longer sign in
- Creating a support ticket requires signing in, and the ticket always uses your account email
- Changing your email requires your password and two-factor code, and your old address is alerted

## v2.15.5 — 2026-10-31

### Fixes

- Admins who turn on two-factor authentication during a session are sent to the admin verification step instead of looping back to account security
- The admin verification page now loads right after an admin signs in with two-factor authentication enabled

## v2.15.4 — 2026-10-31

### Fixes

- Top navigation no longer wraps or slides under the search button on laptop-width screens
- Notification badge no longer covers the bell icon
- After enabling two-factor authentication, admins go straight to admin verification

## v2.15.3 — 2026-10-31

### Fixes

- Two-factor setup now shows a working QR code and secret, and shows your backup codes after you confirm

## v2.15.2 — 2026-10-31

### Fixes

- Two-factor setup QR codes now scan in Google Authenticator and other strict authenticator apps

### Security

- New two-factor secrets use the standard 160-bit length

## v2.15.1 — 2026-10-31

### Fixes

- Password resets now always apply at sign-in

### Security

- Removed built-in demo accounts from sign-in; accounts are verified only against the database
- Signing up with an email that is already registered no longer changes that account

## v2.15.0 — 2026-10-31

### Features

- Support requests from the contact form now create a ticket with a reference number, and you get an email confirming we received it
- Image Resizer social media presets, plus 6 new pages for common social image sizes
- Every tool now has its own Open Graph preview image for link sharing

### Fixes

- Accessibility: every tool form field now has a linked label, sliders announce their value, and all inputs show a visible keyboard focus ring
- Image tool toggles (Compressor, Resizer, WebP Converter) can now be used with the keyboard
- Faster loading on guides and tool pages (smaller shared bundle, lighter mobile hero images)
- Cleaner home page hero

### Security

- Stronger account protection: two-factor step-up, hashed backup codes and rate limiting on failed logins
- Contact form protected against spam and abuse (honeypot, per-IP and per-email limits)
- Transactional email moved to a dedicated provider on a verified sending domain (send.zynocode.com) with DKIM

## v2.14.2 — 2026-10-28

### Fixes

- Build cleanup: removed unused lint directives and moved lint ignore rules into the ESLint config, so production builds run without warnings
- Privacy policy page now lists Cloudinary, which stores profile photos

## v2.14.1 — 2026-10-27

### Fixes

- Enterprise page no longer promises a 4-hour response SLA or 99.9% availability; Zynocode Labs has no contractual SLA during beta
- Pricing lists priority email support instead of 24/7 SLA support
- Case studies are labelled as example workflow architectures, not real-world customer stories
- Privacy policy and compliance page now list Cloudinary, which stores profile photos

## v2.14.0 — 2026-10-25

### Features

- Production-grade Security Architecture page (/security) with browser-vs-server boundaries, transport encryption, and responsible disclosure
- Factual Compliance Statement (/compliance) documenting operational practices, sub-processors, and zero unearned certification badges
- Open Source showcase (/developers/open-source) linking to public GitHub monorepo and published npm packages under MIT License
- Transparent Pricing page (/pricing) with clear Free Public Beta banner replacing temporary redirects
- Dedicated Help & Support Center (/support) and Frequently Asked Questions (/faq) with FAQPage schema

### Fixes

- Standardized platform versionEngine to return authoritative SITE_VERSION instead of legacy mock string
- Added permanent 301 redirects for legacy developer stubs to canonical resources

### Security

- Documented strict HSTS, TLS 1.3, and zero-plaintext API credential architecture

## v2.13.0 — 2026-10-25

### Features

- Internal linking architecture connecting 100% of tools with relevant in-depth guides
- Reciprocal linking connecting guides to related engineering research and articles on zynocode.com
- Semantic HTML main landmarks added across all pages for improved crawlability and accessibility

### Fixes

- Removed discontinued DishDash product references across marketing pages, sitemap, and llms.txt with permanent 301 redirects
- Eliminated legacy redirect hops in agent documentation routes

## v2.12.1 — 2026-10-25

### Features

- SDK and CLI source code published on GitHub (zynocode/zynocode-labs-free-tools), linked from the SDK and CLI docs
- @zynocode/sdk 2.0.2 and zynocode CLI 1.0.1 on npm, now linking to the public source repository

## v2.12.0 — 2026-10-25

### Features

- Developer documentation for the public Tool API and the @zynocode/sdk package
- MCP server guide with Claude Desktop, Cursor and VS Code setup
- Webhooks guide: events, payload and signature verification
- zynocode CLI published on npm (npm install -g zynocode) with a command reference

## v2.11.0 — 2026-10-25

### Features

- Request-a-tool form opens your email app with the request filled in

### Fixes

- Mobile layout: charts, currency selector, result numbers and labels fit small screens and large text sizes
- "New version available" no longer appears on a first visit
- Removed sample testimonials, uptime figures and certification claims that were not backed by real data
- Privacy pages list the services we actually use (Vercel, Neon, Razorpay, Cloudflare, Hugging Face, email provider)
- Unfinished pages are hidden from search until they have real content

### Security

- Webhook encryption no longer falls back to a built-in default key

## v2.10.0 — 2026-10-24

### Features

- 8 new guides: home loan prepayment, FD vs RD, GST on services, credit card interest, bcrypt vs Argon2 vs scrypt, JWT structure, UUID v4 vs v7, MD5 vs SHA-256
- UUID generator creates RFC 9562 UUID v7 (time-ordered) as well as v4
- Hash generator adds MD5, checked against the RFC 1321 test vectors
- JWT decoder shows exp / iat / nbf as dates with an expired / not-yet-valid badge

## v2.9.0 — 2026-10-24

### Features

- Photo and signature size pages for 10 exams, built from their official notices (UPSC, SSC CGL, NEET, JEE Main, IBPS, SBI PO, CUET, GATE, CTET, CAT)
- 17 finance pages: home, car and personal loan EMI, SIP for fixed monthly amounts, GST at 5%, 18% and 40%, SIP with inflation, home loan amortization

### Fixes

- Image compressor can now reach a minimum size (for example 10 KB) for small signatures by adding empty JPEG metadata, without changing the image

## v2.8.0 — 2026-10-23

### Features

- SEO title checker with pixel-width meter, SERP preview and bulk mode
- Footer links to popular tools, size pages and latest guides
- Quick answers on tool pages and an auto-generated llms.txt
- Bcrypt generate + verify on one page, passive voice rewrites, net worth templates for India and the US

### Fixes

- GST calculator updated to the GST 2.0 slabs (5%, 18%, 40%)

## v2.7.0 — 2026-10-23

### Features

- Author page and editorial policy

### Fixes

- JSON formatter no longer sends parts of your input in error reports

## v2.6.0 — 2026-10-23

### Features

- PDF compressor compresses to a target size (for example 100 KB or 200 KB) and never returns a bigger file

### Fixes

- PDF.js worker is served from our own domain

## v2.5.0 — 2026-10-23

### Features

- UTM builder with presets, bulk mode and history
- Base64-to-image, bcrypt verify and JSON validator pages

### Fixes

- More complete help content on image and PDF converters

## v2.4.0 — 2026-10-23

### Features

- How to calculate EMI guide
- Fuller help content on 13 tools

### Fixes

- Light-mode colours fixed; page titles and descriptions shortened to fit search results

## v2.3.0 — 2026-10-22

### Features

- ₹ / $ / € / £ currency selector on finance calculators
- Upgraded social media formatter, net worth calculator, duplicate word finder and list sorter

## v2.2.0 — 2026-10-22

### Features

- Upgraded Base64 encoder, image cropper and text cleaner

### Fixes

- Theme colours unified across upgraded tools

## v2.1.0 — 2026-10-22

### Features

- Image compressor compresses to an exact KB target, with size pages such as 20 KB, 50 KB and 100 KB
