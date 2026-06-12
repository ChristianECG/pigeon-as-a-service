# RFC 1149 — Reference Implementation

This repository contains the reference implementation for IP over Avian Carriers (IPoAC), conforming to the protocol stack defined by [RFC 1149], [RFC 2549], [RFC 6214], and [draft-cruzgonzalez-ipoac-dns].

---

## Protocol Family

### RFC 1149 — A Standard for the Transmission of IP Datagrams on Avian Carriers (1990)

[RFC 1149] established the foundational framework for the encapsulation and transmission of IP datagrams using homing pigeons as the physical layer. Key parameters are as follows:

- **Maximum Segment Size:** 256 milligrams
- **MTU:** Constrained by leg-band capacity and the Carrier's tolerance for paper
- **Error detection:** Visual inspection of the Carrier upon arrival
- **Broadcast:** Operationally feasible; results in a flock

The document is formally classified as Experimental. Its experimental status has not prevented production deployments.

### RFC 2549 — IP over Avian Carriers with Quality of Service (1999)

[RFC 2549] extended RFC 1149 with differentiated services for avian transport. Priority traffic MAY be carried by faster species (swifts, peregrines); bulk traffic SHOULD be assigned to slower, more economical birds. The document introduces QoS markings applied via colored leg bands and defines a precedence field interpreted by the Carrier's trained flight behavior.

Implementors are cautioned that QoS guarantees are bounded by atmospheric conditions and the Carrier's discretion.

### Bergen, Norway — Real-World Implementation (2001)

On 28 April 2001, the Bergen Linux User Group conducted the first known conformant implementation of RFC 1149. Nine packets were dispatched. Observed metrics:

| Metric | Value |
|--------|-------|
| Packets sent | 9 |
| Packets received | 4 |
| Packet loss | 55% |
| Round-trip time (min) | 3,211 s |
| Round-trip time (max) | 6,388 s |

The surviving Carriers achieved effective throughput exceeding the local ADSL connection at the time of the experiment. This result has not been replicated under controlled conditions.

### RFC 6214 — Adaptation of RFC 1149 for IPv6 (2011)

[RFC 6214] updates RFC 1149 for operation over IPv6. The expanded 128-bit address space requires proportionally larger leg bands. The document notes that the increased header size may necessitate Carriers of greater physical capacity and recommends against deploying IPv6-over-avian-carriers in environments with active raptor populations, where larger Carriers present a higher interception surface.

TTL values SHOULD NOT exceed the expected biological lifespan of the Carrier. Values above 15 years are NOT RECOMMENDED.

### draft-cruzgonzalez-ipoac-dns — DNS over Avian Carriers (DoAC)

[draft-cruzgonzalez-ipoac-dns] closes the final gap in the IPoAC stack: hostname resolution. Prior to this document, operators were required to hardcode destination IP addresses directly onto the Carrier — a practice that does not scale and is widely considered inelegant.

DoAC introduces:

- **The AA resource record** — encodes a Loft's physical address (latitude, longitude, heading, altitude band) in a format suitable for Carrier navigation
- **The Pigeon of Last Resort (PoLR)** — a pre-trained Carrier held in reserve to bootstrap resolver discovery when no prior DNS state exists
- **Retransmission behavior** — a minimum retransmission interval of 72 hours, with seasonal jitter; retransmission limit of 1
- **NXPIGEON** — the negative response code returned when a Carrier fails to arrive within the expected transmission window
- **Security considerations** — including Hawk-in-the-Middle (HitM) attacks, pigeon spoofing, loft hijacking, Denial of Flight (DoF), and the Hungry Cat as a physical layer threat

The draft is currently an Internet-Draft submitted to the IETF. It expires 10 December 2026 or upon the loss of the last known PoLR, whichever occurs first.

---

## This Implementation

This application provides a web interface for operating an IPoAC node. Operators may establish a Loft at a physical location, dispatch Carriers to remote Lofts, and track in-flight datagrams in real time.

**Flight physics** are computed from open meteorological data ([Open-Meteo](https://open-meteo.com)). Carrier speed is modeled at a 50 km/h cruise with wind adjustments derived from three waypoints sampled along the great-circle route. Rest stops accrue at one hour per six hours of flight. A flat 5% probability of carrier loss per transmission is applied; failure cause is selected from the RFC §11 threat taxonomy.

Carrier position is not persisted. It is computed on demand via great-circle interpolation over the elapsed fraction of the flight window.

### Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Database | SQLite via better-sqlite3 |
| Live updates | Server-Sent Events |
| Maps | MapLibre GL / react-map-gl |
| i18n | next-intl (en, es, lat) |
| Styling | Tailwind CSS v4 |

### Running locally

```sh
pnpm install
pnpm dev
```

Open `http://localhost:3000`. Claim a Loft, share your coordinates, and await delivery.

### Deploying to a VPS

The app requires a persistent filesystem (SQLite via `better-sqlite3`) and is **not compatible with serverless platforms** (Vercel Functions, AWS Lambda, etc.).

```sh
pnpm install
pnpm build

# The data/ directory is created automatically on first run.
# Ensure the process has write access to the working directory.
pnpm start
```

For production, run behind a reverse proxy (nginx, Caddy) that sets `X-Forwarded-For` — the rate limiter uses this header to identify clients. The rate limit store is in-memory and resets on restart.

A minimal systemd unit:

```ini
[Unit]
Description=Via Pluma
After=network.target

[Service]
WorkingDirectory=/opt/viapluma
ExecStart=/usr/bin/node .next/standalone/server.js
Restart=always
Environment=NODE_ENV=production PORT=3000

[Install]
WantedBy=multi-user.target
```

---

## References

- [RFC 1149](https://www.rfc-editor.org/info/rfc1149) — D. Waitzman, 1990
- [RFC 2549](https://www.rfc-editor.org/info/rfc2549) — D. Waitzman, 1999
- [RFC 6214](https://www.rfc-editor.org/info/rfc6214) — B. Carpenter, R. Hinden, 2011
- [draft-cruzgonzalez-ipoac-dns](https://datatracker.ietf.org/doc/draft-cruzgonzalez-ipoac-dns/) — C. E. Cruz González, 2026
