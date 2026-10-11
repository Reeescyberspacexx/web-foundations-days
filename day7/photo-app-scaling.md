# SnapShare Scaling Plan

SnapShare is a photo-sharing app where users upload photos and scroll a feed of photos from people they follow.

## Assumptions

- 10,000,000 registered users.
- 10% are active each day, so there are **1,000,000 daily active users (DAU)**.
- Each active user uploads 1 photo per day.
- Each active user views 50 feed pages per day.
- An average photo is 2 MB, and each photo also gets a 50 KB thumbnail.
- One day is rounded to 100,000 seconds.
- Peak traffic is 5 times the average.

## Estimates

**Uploads**

- 1,000,000 users x 1 photo = 1,000,000 uploads per day.
- 1,000,000 / 100,000 = **10 uploads per second** on average.
- Peak: 10 x 5 = **50 uploads per second**.

**Feed views**

- 1,000,000 users x 50 views = 50,000,000 feed views per day.
- 50,000,000 / 100,000 = **500 feed views per second** on average.
- Peak: 500 x 5 = **2,500 feed views per second**.

**Storage per year**

- One photo plus its thumbnail: 2 MB + 50 KB = 2.05 MB.
- 1,000,000 x 2.05 MB = about 2.05 TB per day.
- 2.05 TB x 365 = about **750 TB per year**.

## Read-heavy or write-heavy?

The system is **read-heavy**. There are 500 feed views per second but only 10 uploads per second, a ratio of 50 to 1. This means the design should focus on making reads fast and cheap:

- Cache feeds so most reads never reach the database.
- Serve photos and thumbnails from a CDN.
- Use read replicas so reads are spread across several database copies.

Writes are few, so a single primary database can handle them.

## Why photos do not go in the database

Photos are large files (2 MB each), and storing about 750 TB a year inside a database would make it huge, slow to back up and slow to replicate. Databases are built for small, structured rows, not for serving big files. Photos belong in **object storage** (such as Amazon S3), which is cheap, very durable and scales almost without limit. The database stores only the photo's metadata (owner, caption, time) and a link to the file in object storage.

## Architecture diagram

```text
                    ┌─────────┐
        ┌──────────>│   DNS   │
        │           └─────────┘
 ┌──────┴───────┐   photos & thumbnails   ┌─────────────────────┐
 │ Browser /    │ ──────────────────────> │ CDN                 │
 │ mobile app   │                         │ (static files,      │
 └──────┬───────┘                         │  photos, thumbs)    │
        │ API calls (HTTPS, JSON)         └──────────┬──────────┘
        v                                            │ cache miss
 ┌───────────────┐                                   v
 │ Load balancer │                         ┌─────────────────────┐
 └──────┬────────┘                         │ Object storage      │
   ┌────┴─────┬──────────┐                 │ (original photos +  │
   v          v          v                 │  thumbnails)        │
┌───────┐ ┌───────┐ ┌───────┐              └──────────▲──────────┘
│ App 1 │ │ App 2 │ │ App 3 │ ───────────────────────┤ upload original
└───┬───┘ └───┬───┘ └───┬───┘                        │
    │         │         │                            │
    │         │         └──────> ┌───────┐  job   ┌──┴─────┐
    │         │                  │ Queue │ ─────> │ Worker │ makes thumbnail
    │         v                  └───────┘        └────────┘
    │   ┌───────────────┐
    │   │ Cache (Redis) │ feeds, hot data
    │   └───────────────┘
    │ writes             reads
    v                      v
┌─────────────┐  copy  ┌──────────────┐
│ Primary DB  │ ─────> │ Read replica │
└─────────────┘        └──────────────┘
```

## What each component does

- **DNS:** turns snapshare.com into the IP addresses of the CDN and load balancer, so users can find the app.
- **CDN:** serves photos, thumbnails and the front-end files from a server near the user, which reduces latency and takes load off our servers.
- **Load balancer:** spreads requests across the app servers and stops sending traffic to any server that fails a health check.
- **App servers:** run the API code (login, feed, upload) and are stateless, so we can add more when traffic grows.
- **Cache (Redis):** keeps recent feeds in memory so the 500 to 2,500 feed requests per second rarely touch the database.
- **Primary database:** stores users, follows and photo metadata, and is the only place that accepts writes.
- **Read replica:** holds a copy of the primary and answers read queries, so reads do not slow down writes.
- **Object storage:** stores the large photo and thumbnail files cheaply and durably, which would overload a database.
- **Queue:** holds thumbnail jobs so the upload request can finish immediately instead of waiting.
- **Worker:** takes jobs from the queue and creates the 50 KB thumbnails in the background.

## Upload flow

1. The user picks a photo and the app sends it to the API through the load balancer.
2. The load balancer forwards the request to a healthy app server.
3. The app server checks the login token and validates the file (type and size).
4. The app server saves the original 2 MB photo in object storage.
5. The app server writes a row to the primary database with the owner, time, the photo's storage link and a status of "processing".
6. The app server adds a "create thumbnail" job to the queue.
7. The app server deletes the cached feeds that should show the new photo, then replies **201 Created** to the user.
8. A worker takes the job from the queue, reads the original from object storage, creates a 50 KB thumbnail and saves it in object storage.
9. The worker updates the database row to "ready", with the thumbnail link.
10. Followers' feeds now include the photo, and the CDN serves the thumbnail from a nearby edge server.

## Trade-offs

- **Speed versus freshness:** caching feeds and using read replicas makes reads fast, but a follower may see a new photo a few seconds late because of cache expiry and replication lag. For a photo feed this delay is acceptable.
- **Fast uploads versus instant thumbnails:** using a queue lets the upload finish quickly, but the thumbnail is created a moment later, so the photo may briefly show a placeholder. The user gets a fast response in exchange.
- **Simplicity versus scalability:** adding a CDN, cache, replica, queue and workers makes the system much harder to build and run than one server, but one server could not handle 2,500 feed views per second or 750 TB of storage.
- **Cost versus reliability:** extra app servers, replicas and storage copies cost more money, but they remove single points of failure and keep the app running if one part breaks.
