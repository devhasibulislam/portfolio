# Hasibul Islam

Senior Full-Stack Engineer  
[devhasibulislam@gmail.com](mailto:devhasibulislam@gmail.com)  |  [linkedin.com/in/devhasibulislam](http://linkedin.com/in/devhasibulislam)  |  [github.com/devhasibulislam](http://github.com/devhasibulislam)  
[\+8801906315901](tel:8801906315901)  |  [devhasibulislam.vercel.app](https://devhasibulislam.vercel.app)  |  [Dhaka, Bangladesh](https://maps.app.goo.gl/PSmi1bjDWFFVaU9t6)

# Professional Summary

Senior full-stack engineer with 7+ years shipping production Node.js, NestJS, and TypeScript systems for messaging, real-estate, CRM, ERP, e-commerce, and social-media SaaS. Most of my career has been remote and contract work with international teams (Israel, Italy, Algeria, Saudi Arabia, Bangladesh). Recent win: cut a hot-path list API from \~200ms to \~20ms with compound indexing, single-join rewrites, cache-aside, and DTO projection, rebuilt as a public reference at [api-latency-case-study](https://github.com/devhasibulislam/api-latency-case-study). Own delivery end to end: schema, API, background workers, Docker/AWS, CI/CD, and observability. Fold LLM \+ RAG, MCP, Agentic Skills features into real user-facing paths without the demo-project feel.

# Technical Skills

- **Languages:** TypeScript, JavaScript (ES6+), Python, SQL  
- **Backend:** NestJS (microservices, CQRS, guards, interceptors, Passport), Express, Node.js, REST, GraphQL (Apollo Federation), WebSockets (Socket.io)  
- **Database:** MySQL, SQLite, PostgreSQL (including Row-Level Security), MongoDB, MySQL, Redis, PGVector, TypeORM, Prisma, Mongoose  
- **Messaging & async:** Apache Kafka, RabbitMQ, BullMQ, Redis Pub/Sub, event-driven architecture, cron and worker patterns, idempotency \+ retry \+ DLQ  
- **Cloud & DevOps:** AWS (EC2, S3, Lambda), Docker, GitHub Actions, Nginx, Cloudflare  
- **AI & LLM:** OpenAI, Anthropic Claude, DeepSeek, LangChain, RAG pipelines, vector embeddings, MCP servers, function calling. Daily use of coding-agent tooling (Claude Code, Cursor & GitHub Copilot) for scaffolding, refactoring, and code review  
- **Testing & performance:** Jest, Supertest, autocannon, k6, Postman  
- **Integrations:** Stripe, SSLCommerz, Twilio, WhatsApp Business & Cloud API, Meta Graph API (Facebook / Instagram / Threads), Shopify, WooCommerce, Calendly  
- **Security & practice:** JWT, OAuth, RBAC, GDPR/CCPA, TDD, Agile/Scrum, observability (Sentry, Prometheus, OpenTelemetry, CloudWatch)  
- **Frontend:** React.js, Next.js, Redux Toolkit, RTK Query, Tailwind, MUI, Shadcn, GSAP  
- **Working knowledge** (used less, self-taught from docs, or comfortable picking up on-the-job) CockroachDB, Cassandra; AWS RDS, CloudFront, Route53, SES, SQS, ECS; Three.js;

# Professional Experience

## ZMC Technologies Limited

## Banani, Dhaka (On-Site) \- September 2025 to Present

**Live**: [Website](https://zmctechnologies.com/)  |  [Aungsha](https://aungsha.com/)

**Sr. Backend Architect \- March 2026 to Present**

- Own backend architecture and technical delivery across ZMC's three-product SaaS roadmap: a real-estate **ERP**, property-focused **CRM**, and a **PropTech** trading **platform**.  
- **Cut hot-path list API p95 from \~200 ms to \~20 ms** via compound indexing on (tenant\_id, created\_at), single-join query rewrites replacing N+1 populate, Redis cache-aside on hot pages, and DTO projection with class-transformer. Reproducible public reference with autocannon benchmarks and green CI: [api-latency-case-study](https://github.com/devhasibulislam/api-latency-case-study).  
- Standardised multi-tenant isolation across products with Postgres **Row-Level Security**, moving the boundary from application code to the database. Public reference with 8 integration tests that actively try to leak data across tenants: [nestjs-multitenant-starter](https://github.com/devhasibulislam/nestjs-multitenant-starter).  
- Introduced pgvector-backed semantic search for internal tooling, powered by OpenAI and Anthropic Claude via RAG.  
- Own the full deployment path end to end: **staging on VPS, production on cloud**, **GitHub Actions CI/CD** across both, and observability from application to infrastructure.  
- Partner with executive leadership on architecture decisions and contribute technical scoping to pre-sales.

**Sr. Software Engineer, Backend \- September 2025 to March 2026**

- Sole backend engineer on the three-product roadmap; owned schema design, API surface, background workers, and infrastructure across every engagement, working alongside one frontend and one mobile engineer.  
- Architected NestJS microservices over Kafka and RabbitMQ; introduced BullMQ for async workloads with per-tenant queue isolation.  
- Shipped [webcrawler.buzz](https://webcrawler.buzz), a public SEO audit tool on BullMQ \+ PostgreSQL, used internally for client scoping and externally as a free utility. Building MCP recently for Claude or other LLM agents;  
- Established the GitHub Actions CI/CD baseline and Dockerised deployment pattern that the promotion-era architecture work built on.  
- Promoted to Sr. Backend Architect after 6 months based on architectural ownership and delivery.

## Zubion Group \- Full-Stack Delivery Lead

## Dhanmondi, Dhaka (Hybrid) \- September 2024 to July 2025 **Live**: [Website](https://zubiongroup.com/)  | [iOS](https://apps.apple.com/bg/app/zdsl/id6740058261)  | [Android](https://play.google.com/store/apps/details?id=com.zdsl.zdslbd&pcampaignid=web_share)

- Led an end-to-end delivery: the client hired my team wholesale to build their entire product stack \- marketing site, CRM, and cross-platform mobile app.  
- Personally owned backend architecture, deployment, and CI/CD (Next.js \+ NestJS \+ Apollo GraphQL \+ Prisma); team members owned frontend and mobile implementation under my direction.  
- The CRM I designed is now the primary system for Facebook-lead management across ZDSL's properties \- every inbound lead from their Meta channels routes through and is handled inside the platform.  
- Designed centralised multi-channel communication (email, SMS, chat) with real-time sync, automated agent notifications, and SEO tooling for organic lead flow.  
- Deployed on AWS with Docker; integrated SSLCommerz payments and real-time analytics dashboards for broker-performance tracking.

## WeWise & WiseLead \- Backend Lead

## Tel Aviv, Israel (Remote) \- April 2024 to September 2024 Live: [Website](https://wewise.co.il/)

- Led delivery of a WhatsApp marketing \+ lead-automation CRM: bulk / scheduled / media messaging, CSV import \+ export, multi-account management, and audience segmentation. Validated on 90+ pilot businesses during development.  
- Owned backend architecture, CI/CD, and infrastructure (Node.js \+ Express \+ MongoDB \+ Twilio for WhatsApp delivery, Redis for scale, S3 with AES for media storage); team members owned the React \+ Redux \+ MUI frontend under my direction.  
- Implemented JWT auth, RBAC, real-time delivery tracking via Socket.io, and cron-scheduled campaigns.  
- Enforced WhatsApp API policy compliance via per-account rate limiting and exponential-backoff throttling; scaled horizontally with Redis caching.  
- Customer outcomes reported by the product: businesses save 26+ hours per month on unqualified-lead calls and lift conversion by \~28 % on lead follow-up.

## MessageMind \- Sr. Backend Engineer

## Via Durazzo, Italy (Remote) \- March 2023 to February 2024 Live: [Website](https://messagemind.ai/)  |  [iOS](https://apps.apple.com/us/app/messagemind/id6759528944)  | [Android](https://play.google.com/store/apps/details?id=com.messagemind.ai&pcampaignid=web_share)

- Contributed backend for the message pipeline covering WhatsApp, Messenger, Instagram, and web chat on Next.js \+ NestJS \+ PostgreSQL \+ Prisma \+ Redis \+ Stripe. The platform now serves 5,000+ companies, is a Meta Business Partner, and is GDPR-hosted in Frankfurt.  
- Scaled real-time messaging across NestJS microservices with Kafka-style pub/sub and BullMQ-backed workers; handled dead-letter and retry paths so no inbound message was lost during downstream outages.  
- Integrated OpenAI and DeepSeek for AI-driven auto-replies with workflow automation and analytics; wired up Shopify, WooCommerce, Calendly, Google Meet, Zoom, and shipping APIs.  
- Enforced end-to-end encryption, RBAC, and GDPR / CCPA controls.

## FoorWeb \- Backend Engineer

## Algiers, Algeria (Remote) \- June 2021 to November 2022 Live: [Website](https://foorweb.net/)  |  [Android](https://play.google.com/store/apps/details?id=com.foorweb.foorwebapp&pcampaignid=web_share)

- Built backend for the integrated storefront (Node.js \+ Express \+ MongoDB \+ Redis), covering inventory, orders, CRM, and marketing automation.  
- Integrated 80+ shipping carriers, an app marketplace of 30+ integrations, and local Algerian payment rails (BaridiMob, CIB, Dahabeya).  
- Hardened with JWT, Helmet.js, and rate limiting; production observability via Sentry and Prometheus.  
- Deployed on AWS with Docker for containerised production workloads.

## Prokken \- Founder & Principal Engineer

## Dhaka, Bangladesh (Remote) \- June 2021 to October 2025

Founded and ran a small dev agency delivering full-stack SaaS to international clients through direct engagements and freelance marketplaces (Upwork, Fiverr, Freelancer.com). Managed a paid team on frontend, mobile, and QA; personally owned backend architecture, deployment, and technical delivery on every engagement. Several of the client engagements listed under Professional Experience were delivered through Prokken.

### Founded Products (under NDA)

Between 2021 and 2025, through Prokken, I designed and solo-engineered for two SaaS products:

- A unified social-media publishing and analytics API (same category as Buffer or Hootsuite).  
- A unified sales / messaging inbox aggregating Email, LinkedIn, WhatsApp, Instagram, and Telegram into a single Kanban-based CRM (same category as Front or Missive).

Both were acquired by US SaaS companies in 2025\. Product names, acquirer identities, and terms are covered by acquisition NDAs and can’t be listed publicly. Contracts and NDAs on file; happy to walk through specific technical scope, and documentation under mutual NDA. Available on request.

# Key Projects

## PTCL Group \- WhatsApp Business Automation Platform

Islamabad, Pakistan  \-  Live: [Case Study](https://www.facebook.com/business/success/ptcl-group-success-story)

Delivered a WhatsApp Business Platform integration for Pakistan's largest telecom operator to consolidate customer support, billing notifications, and outbound campaigns into a single automated channel. Owned the backend: message routing, template lifecycle, delivery-receipt reconciliation, retry queues, and a webhook layer that fed the existing CRM. Built rate-limit-aware dispatchers to stay inside Meta's tier windows during high-volume billing runs.  
**Stack**: Node.js, NestJS, PostgreSQL, Redis (BullMQ), Meta WhatsApp Cloud API, Docker.  
**Outcome**: replaced a mostly-manual agent workflow with an automated intake and response pipeline; internal case study available on request.

## NadlanOne \- Real-Estate Operations Backend

Rishon LeZion, Israel  \-  Live: [Website](https://nadlanone.co.il/en/)

Engaged directly by the founder to build the backend services powering listing ingestion, agent workflows, and lead routing. Designed the data model, REST API surface, and background jobs; hardened auth and role scoping so brokerages and agents saw only their own data. Added structured logging and health checks so a small founding team could operate the system without a dedicated ops person.  
**Stack**: Node.js, NestJS, PostgreSQL, Redis, TypeORM, Docker, AWS.  
**Focus Areas**: Multi-role access control, ingestion pipelines, and API contracts that a lean frontend team could ship against without backend changes for each new view.

## Ithra \- Content and Cultural Programs Platform

King Abdulaziz Center for World Culture, Saudi Arabia  \-  Live: [Android](https://play.google.com/store/apps/details?id=com.aramco.ithraapp&pcampaignid=web_share)  |  [iOS](https://apps.apple.com/sa/app/ithra/id1482524303)

Contracted independently to contribute backend features to Ithra's digital platform supporting cultural programming, event registration, and content delivery for a bilingual (Arabic/English) audience. Worked on API endpoints, admin tooling, and integrations that non-technical program staff used to publish and update content without engineering involvement. Emphasis on i18n-safe schemas, timezone-correct scheduling, and stable public endpoints during launch windows.  
**Stack**: Node.js, NestJS, PostgreSQL, Redis, Docker.

# Education

Jahangirnagar University \- Savar, Dhaka  
Master of Science in Computer Science \- Completed on August 2025

# Languages

- Bengali \- Native  
- English \- Full professional proficiency  
- Hindi \- Professional working  
- Hebrew \- Elementary (Basic conversational proficiency)  
- Arabic \- Elementary (Basic conversational proficiency)

