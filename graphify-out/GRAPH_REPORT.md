# Graph Report - .  (2026-08-02)

## Corpus Check
- 36 files · ~470,051 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2466 nodes · 3943 edges · 228 communities (172 shown, 56 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 157 edges (avg confidence: 0.76)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Budget Summary Builder
- Recommendation Deduplication
- Workspace Resolver
- Build Minutes & Cold Start Gates
- Impact Label Formatter
- shadcn UI Primitives
- Neon AI Gateway & MCP
- Categories Dashboard Actions
- Canvas Design Fonts
- Vercel Optimize Gates
- Cloudinary Skills
- Claims Extraction
- Claim Verification
- Next.js Cache Semantics
- React Rendering Optimizations
- TypeScript Config Globs
- GSAP Skills
- React Effect Patterns
- Vercel CLI Checks
- Reconcile Candidates
- Third-Party Load Strategy
- Humanizer Skill
- Support Topics Loader
- Dashboard Server Actions
- Cloudinary Transformations
- Investigation Brief
- Blog DB Schema & Cache Tags
- Vercel API Fetchers
- Vercel Bot Protection & Astro
- Dashboard Overview UI
- Community 30
- Community 31
- Community 32
- Community 33
- Community 34
- Community 35
- Community 36
- Community 37
- Community 38
- Community 39
- Community 40
- Community 41
- Community 42
- Community 43
- Community 44
- Community 45
- Community 46
- Community 47
- Community 48
- Community 49
- Community 50
- Community 51
- Community 52
- Community 54
- Community 55
- Community 56
- Community 57
- Community 58
- Community 59
- Community 60
- Community 61
- Community 62
- Community 63
- Community 64
- Community 65
- Community 67
- Community 68
- Community 69
- Community 70
- Community 71
- Community 72
- Community 73
- Community 74
- Community 75
- Community 78
- Community 79
- Community 80
- Community 81
- Community 82
- Community 83
- Community 84
- Community 85
- Community 86
- Community 87
- Community 88
- Community 89
- Community 90
- Community 91
- Community 92
- Community 93
- Community 94
- Community 95
- Community 96
- Community 98
- Community 99
- Community 100
- Community 101
- Community 102
- Community 103
- Community 104
- Community 105
- Community 106
- Community 107
- Community 108
- Community 109
- Community 110
- Community 111
- Community 112
- Community 113
- Community 114
- Community 115
- Community 116
- Community 118
- Community 119
- Community 120
- Community 121
- Community 122
- Community 123
- Community 124
- Community 125
- Community 126
- Community 127
- Community 128
- Community 129
- Community 130
- Community 131
- Community 132
- Community 133
- Community 134
- Community 135
- Community 136
- Community 137
- Community 138
- Community 139
- Community 140
- Community 141
- Community 142
- Community 143
- Community 144
- Community 145
- Community 146
- Community 147
- Community 148
- Community 149
- Community 150
- Community 151
- Community 152
- Community 153
- Community 154
- Community 155
- Community 156
- Community 158
- Community 159
- Community 160
- Community 161
- Community 162
- Community 163
- Community 164
- Community 165
- Community 166
- Community 167
- Community 168
- Community 169
- Community 170
- Community 173
- Community 174
- Community 175
- Community 176
- Community 177
- Community 178
- Community 179
- Community 180
- Community 181
- Community 182
- Community 183
- Community 184
- Community 185
- Community 186
- Community 187
- Community 188
- Community 189
- Community 190
- Community 191
- Community 192
- Community 193
- Community 194
- Community 195
- Community 196
- Community 197
- Community 198
- Community 199
- Community 200
- Community 201
- Community 202
- Community 203
- Community 204
- Community 205
- Community 206
- Community 207
- Community 208
- Community 209
- Community 210
- Community 211
- Community 212
- Community 213
- Community 214
- Community 215
- Community 220
- Community 223
- Community 224
- Community 225
- Community 226
- Community 227

## God Nodes (most connected - your core abstractions)
1. `verifyClaim()` - 42 edges
2. `renderReport()` - 33 edges
3. `extractClaims()` - 31 edges
4. `canonicalizeRoute()` - 27 edges
5. `recText()` - 24 edges
6. `main()` - 24 edges
7. `recText()` - 23 edges
8. `lineOf()` - 19 edges
9. `PROJECT_CONTEXT.md (Frozen Spec)` - 19 edges
10. `main()` - 16 edges

## Surprising Connections (you probably didn't know these)
- `humanizer skill` --locks-version-of--> `skills-lock entry: humanizer (blader/humanizer)`  [EXTRACTED]
  .agents/skills/humanizer/SKILL.md → skills-lock.json
- `tag cache-tag registry` --semantically_similar_to--> `Mutations should call updateTag for read-your-writes semantics`  [INFERRED] [semantically similar]
  /home/prokken-inc/Desktop/portfolio/src/lib/cache-tags.ts → /home/prokken-inc/Desktop/portfolio/docs/BUILD_PLAN.md
- `postInput schema with publish-time refinement` --impacts_future_validation_scope--> `No separate OG title/description beyond existing SEO fields is pending final sign-off`  [AMBIGUOUS]
  /home/prokken-inc/Desktop/portfolio/src/schemas/post.ts → /home/prokken-inc/Desktop/portfolio/docs/BUILD_PLAN.md
- `PC §16 Site Owner Background` --DESCRIBES--> `Hasibul Islam (Site Owner)`  [EXTRACTED]
  PROJECT_CONTEXT.md → HASIBUL_ISLAM_RESUME.md
- `registerMedia Action` --shares_data_with--> `Drizzle Snapshot 0001 Schema`  [INFERRED]
  src/app/dashboard/media/actions.ts → drizzle/meta/0001_snapshot.json

## Import Cycles
- None detected.

## Communities (228 total, 56 thin omitted)

### Community 0 - "Budget Summary Builder"
Cohesion: 0.05
Nodes (85): buildBudgetSummary(), buildChatPreview(), buildExactChatMessage(), buildOptions(), buildPrintCheck(), buildQuestionPayload(), buildQuestionText(), renderBudgetSummaryMarkdown() (+77 more)

### Community 1 - "Recommendation Deduplication"
Cohesion: 0.08
Nodes (57): affectedFiles(), appliesAlsoEntry(), cacheLifeIntent(), dedupEditTarget(), dedupeRecommendations(), dedupIntent(), firstAffectedFile(), fixShape() (+49 more)

### Community 2 - "Workspace Resolver"
Cohesion: 0.07
Nodes (50): buildPackageLookup(), buildResolver(), DEFAULT_RESOLVE_OPTIONS, detectMonorepoRoot(), escapeRegExp(), expandParts(), expandResolvedSpecifier(), expandWorkspaceGlob() (+42 more)

### Community 3 - "Build Minutes & Cold Start Gates"
Cohesion: 0.05
Nodes (39): gate(), metadata, unique(), extractColdStarts(), gate(), metadata, extractCallCounts(), extractExternalApis() (+31 more)

### Community 4 - "Impact Label Formatter"
Cohesion: 0.06
Nodes (35): computeImpactLabel(), cwvIssue(), formatCwvIssue(), formatInteger(), joinEnglish(), parseSigNumber(), round1(), round2() (+27 more)

### Community 5 - "shadcn UI Primitives"
Cohesion: 0.06
Nodes (19): Separator(), Sheet(), SheetContent(), SheetDescription(), SheetHeader(), SheetTitle(), Sidebar(), SidebarContext (+11 more)

### Community 6 - "Neon AI Gateway & MCP"
Cohesion: 0.05
Nodes (45): Neon AI Gateway Skill, Model Context Protocol, Streamable HTTP Transport, @sentry/node SDK, Server-Sent Events (text/event-stream), Neon Functions Skill, Neon Object Storage Skill, Neon Serverless Postgres Skill (+37 more)

### Community 7 - "Categories Dashboard Actions"
Cohesion: 0.08
Nodes (27): ActionState, deleteCategory(), saveCategory(), metadata, Page(), metadata, Page(), metadata (+19 more)

### Community 8 - "Canvas Design Fonts"
Cohesion: 0.08
Nodes (41): Canvas Design Apache 2.0 License, Canvas Design Skill, Arsenal SC Font, Big Shoulders Font, Boldonse Font, Bricolage Grotesque Font, Analog Meditation Aesthetic Example, Canvas Creation Phase (+33 more)

### Community 9 - "Vercel Optimize Gates"
Cohesion: 0.06
Nodes (37): vercel-optimize AGENTS entry, vercel-optimize CONTRIBUTING, vercel-optimize README, build_minutes_fanout gate, cold_start gate, cwv_poor gate (Core Web Vitals), Candidate Gates Reference, collect-signals.mjs script (+29 more)

### Community 10 - "Cloudinary Skills"
Cohesion: 0.09
Nodes (35): Cloudinary Docs Skill, Cloudinary Next.js Skill, Cloudinary React Skill, Cloudinary Assets DAM sub-doc, Cloudinary Image & Video APIs sub-doc, Cloudinary Integrations sub-doc, Cloudinary llms.txt Index, Cloudinary MediaFlows sub-doc (+27 more)

### Community 11 - "Claims Extraction"
Cohesion: 0.18
Nodes (31): asArray(), cacheRecommendationFiles(), extractClaims(), isCacheCandidate(), mentionsAuthSensitiveParallelization(), mentionsCachedNotFoundOr404(), mentionsCacheLifeCdnHeaderClaim(), mentionsCacheLifetimeChange() (+23 more)

### Community 12 - "Claim Verification"
Cohesion: 0.11
Nodes (31): buildScriptHasMigrationSideEffect(), cacheInvalidationFileCache, cleanHeaderValue(), configContainsTag(), escapeRegExp(), extractHeaderValues(), formatPct(), functionStatusForRoute() (+23 more)

### Community 13 - "Next.js Cache Semantics"
Cohesion: 0.12
Nodes (32): Fast Data Transfer payloads, ISR revalidation and static generation, Next.js fetch revalidation floor, Next.js Route Handler GET cache defaults, Next.js cache semantics by version, Not-found and catch-all request waste, Nuxt routeRules cache and ISR, SvelteKit ISR and prerender safety (+24 more)

### Community 14 - "React Rendering Optimizations"
Cohesion: 0.09
Nodes (31): Hoist Static JSX Elements, Prevent Hydration Mismatch Without Flickering, Suppress Expected Hydration Mismatches, Use React DOM Resource Hints, Use defer or async on Script Tags, Optimize SVG Precision, Use useTransition Over Manual Loading States, Defer State Reads to Usage Point (+23 more)

### Community 15 - "TypeScript Config Globs"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 16 - "GSAP Skills"
Cohesion: 0.08
Nodes (28): GSAP Core Skill, GSAP Frameworks Skill, GSAP Performance Skill, GSAP Plugins Skill, GSAP React Skill, GSAP ScrollTrigger Skill, GSAP Timeline Skill, gsap.utils Skill (+20 more)

### Community 17 - "React Effect Patterns"
Cohesion: 0.09
Nodes (28): better-all library, React useEffectEvent hook, Do Not Put Effect Events in Dependency Arrays, Store Event Handlers in Refs, Initialize App Once, Not Per Mount, useEffectEvent for Stable Callback Refs, Prevent Waterfall Chains in API Routes, Check Cheap Conditions Before Async Flags (+20 more)

### Community 18 - "Vercel CLI Checks"
Cohesion: 0.13
Nodes (26): aggregateServicesByName(), baselineStack(), checkAuth(), checkCliVersion(), checkObservabilityPlusConfiguration(), classifyObservabilityPlusConfiguration(), detectNextCacheComponents(), detectStack() (+18 more)

### Community 19 - "Reconcile Candidates"
Cohesion: 0.26
Nodes (24): arrayAt(), deploymentRegressionDecision(), dropWithObservation(), formatInteger(), formatMs(), formatPct(), isrOverrevalidationDecision(), numberAt() (+16 more)

### Community 20 - "Third-Party Load Strategy"
Cohesion: 0.11
Nodes (26): Defer Non-Critical Third-Party Libraries, Dynamic Imports for Heavy Components, Preload Based on User Intent, Deduplicate Global Event Listeners, Version and Minimize localStorage Data, Use Passive Event Listeners for Scrolling Performance, SWR for Client Data Fetching with Deduplication, Avoid Layout Thrashing (+18 more)

### Community 21 - "Humanizer Skill"
Cohesion: 0.11
Nodes (21): AGENTS.md (humanizer), README.md (humanizer), humanizer skill, SKILL.md (humanizer), 33 AI writing patterns, blader (author), marketplace.json (humanizer claude-plugin), openai.yaml (humanizer agent interface) (+13 more)

### Community 22 - "Support Topics Loader"
Cohesion: 0.15
Nodes (24): citationApplies(), HERE, KNOWN_CANDIDATE_KINDS, loadSupportTopics(), matchesCandidateKind(), matchesCandidateMetrics(), matchesCandidateRoutePatterns(), matchesFrameworks() (+16 more)

### Community 23 - "Dashboard Server Actions"
Cohesion: 0.12
Nodes (18): ActionState, ActionState, tag, OverviewCounts, categories, categoriesRelations, media, posts (+10 more)

### Community 24 - "Cloudinary Transformations"
Cohesion: 0.10
Nodes (24): Asset Property Variables ($iw/$ih/$ar), Cloudinary Variables & Conditionals, Cloudinary Transformation Variables, Cloudinary Generative AI Transformations, Cloudinary Transformation Debugging, g_auto requires c_fill family, Cloudinary Transformation Examples, f_auto/dpr_auto/w_auto not in named (+16 more)

### Community 25 - "Investigation Brief"
Cohesion: 0.19
Nodes (23): absoluteBriefPath(), briefRoots(), buildBrief(), cachePolicyGuidance(), capBriefFiles(), closestAncestorLayoutFiles(), isCatchAllPlaceholder(), isDynamicPlaceholder() (+15 more)

### Community 26 - "Blog DB Schema & Cache Tags"
Cohesion: 0.09
Nodes (24): tag cache-tag registry, getOverviewCounts query, categories table schema, media table schema, posts table schema, posts_tags join table schema, resumes table schema, tags table schema (+16 more)

### Community 27 - "Vercel API Fetchers"
Cohesion: 0.20
Nodes (22): getAccountPlan(), getContract(), getMetricsSchema(), getProjectConfig(), getTeamInfo(), getUsage(), hasObservabilityPlus(), inferPlan() (+14 more)

### Community 28 - "Vercel Bot Protection & Astro"
Cohesion: 0.09
Nodes (23): Vercel Observability Plus, Observability Plus Stop-And-Ask, Astro Framework on Vercel, Astro On-Demand Rendering, Vercel Bot Protection, Vercel BotID, Core Web Vitals (LCP/INP/CLS), platform_bot_protection gate (+15 more)

### Community 29 - "Dashboard Overview UI"
Cohesion: 0.13
Nodes (16): Dashboard Layout, COUNT_KEY, Dashboard Overview Page, DESCRIPTIONS, pad(), AppSidebar(), App Sidebar, Props (+8 more)

### Community 30 - "Community 30"
Cohesion: 0.18
Nodes (19): compareVersion(), HERE, isKnownUrl(), LIBRARY_PATH, libraryForStack(), loadLibrary(), lookupSkillRule(), lookupUrl() (+11 more)

### Community 31 - "Community 31"
Cohesion: 0.16
Nodes (15): geistMono, geistSans, metadata, RootLayout(), setLocaleAction(), DIRECTION, HREFLANG, isLocale() (+7 more)

### Community 32 - "Community 32"
Cohesion: 0.14
Nodes (20): A/B Test at Edge Middleware, Playbooks README, Step 4 — Score and Report, Cart drawer 'use client' at leaf, Defer Third-Party JS Pattern, Flex Commit Discountable/Non-discountable SKUs, ImpactLabel Schema, Incremental Static Regeneration (ISR) (+12 more)

### Community 33 - "Community 33"
Cohesion: 0.19
Nodes (16): escapeODataString(), mergeIntoEvidence(), odataEq(), SCANNER_KINDS, simplify(), SPEC_GENERATORS, specsForCandidate(), readProjectJson() (+8 more)

### Community 34 - "Community 34"
Cohesion: 0.18
Nodes (19): recText(), verifyAuthGuardParallelizationSafety(), verifyCache404LongTtlSafety(), verifyCachePolicyPositiveOrNoReadyRec(), verifyCacheVaryCardinalitySafe(), verifyClaim(), verifyImmutableDynamicRouteSafety(), verifyNextCacheComponentsRouteSegmentConfig() (+11 more)

### Community 35 - "Community 35"
Cohesion: 0.23
Nodes (17): candidateKey(), canonicalizeBranchPrefix(), canonicalizeRoute(), decodeSegmentToken(), dedupeCandidates(), firstRouteSegment(), isBase64FlagState(), isDynamicPlaceholder() (+9 more)

### Community 36 - "Community 36"
Cohesion: 0.18
Nodes (15): Option, Props, Props, TagMultiPicker(), TagOption, Command(), CommandEmpty(), CommandGroup() (+7 more)

### Community 37 - "Community 37"
Cohesion: 0.11
Nodes (17): author, name, url, description, homepage, keywords, license, name (+9 more)

### Community 38 - "Community 38"
Cohesion: 0.14
Nodes (18): asChild (Radix composition), nativeButton={false}, render prop (Base composition), Base vs Radix API Differences, Attachment, Bubble, Marker (system notes / dividers), Message Component (+10 more)

### Community 39 - "Community 39"
Cohesion: 0.16
Nodes (13): isApplicable(), metadata, scan(), metadata, scan(), metadata, scan(), metadata (+5 more)

### Community 40 - "Community 40"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 41 - "Community 41"
Cohesion: 0.21
Nodes (13): applyAuthDisqualifier(), isAuthRoute(), CandidateContractError, candidateLabel(), nonEmptyString(), VALID_SCOPES, validateCandidate(), validateCandidates() (+5 more)

### Community 42 - "Community 42"
Cohesion: 0.22
Nodes (14): summarizeClaimResults(), applyQualityFloor(), deriveProjectFacts(), findRecContradictions(), deriveRootFromSignals(), detectRepoRoot(), fileResolvesAt(), pickProbeFile() (+6 more)

### Community 43 - "Community 43"
Cohesion: 0.15
Nodes (11): getMetricThrottle(), isDailyQuotaExceeded(), isRateLimited(), parsePositiveIntEnv(), resolveConcurrency(), resolveRateLimit(), retryOnRateLimit(), SemaphoreAbortError (+3 more)

### Community 44 - "Community 44"
Cohesion: 0.25
Nodes (17): External API critical path, Cross-framework external API critical path, Function duration, I/O, and post-response work, Function invocation reduction, Post-response work with waitUntil, Runtime Cache for reusable server data, https://nextjs.org/docs/app/api-reference/functions/after, https://react.dev/reference/react/cache (+9 more)

### Community 45 - "Community 45"
Cohesion: 0.24
Nodes (16): collectInputFiles(), escapeRegExp(), extractFenceBlocks(), extractJsonValue(), findBalancedJsonSpans(), inferCandidateRefFromFile(), isRecordObject(), log() (+8 more)

### Community 46 - "Community 46"
Cohesion: 0.23
Nodes (16): annotateCodebaseScan(), annotateFinding(), assertObject(), bestRouteSummary(), buildRouteMetricIndex(), exists(), formatRouteSignal(), hasTraffic() (+8 more)

### Community 47 - "Community 47"
Cohesion: 0.18
Nodes (12): config, mw, proxy(), Ctx, GET, { GET, POST }, h, POST (+4 more)

### Community 48 - "Community 48"
Cohesion: 0.17
Nodes (12): savePost Action, CategoryCombobox(), PickedMedia, MediaOption, MediaPicker(), Props, Option, PostForm() (+4 more)

### Community 49 - "Community 49"
Cohesion: 0.25
Nodes (15): checkDynamicApisInsideCache(), checkNextConfig(), checkRevalidateTagSecondArg(), checkSkeletonFiles(), checkUpdateTagCentralization(), fail(), __filename, findings (+7 more)

### Community 50 - "Community 50"
Cohesion: 0.20
Nodes (13): extractErrors(), extractFromStatusRows(), gate(), metadata, extractErrorRatesByRoute(), extractFunctionRoutes(), gate(), metadata (+5 more)

### Community 51 - "Community 51"
Cohesion: 0.24
Nodes (15): citationSubset(), inferFrameworkPlaybook(), inferPlaybook(), candidateRefFor(), buildFanoutPlan(), buildManifest(), candidateFamilyKey(), HERE (+7 more)

### Community 52 - "Community 52"
Cohesion: 0.16
Nodes (16): Scanner Patterns Document, Cache-Control s-maxage Pattern, Vercel Edge Runtime, edge-heavy-import scanner, force-dynamic scanner, headers-in-page scanner, large-static-asset scanner, max-age-without-s-maxage scanner (+8 more)

### Community 54 - "Community 54"
Cohesion: 0.15
Nodes (15): asArray(), firstAccessiblePath(), firstDynamicRouteChainReason(), isCatchAllPlaceholder(), isDynamicPlaceholder(), layoutAppliesToCandidateRoute(), normalizeProjectRootDirectory(), normalizeRouteForLayoutMatch() (+7 more)

### Community 55 - "Community 55"
Cohesion: 0.14
Nodes (14): MSc CS, Jahangirnagar University (2025), FoorWeb (Algiers, Algeria), MessageMind (Italy), Prokken (Founder Agency), WeWise & WiseLead (Tel Aviv, Israel), ZMC Technologies Limited (Dhaka), Zubion Group (Dhanmondi, Dhaka), Hasibul Islam (Site Owner) (+6 more)

### Community 56 - "Community 56"
Cohesion: 0.21
Nodes (12): registerMedia Action, cropToBlob(), ImageCropper(), loadImage(), Props, LibraryOption, Props, UploadTab() (+4 more)

### Community 57 - "Community 57"
Cohesion: 0.20
Nodes (10): metadata, Page(), LoginState, signInAction(), LoginForm(), Button(), buttonVariants, Input() (+2 more)

### Community 58 - "Community 58"
Cohesion: 0.14
Nodes (14): AI Crawlers (GPTBot/OAI-SearchBot/ClaudeBot/Bytespider), Organization Schema (JSON-LD), Product Schema (JSON-LD), WebSite Schema (JSON-LD), Next.js SEO Skill, Core Web Vitals (LCP/INP/CLS), E-E-A-T Ranking Signals, app/manifest.ts (Web App Manifest) (+6 more)

### Community 59 - "Community 59"
Cohesion: 0.15
Nodes (14): Recommendations Spec, Support Topics README, docs-library.json (citation allow-list), Envelope-unwrap Recovery, Recommendation Grading Rubric, Impact Magnitude Rule (buckets), Quality Floor 0.55, Recommendation JSON Schema (+6 more)

### Community 60 - "Community 60"
Cohesion: 0.24
Nodes (7): metadata, Props, Card(), CardContent(), CardDescription(), CardHeader(), CardTitle()

### Community 61 - "Community 61"
Cohesion: 0.15
Nodes (13): asChild → render Prop Migration, Consumer-Side Prop Changes Reference, Universal Migration Patterns Reference, Base UI Button Primitive Usage, Wrapper Shapes Reference, @base-ui/react package, Golden Pair Strategy, Migration Preflight Checklist (+5 more)

### Community 62 - "Community 62"
Cohesion: 0.15
Nodes (13): Auto Cache Key Generation, cacheLife Profiles (seconds/minutes/hours/days/max), connection() API, "use cache" Limitations (edge/static export/128 tag limit), React cache() for Deduplication, cacheLife(), Suspense Boundaries, SuspenseOnSearchParams Component (+5 more)

### Community 63 - "Community 63"
Cohesion: 0.22
Nodes (9): MAX_CODE_CANDIDATES, scanners, metadata, HERE, main(), REFS, renderCandidates(), renderScanners() (+1 more)

### Community 64 - "Community 64"
Cohesion: 0.15
Nodes (13): dotenv, husky, devDependencies, dotenv, husky, pg, @tailwindcss/postcss, @types/node (+5 more)

### Community 65 - "Community 65"
Cohesion: 0.33
Nodes (10): metadata, Page(), metadata, Page(), getPostForEdit(), listCategoriesForPicker(), listMediaForPicker(), listTagsForPicker() (+2 more)

### Community 67 - "Community 67"
Cohesion: 0.20
Nodes (12): Three.js Lighting, Three.js Materials, Three.js Shaders, Three.js Textures, AmbientLight, DirectionalLight, GLSL Uniforms, MeshStandardMaterial (PBR) (+4 more)

### Community 68 - "Community 68"
Cohesion: 0.39
Nodes (11): grade(), gradeRecommendation(), isAccountScope(), roundTo(), scoreActionability(), scoreEvidence(), scoreEvidenceAccount(), scoreGrounding() (+3 more)

### Community 69 - "Community 69"
Cohesion: 0.27
Nodes (12): Next.js font CLS guardrail, Next.js heavy UI lazy-load boundaries, Next.js image LCP preload and sizes, Next.js third-party script strategy, https://nextjs.org/docs/app/api-reference/components/font, https://nextjs.org/docs/app/api-reference/components/image, https://nextjs.org/docs/app/api-reference/components/script, https://nextjs.org/docs/app/guides/lazy-loading (+4 more)

### Community 70 - "Community 70"
Cohesion: 0.20
Nodes (12): Serverless DB Connection Pooling, Edge Rate Limit at Middleware, Fluid Compute, N+1 ORM Anti-pattern, slow_route gate, Parallel External API Calls (Promise.all), API Service Playbook, SaaS Playbook (+4 more)

### Community 71 - "Community 71"
Cohesion: 0.35
Nodes (10): Drop Links Migration, Drizzle Snapshot 0001 Schema, Drizzle Migration Journal, ActionState, deleteResume Action, registerResume Action, setActiveResume Action, Resume Manager (+2 more)

### Community 72 - "Community 72"
Cohesion: 0.17
Nodes (12): scripts, build, check, db:generate, db:migrate, db:studio, dev, lint (+4 more)

### Community 73 - "Community 73"
Cohesion: 0.23
Nodes (11): PC §11 The Dashboard, PC §12 SEO & AI-Crawler Friendliness, PC §16 Site Owner Background, PC §17 Open Items, PC §1 Overview, PC §3 Site Map, PC §5 Blog System, PC §6 Media Library (+3 more)

### Community 74 - "Community 74"
Cohesion: 0.27
Nodes (8): deletePost Action, togglePostStatus Action, Posts Table, formatRelative(), PostsTable(), StatusSwitch(), Slug Entity Table, Switch()

### Community 75 - "Community 75"
Cohesion: 0.31
Nodes (8): DashboardBreadcrumb(), isUuid(), Breadcrumb(), BreadcrumbItem(), BreadcrumbLink(), BreadcrumbList(), BreadcrumbPage(), BreadcrumbSeparator()

### Community 78 - "Community 78"
Cohesion: 0.20
Nodes (10): API Secret Server-Only Rule, Cloudinary Node SDK v2, Cloudinary Signed Uploads Guide, uploadSignature Function Pattern, Cloudinary React Troubleshooting, VITE_ Env Prefix Requirement, Upload Widget Polling Pattern, Cloudinary React TypeScript Patterns (+2 more)

### Community 79 - "Community 79"
Cohesion: 0.29
Nodes (8): apply(), COUNT_CLAIM_TYPES, metadata, rewriteCount(), apply(), metadata, STRIP_DIRECTIVES, escapeRegex()

### Community 81 - "Community 81"
Cohesion: 0.24
Nodes (10): Durable offload for timeout-heavy routes, Route errors and runtime limits, https://vercel.com/docs/cli/inspect, https://vercel.com/docs/functions, https://vercel.com/docs/functions/limitations, https://vercel.com/docs/queues, https://vercel.com/docs/workflow, https://workflow-sdk.dev/docs/foundations/starting-workflows (+2 more)

### Community 82 - "Community 82"
Cohesion: 0.28
Nodes (9): Frontend Design Skill, Anti-Default Discipline, Brief Inference Discipline, Brief-to-Design-System Map, Anti-Slop Frontend Design Skill, Three Dials (Variance/Motion/Density), AI Design Defaults Calibration, Restraint & Self-Critique (+1 more)

### Community 83 - "Community 83"
Cohesion: 0.25
Nodes (9): Extended fetch API Cache Options, Incremental Static Regeneration (ISR), Vercel Deployment, Client Components ('use client'), Server Components (RSC), Next.js Developer Skill, nuqs (URL Search Param State), Next.js React TypeScript Skill (+1 more)

### Community 84 - "Community 84"
Cohesion: 0.22
Nodes (9): shadcn CLI (npx shadcn@latest), shadcn add --dry-run / --diff / --view, shadcn MCP Server, shadcn/ui Skill, shadcn Base UI vs Radix Primitives, components.json Config, FieldGroup + Field Form Pattern, shadcn OpenAI Agent Config (+1 more)

### Community 85 - "Community 85"
Cohesion: 0.42
Nodes (8): applyHardGates(), flagsEndpointReason(), isFlagsEndpointCandidate(), isWorkflowRuntimeEndpointCandidate(), normalizeRoute(), VERCEL_FLAGS_PACKAGES, WORKFLOW_ENDPOINT_PREFIXES, workflowEndpointReason()

### Community 86 - "Community 86"
Cohesion: 0.36
Nodes (8): candidateForGroup(), gate(), groupFindings(), metadata, observedCacheHitRate(), questionFor(), SCANNER_GATES, uniqueStrings()

### Community 87 - "Community 87"
Cohesion: 0.33
Nodes (5): candidateIdentity(), DEFAULT_KIND_CAPS, DIVERSITY_ELIGIBILITY, isDiversityEligible(), selectLaunchCandidates()

### Community 88 - "Community 88"
Cohesion: 0.33
Nodes (6): apply(), metadata, apply(), metadata, MODE_PATTERNS, extractRoute()

### Community 89 - "Community 89"
Cohesion: 0.28
Nodes (9): cacheLifeNeedsContentFreshnessProof(), dedupeCacheTags(), execFileP, extractCacheTags(), extractCacheTagsFromFiles(), readCacheInvalidationFiles(), rgRelevantFiles(), verifyNextCacheLifetimeFreshnessSupported() (+1 more)

### Community 90 - "Community 90"
Cohesion: 0.31
Nodes (9): compilePattern(), readClaimFile(), snippetFoundElsewhere(), verifyCodeSnippet(), verifyPatternAbsent(), verifyPatternCount(), verifyPatternExists(), verifyRepoCount() (+1 more)

### Community 91 - "Community 91"
Cohesion: 0.31
Nodes (9): Vercel AI Gateway, AI Provider Failover Pattern, BYOK Fallback Cost Gotcha, Next.js after() API, OIDC Keyless Auth, AI Application Playbook, Sandbox Reuse (pool by name), @vercel/functions waitUntil (+1 more)

### Community 92 - "Community 92"
Cohesion: 0.22
Nodes (8): cacheTag(), cacheComponents Flag, Cache Architecture Overlay Config, Revalidation Utilities (lib/cache/revalidate.ts), Next.js Cache Architecture Skill, Cache Tag Registry (lib/cache/tags.ts), updateTag(), Cache Debugging Order & Checklist

### Community 93 - "Community 93"
Cohesion: 0.31
Nodes (9): Next.js Cache Components, generateStaticParams, Partial Prerendering (PPR), cache-components-suspense-dedupe scanner, use-cache-date-stamp scanner, Cache Components Static Shell Boundaries Topic, Cache Components Suspense Dedupe Pitfall Topic, Dynamic Rendering Traps Topic (+1 more)

### Community 94 - "Community 94"
Cohesion: 0.22
Nodes (9): class-variance-authority, dependencies, class-variance-authority, @radix-ui/react-switch, @radix-ui/react-tabs, react-dom, @radix-ui/react-switch, @radix-ui/react-tabs (+1 more)

### Community 95 - "Community 95"
Cohesion: 0.36
Nodes (9): Project Package Manifest, Category Combobox, Image Cropper, Image Picker Dialog, Media Grid, Media Picker, Post Form, Tag Multi Picker (+1 more)

### Community 96 - "Community 96"
Cohesion: 0.31
Nodes (7): deleteMedia Action, ImagePickerDialog(), DeleteDialog(), Filter, formatBytes(), MediaGrid(), PreviewDialog()

### Community 98 - "Community 98"
Cohesion: 0.25
Nodes (8): High-End Visual Design Skill, Absolute Zero Directive (Anti-Patterns), Double-Bezel Nested Architecture, Fluid Island Nav Motion Pattern, GPU-Safe Animation (transform/opacity), IntersectionObserver Scroll Reveal, Magnetic Button Hover Physics, Vanguard_UI_Architect Persona

### Community 99 - "Community 99"
Cohesion: 0.25
Nodes (7): description, name, owner, name, url, plugins, $schema

### Community 100 - "Community 100"
Cohesion: 0.43
Nodes (7): formatBytes(), metadata, scan(), shouldSkip(), SKIP_EXTENSIONS, SKIP_PATH_PREFIXES, walk()

### Community 101 - "Community 101"
Cohesion: 0.25
Nodes (7): applicableFrameworksSyntax, lastVerified, ruleSkillRefs, $schema, schemaVersion, urls, version

### Community 102 - "Community 102"
Cohesion: 0.29
Nodes (6): Use after() for Non-Blocking Operations, Authenticate Server Actions Like API Routes, Cross-Request LRU Caching, Server-side rules, lru-cache library, Vercel Fluid Compute

### Community 103 - "Community 103"
Cohesion: 0.25
Nodes (8): /rtl-audit Slash Command, Locale: Arabic (RTL), Locale: Bangla (LTR), Locale: English (default, LTR), Locale: Hebrew (RTL), Locale: Urdu (RTL), PC §10 i18n & RTL/LTR Support, RTL-safe Logical Properties Rule

### Community 104 - "Community 104"
Cohesion: 0.25
Nodes (3): Action, Props, SlugRow

### Community 105 - "Community 105"
Cohesion: 0.25
Nodes (7): VSCode task: build, VSCode task: db:generate, VSCode task: db:migrate, VSCode task: dev (Next.js dev server), VSCode task: lint, VSCode task: seed:user, VSCode task: typecheck

### Community 106 - "Community 106"
Cohesion: 0.33
Nodes (5): revalidate(), updateTags(), EntityTagFactory, Tag, TagRegistry

### Community 107 - "Community 107"
Cohesion: 0.43
Nodes (7): Three.js Animation, Three.js Loaders, AnimationAction, AnimationClip, AnimationMixer, GLTFLoader, LoadingManager

### Community 108 - "Community 108"
Cohesion: 0.52
Nodes (6): classifyFrameworkSupport(), CORE_SUPPORTED_FRAMEWORKS, frameworkLabel(), LABELS, LIMITED_FRAMEWORKS, normalizeFramework()

### Community 109 - "Community 109"
Cohesion: 0.48
Nodes (6): byRoute(), gate(), metadata, ratioOverThreshold(), round2(), sumRows()

### Community 110 - "Community 110"
Cohesion: 0.48
Nodes (6): countMatches(), findRepeated(), metadata, record(), scan(), truncate()

### Community 111 - "Community 111"
Cohesion: 0.52
Nodes (6): extractSpecifiers(), HEAVY_PATTERNS, isEdgeRuntimeFile(), isMiddleware(), metadata, scan()

### Community 112 - "Community 112"
Cohesion: 0.48
Nodes (6): detectBuildCacheDisabled(), lineOfMatch(), metadata, safeScripts(), scan(), truncate()

### Community 113 - "Community 113"
Cohesion: 0.48
Nodes (6): classifySubtype(), collectRanges(), findMatchingParen(), isInsideAnyRange(), metadata, scan()

### Community 114 - "Community 114"
Cohesion: 0.29
Nodes (7): Asymmetrical Bento Layout, Editorial Luxury Archetype, Editorial Split Layout, Ethereal Glass Archetype, Soft Structuralism Archetype, Creative Variance Engine, Z-Axis Cascade Layout

### Community 115 - "Community 115"
Cohesion: 0.29
Nodes (7): Out-of-Scope: Blog Comments & Likes, Out-of-Scope: 3D on Mobile/Tablet, Out-of-Scope: Prisma/MUI/Redux/GraphQL as deps, Out-of-Scope: Short-Link System, Out-of-Scope: WASD / Physics Game Mechanics, PC §15 Explicitly Out of Scope, PC §2 Locked Tech Stack

### Community 116 - "Community 116"
Cohesion: 0.29
Nodes (7): Palette: Cream Text #F2E4D0, Palette: Navy Secondary #252E3F, Palette: Near-Black Base #0F131A, Palette: Orange Highlight #E86B1C, Palette: Orange Shadow #B84A0F, PC §4 3D Landing Scene, PC §8 Visual Identity & Branding

### Community 120 - "Community 120"
Cohesion: 0.33
Nodes (6): App Router File Conventions (layout/page/loading/error), Intercepting Routes, Parallel Routes, Route Groups, Route Handlers (route.ts), Next.js App Router

### Community 121 - "Community 121"
Cohesion: 0.53
Nodes (5): defaultNormalize(), normalizeColdStart(), normalizerFor(), QUERIES, normalizeSummary()

### Community 122 - "Community 122"
Cohesion: 0.53
Nodes (5): isJsxLike(), isNextConfig(), metadata, scan(), snippet()

### Community 123 - "Community 123"
Cohesion: 0.33
Nodes (5): lint-staged, *.{ts,tsx}, name, private, version

### Community 124 - "Community 124"
Cohesion: 0.40
Nodes (5): @sveltejs/adapter-vercel, SvelteKit load function, SvelteKit prerender option, SvelteKit Playbook, sveltekit-prerender-missing scanner

### Community 125 - "Community 125"
Cohesion: 0.40
Nodes (5): Smooch Sans OFL License, Tektur OFL License, Work Sans OFL License, Young Serif OFL License, SIL Open Font License v1.1

### Community 126 - "Community 126"
Cohesion: 0.50
Nodes (5): Claimable Postgres Skill, neon.new REST API, neon-new CLI, Parent Neon Skill (reference), vite-plugin-neon-new

### Community 127 - "Community 127"
Cohesion: 0.40
Nodes (5): Accordion Migration, Collapsible Migration, Disclosure Family Props Mapping, Tabs Migration, Toggle/ToggleGroup Migration

### Community 128 - "Community 128"
Cohesion: 0.40
Nodes (5): ContextMenu Migration, DropdownMenu → Base Menu Migration, NavigationMenu Migration, Portal>Positioner>Popup Restructure, Menu Family Props Mapping

### Community 129 - "Community 129"
Cohesion: 0.40
Nodes (5): Dialog Migration, HoverCard → PreviewCard Migration, Popover Migration, Overlays Props Mapping, Tooltip Migration

### Community 130 - "Community 130"
Cohesion: 0.40
Nodes (5): useOptimistic Updates, revalidatePath(), 'use server' Directive, useFormState/useFormStatus, Server Actions

### Community 131 - "Community 131"
Cohesion: 0.50
Nodes (5): Built Registry (public/r), include Directive, Registry Item, shadcn Registry Authoring, Source registry.json

### Community 132 - "Community 132"
Cohesion: 0.40
Nodes (4): Candidate, CandidateScope, GateMetadata, Signals

### Community 133 - "Community 133"
Cohesion: 0.40
Nodes (5): Image optimization cost control, https://vercel.com/docs/image-optimization, https://vercel.com/docs/image-optimization/limits-and-pricing, https://vercel.com/docs/image-optimization/managing-image-optimization-costs, Image optimization (candidate kind)

### Community 134 - "Community 134"
Cohesion: 0.40
Nodes (5): Blog Schema Field-Length Rules, Drizzle + Neon Rules, Out-of-Scope: Page-View Analytics, PC §13 Performance & DB Discipline, PC §14 Reusability & No Redundancy

### Community 135 - "Community 135"
Cohesion: 0.60
Nodes (5): clearThemeAction, setThemeAction, ThemeToggle component, pick(next) theme handler, Theme persisted via cookie and mirrored on html dataset for instant tab flip

### Community 136 - "Community 136"
Cohesion: 0.40
Nodes (5): Command UI wrapper, PopoverContent UI wrapper, Switch UI wrapper, TabsTrigger UI wrapper, Shared primitive-wrapper pattern for UI components

### Community 137 - "Community 137"
Cohesion: 0.67
Nodes (3): ParamsToSign, POST(), requiredEnv()

### Community 139 - "Community 139"
Cohesion: 0.50
Nodes (4): Deploy to Vercel Skill, Link Project Then Deploy Workflow, Prefer Preview over Production, Vercel CLI

### Community 140 - "Community 140"
Cohesion: 0.50
Nodes (4): Avatar Migration, Progress Migration, Display/Misc Components Mapping, ScrollArea Migration

### Community 141 - "Community 141"
Cohesion: 0.50
Nodes (4): Checkbox Migration, Form Controls Props Mapping, Select Migration, Slider Migration

### Community 142 - "Community 142"
Cohesion: 0.50
Nodes (4): GEO/AEO (Generative/Answer Engine Optimization), Google AI Overviews / AI Mode, llms.txt Community Proposal, FAQPage Schema (Rich Results Deprecated)

### Community 143 - "Community 143"
Cohesion: 0.50
Nodes (4): data-icon inline-start/end attribute, No sizing classes on icons, Use project iconLibrary setting, Icons Rules

### Community 144 - "Community 144"
Cohesion: 0.50
Nodes (4): Built-in variants over utility classes, cn() for conditional classes, Styling & Customization Rules, Semantic color tokens

### Community 145 - "Community 145"
Cohesion: 0.67
Nodes (4): Three.js Fundamentals, PerspectiveCamera, Scene, WebGLRenderer

### Community 146 - "Community 146"
Cohesion: 0.67
Nodes (3): isApplicable(), metadata, scan()

### Community 147 - "Community 147"
Cohesion: 0.67
Nodes (3): isApplicable(), metadata, scan()

### Community 148 - "Community 148"
Cohesion: 0.67
Nodes (3): isApplicable(), metadata, scan()

### Community 149 - "Community 149"
Cohesion: 0.50
Nodes (4): Fluid compute caveats, https://vercel.com/docs/fluid-compute, Cold start (candidate kind), Platform fluid compute (candidate kind)

### Community 150 - "Community 150"
Cohesion: 0.50
Nodes (4): Function region misconfiguration (TTFB), https://vercel.com/docs/functions/configuring-functions/region, https://vercel.com/docs/regions, Region misconfiguration (candidate kind)

### Community 151 - "Community 151"
Cohesion: 0.50
Nodes (4): Middleware edge cost, https://nextjs.org/docs/app/building-your-application/routing/middleware, https://vercel.com/docs/routing-middleware, Heavy middleware (candidate kind)

### Community 152 - "Community 152"
Cohesion: 0.50
Nodes (4): Observability Events cost attribution, https://vercel.com/docs/alerts, https://vercel.com/docs/observability/observability-plus, Observability events attribution (candidate kind)

### Community 153 - "Community 153"
Cohesion: 0.50
Nodes (3): generateMetadata with parent/ResolvingMetadata, Metadata Shallow-Merge Gotcha, Metadata API

### Community 154 - "Community 154"
Cohesion: 0.50
Nodes (3): react, react, useIsMobile()

### Community 155 - "Community 155"
Cohesion: 0.50
Nodes (4): Container Queries (@container), Grid Template Areas, Holy Grail Grid Layout, Tailwind Advanced Layouts

### Community 156 - "Community 156"
Cohesion: 0.67
Nodes (3): AGENTS.md (symlink), Web Interface Guidelines Review Skill, Agent Instructions (Copilot / Codex / Claude Code)

### Community 158 - "Community 158"
Cohesion: 0.67
Nodes (3): cloudinary-video-player package, Cloudinary Video Player Guide, Imperative Video Element Rule

### Community 160 - "Community 160"
Cohesion: 0.67
Nodes (3): Base UI Animation Idiom (starting/ending style), Data-Attribute Selector Rewrites, Class-Mapping Reference

### Community 162 - "Community 162"
Cohesion: 0.67
Nodes (3): shadcn Customization & Theming, Dark Mode via next-themes, OKLCH Semantic Color Tokens

### Community 163 - "Community 163"
Cohesion: 0.67
Nodes (3): Three.js Geometry, BoxGeometry / built-in shapes, BufferGeometry

### Community 164 - "Community 164"
Cohesion: 0.67
Nodes (3): Three.js Interaction, OrbitControls, Raycaster (mouse picking)

### Community 165 - "Community 165"
Cohesion: 1.00
Nodes (3): Three.js Post-Processing, EffectComposer, UnrealBloomPass

### Community 166 - "Community 166"
Cohesion: 0.67
Nodes (3): React.cache() Per-Request Deduplication, Parallel Data Fetching with Component Composition, Parallel Nested Data Fetching

### Community 167 - "Community 167"
Cohesion: 0.67
Nodes (3): Personal Brand Identity, App Favicon, Portrait Subject

### Community 168 - "Community 168"
Cohesion: 0.67
Nodes (3): File-based Metadata Priority, ImageResponse (next/og, Satori), opengraph-image File Convention

### Community 170 - "Community 170"
Cohesion: 0.67
Nodes (3): Next.js App Router Fundamentals Skill, No `any` Type Rule, Pages Router → App Router Migration

## Ambiguous Edges - Review These
- `Hoist Static JSX Elements` → `Don't Define Components Inside Components`  [AMBIGUOUS]
  .agents/skills/vercel-react-best-practices/rules/rendering-hoist-jsx.md · relation: semantically_similar_to
- `postInput schema with publish-time refinement` → `No separate OG title/description beyond existing SEO fields is pending final sign-off`  [AMBIGUOUS]
  /home/prokken-inc/Desktop/portfolio/docs/BUILD_PLAN.md · relation: impacts_future_validation_scope

## Knowledge Gaps
- **407 isolated node(s):** `ParamsToSign`, `ResourceType`, `deploy-codex.sh script`, `deploy.sh script`, `Props` (+402 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **56 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Hoist Static JSX Elements` and `Don't Define Components Inside Components`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._
- **What is the exact relationship between `postInput schema with publish-time refinement` and `No separate OG title/description beyond existing SEO fields is pending final sign-off`?**
  _Edge tagged AMBIGUOUS (relation: impacts_future_validation_scope) - confidence is low._
- **Why does `gates` connect `Build Minutes & Cold Start Gates` to `Budget Summary Builder`, `Community 41`, `Support Topics Loader`, `Community 63`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Why does `scanners` connect `Community 63` to `Workspace Resolver`, `Build Minutes & Cold Start Gates`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Why does `canonicalizeRoute()` connect `Community 35` to `Budget Summary Builder`, `Recommendation Deduplication`, `Claim Verification`, `Community 46`, `Community 85`, `Community 54`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **What connects `ParamsToSign`, `ResourceType`, `deploy-codex.sh script` to the rest of the system?**
  _407 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Budget Summary Builder` be split into smaller, more focused modules?**
  _Cohesion score 0.05225885225885226 - nodes in this community are weakly interconnected._