# syskit

A collection of system and developer utilities built as a fast, lightweight web app. No backend, no tracking — everything runs in the browser.

**Live:** [syskit.atsiom.com](https://syskit.atsiom.com)

---

## Tools

| Tool | Description |
|---|---|
| **chmod** | Calculate Unix file permission bits with octal and symbolic output |
| **crontab** | Build and validate cron expressions with a human-readable schedule preview |
| **CIDR** | Subnet calculator — usable hosts, network/broadcast address, address range |
| **RAID** | Compute usable capacity, fault tolerance, and efficiency for common RAID levels |
| **sed** | Generate sed substitution and deletion commands interactively |
| **awk** | Build awk one-liners for field extraction and pattern filtering |
| **IP info** | Look up geolocation and ASN info for any IP address |
| **nslookup** | Query DNS records (A, AAAA, MX, TXT, NS, CNAME) via DNS-over-HTTPS |
| **epoch** | Convert Unix timestamps to human-readable time and vice versa |
| **DNS prop** | Check DNS propagation across multiple global resolvers |
| **URL encode** | Percent-encode and decode URLs |
| **Base64** | Encode and decode Base64 strings with full Unicode support |
| **regex** | Test regular expressions with live match highlighting and group details |

---

## Development

**Prerequisites:** Node.js 18+

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview
```

---

## Deployment

The app deploys automatically to GitHub Pages on every push to `main` via GitHub Actions.

To deploy manually:

```bash
npm run gh-deploy
```

This builds the app and pushes the `dist/` directory to the `gh-pages` branch.

---

## Tech Stack

- [React 18](https://react.dev)
- [Vite 5](https://vitejs.dev)
- DNS-over-HTTPS (DoH) for all DNS queries — no server needed

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

*This app was built with [Claude Code](https://claude.ai/code). This README was also generated with Claude Code.*
