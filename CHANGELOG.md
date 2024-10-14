# Changelog

All notable changes to Yorkie will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and CodePair adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.15] - 2024-10-14

### Added

- Introduce mono repo by @choidabom in https://github.com/yorkie-team/codepair/pull/361

### Changed

- Add bottom padding to MarkdownPreview by @blurfx in https://github.com/yorkie-team/codepair/pull/363
- Bump JamesIves/github-pages-deploy-action from 4.6.3 to 4.6.8 by @dependabot in https://github.com/yorkie-team/codepair/pull/364

## [0.1.14] - 2024-09-28

### Fixed

- Fix loading behavior when Access Token is absent by @devleejb in https://github.com/yorkie-team/codepair/pull/359

## [0.1.13] - 2024-09-23

### Added

- Add ability to modify document titles by @hugosandsjo in https://github.com/yorkie-team/codepair/pull/342
- Apply design changes for document title update feature by @devleejb in https://github.com/yorkie-team/codepair/pull/357

### Fixed

- Fix abnormal line spacing in Markdown lists caused by Soft Line Breaks by @devleejb in https://github.com/yorkie-team/codepair/pull/353
- Fix Race Condition in Axios Interceptor for Refresh Token by @devleejb in https://github.com/yorkie-team/codepair/pull/356

## [0.1.12] - 2024-09-13

### Changed

- Add missing refresh token settings in `docker-compose-full.yml` by @choidabom in https://github.com/yorkie-team/codepair/pull/344
- Prevent dragging selection of identical characters in CodeMirror by @choidabom in https://github.com/yorkie-team/codepair/pull/345
- Reorder keybinding addition for VIM in CodeMirror6 by @devleejb in https://github.com/yorkie-team/codepair/pull/346

### Fixed

- Fix issue where `jj` could not be entered in Vim mode by @hackerwins in https://github.com/yorkie-team/codepair/pull/347
- Change font color of the panel in VIM mode for improved visibility by @devleejb in https://github.com/yorkie-team/codepair/pull/349

## [0.1.11] - 2024-09-12

### Added

- Add Vim binding support for CodePair using CodeMirror 6 by @choidabom in https://github.com/yorkie-team/codepair/pull/340
- Implement Refresh Token by @xet-a in https://github.com/yorkie-team/codepair/pull/317

### Changed

- Remove unnecessary `LANGCHAIN_ENDPOINT` environment variable due to LangSmith API Key update by @devleejb in https://github.com/yorkie-team/codepair/pull/336

## [0.1.10] - 20204-09-05

### Added

- Add hyperlink creation feature by @choidabom in https://github.com/yorkie-team/codepair/pull/332

### Changed

- Update `yorkie-js-sdk` to 0.4.31 by @devleejb in https://github.com/yorkie-team/codepair/pull/331
- Ensure correct representation of logged-in users in shared document view by @choidabom in https://github.com/yorkie-team/codepair/pull/333
- Bump up `yorkie-js-sdk` to `0.5.0` by @devleejb in https://github.com/yorkie-team/codepair/pull/334

## [0.1.9] - 20204-09-02

### Changed

- Change version of `codemirror`, `yorkie-js-sdk` dependencies by @devleejb in https://github.com/yorkie-team/codepair/pull/329

## [0.1.8] - 2024-09-01

### Changed

- Downgrade `yorkie-js-sdk` to `v0.4.27` by @devleejb in https://github.com/yorkie-team/codepair/pull/327

### Fixed

- Disable retry logic for 401 errors during login by @devleejb in https://github.com/yorkie-team/codepair/pull/325

## [0.1.7] - 2024-08-29

### Added

- Add scroll navigation to user's location from profile view by @choidabom in https://github.com/yorkie-team/codepair/pull/316

### Fixed

- Added rehypeSanitize to improve preview xss issues by @taeng0204 in https://github.com/yorkie-team/codepair/pull/323

## [0.1.6] - 2024-08-24

### Fixed

- Fix Slidebar Overlapping by @devleejb in https://github.com/yorkie-team/codepair/pull/312
- Fix npm install command in `gh_pages` Actions to use `npm ci` by @devleejb in https://github.com/yorkie-team/codepair/pull/313

## [0.1.5] - 2024-08-24

### Fixed

- Add build test on GitHub Actions CI and regenerate `package-lock.json` by @devleejb in https://github.com/yorkie-team/codepair/pull/310

## [0.1.4] - 2024-08-24

### Added

- Add Ollama Model for local usage of yorkie intelligence by @sihyeong671 in https://github.com/yorkie-team/codepair/pull/297

## Changed

- Apply the design of sidebar by @devleejb in https://github.com/yorkie-team/codepair/pull/306
- Bump up `yorkie-js-sdk` to v0.4.31 by @devleejb in https://github.com/yorkie-team/codepair/pull/307

## Fixed

- Update and fix environment setup for Ollama model by @devleejb in https://github.com/yorkie-team/codepair/pull/304

## [0.1.3] - 2024-08-20

### Added

- Introduce `MAINTAINING.md` and `CHANGELOG.md` files by @devleejb in https://github.com/yorkie-team/codepair/pull/296

### Changed

- Intergrate `YorkieIntelligence` into `ToolBar` by @beberiche in https://github.com/yorkie-team/codepair/pull/301

### Fixed

- Update `rehype-katex` version to prevent errors in CodePair when entering specific KaTex statements by @devleejb in https://github.com/yorkie-team/codepair/pull/302

## [0.1.2] - 2024-08-14

### Added

- Add Document Writing Intelligence by @devleejb in https://github.com/yorkie-team/codepair/pull/289

### Changed

- Add .gitignore into root project directory by @sihyeong671 in https://github.com/yorkie-team/codepair/pull/280
- Change model from `gpt-3.5-turbo` to `gpt-4o-mini` by @devleejb in https://github.com/yorkie-team/codepair/pull/291

## [0.1.1] - 2024-08-12

### Added

- Add shortcut for text formatting and FormatBar component by @beberiche in https://github.com/yorkie-team/codepair/pull/263
- Add notifications when there is an error in the service by @wet6123 in https://github.com/yorkie-team/codepair/pull/264
- Implement navigate to 404 error page when accessing non-existent URL in workspaceSlug by @KimKyuHoi in https://github.com/yorkie-team/codepair/pull/244
- Add description for tag system in `CONTIRBUTING.md` by @devleejb in https://github.com/yorkie-team/codepair/pull/271
- Add pre-commit hook using husky for linting and formatting by @choidabom in https://github.com/yorkie-team/codepair/pull/281

### Changed

- Change slug usage to encoded text by @minai621 in https://github.com/yorkie-team/codepair/pull/261
- Bump JamesIves/github-pages-deploy-action from 4.6.1 to 4.6.3 by @dependabot in https://github.com/yorkie-team/codepair/pull/262
- Change `encodeURIComponent` to `encodeURI` by @devleejb in https://github.com/yorkie-team/codepair/pull/265
- Remove unnecessary package-lock.json file by @choidabom in https://github.com/yorkie-team/codepair/pull/277
- Update GitHub Actions to trigger when a new version is released by @devleejb in https://github.com/yorkie-team/codepair/pull/283

### Fixed

- Fix Checking Conflict in Note Creation by @devleejb in https://github.com/yorkie-team/codepair/pull/266
- Fix 'Additional Users' Popover Display Logic for Profile Clicks by @choidabom in https://github.com/yorkie-team/codepair/pull/270

## [0.1.0] - 2024-08-01

### Added

- Initialize frontend project by @devleejb in https://github.com/yorkie-team/codepair/pull/37
- (FE) Add document editing with Yorkie by @devleejb in https://github.com/yorkie-team/codepair/pull/38
- Add document creation logic by @devleejb in https://github.com/yorkie-team/codepair/pull/39
- Add GitHub page actions by @devleejb in https://github.com/yorkie-team/codepair/pull/40
- Add the base path to header by @devleejb in https://github.com/yorkie-team/codepair/pull/42
- GitHub page not working although the deployment is completed by @devleejb in https://github.com/yorkie-team/codepair/pull/43
- Backend configuration by @devleejb in https://github.com/yorkie-team/codepair/pull/44
- Database Implementation by @devleejb in https://github.com/yorkie-team/codepair/pull/45
- Support MongoDB by @devleejb in https://github.com/yorkie-team/codepair/pull/49
- (BE) User registration / login by @devleejb in https://github.com/yorkie-team/codepair/pull/51
- (BE) Implement workspace creation logic by @devleejb in https://github.com/yorkie-team/codepair/pull/53
- (BE) Add API for Retrieving a Workspace by @devleejb in https://github.com/yorkie-team/codepair/pull/58
- (BE) Add API for Retrieving Workspace List by @devleejb in https://github.com/yorkie-team/codepair/pull/59
- (BE) Add API for Retrieving Workspace Members by @devleejb in https://github.com/yorkie-team/codepair/pull/60
- (BE) Add API for Creating a Document in Workspace by @devleejb in https://github.com/yorkie-team/codepair/pull/61
- Add API for Retrieving a Document in the Workspace by @devleejb in https://github.com/yorkie-team/codepair/pull/62
- (BE) Add API for Retrieving the Document List in the Workspace by @devleejb in https://github.com/yorkie-team/codepair/pull/63
- (BE) Add API for Workspace Invitation by @devleejb in https://github.com/yorkie-team/codepair/pull/64
- (BE) Add API for Document Sharing by @devleejb in https://github.com/yorkie-team/codepair/pull/65
- (BE) Add API for Retrieving a User by @devleejb in https://github.com/yorkie-team/codepair/pull/68
- (FE) Add User registration / Login by @devleejb in https://github.com/yorkie-team/codepair/pull/69
- (FE) Add Retrieving a User Information by @devleejb in https://github.com/yorkie-team/codepair/pull/70
- (FE) Add Logout by @devleejb in https://github.com/yorkie-team/codepair/pull/71
- (FE) Add Retrieving a Workspace by @devleejb in https://github.com/yorkie-team/codepair/pull/73
- (FE) Add Retrieve Workspace List by @devleejb in https://github.com/yorkie-team/codepair/pull/74
- (BE) Generate slug for workspace and document by @devleejb in https://github.com/yorkie-team/codepair/pull/78
- (BE) Generate Share and Invitation token by @devleejb in https://github.com/yorkie-team/codepair/pull/79
- (FE) Retrieve Document List within Workspace by @devleejb in https://github.com/yorkie-team/codepair/pull/80
- (FE) Document Creation within Workspace Document Name by @devleejb in https://github.com/yorkie-team/codepair/pull/81
- (FE) Workspace Creation by @devleejb in https://github.com/yorkie-team/codepair/pull/82
- (FE) Add retrieve a Document by @devleejb in https://github.com/yorkie-team/codepair/pull/83
- (FE) Retrieve Workspace Members by @devleejb in https://github.com/yorkie-team/codepair/pull/84
- (FE) Add Global Error Handling by @devleejb in https://github.com/yorkie-team/codepair/pull/86
- (FE) Add Workspace Invitation by @devleejb in https://github.com/yorkie-team/codepair/pull/87
- (FE) Add Document Sharing by @devleejb in https://github.com/yorkie-team/codepair/pull/89
- (FE) Add Presence to Editor Header by @devleejb in https://github.com/yorkie-team/codepair/pull/90
- (BE) Dockerize the Backend by @devleejb in https://github.com/yorkie-team/codepair/pull/94
- (FE) Wrong Presence Information by @devleejb in https://github.com/yorkie-team/codepair/pull/96
- Fix Typo in Environment by @devleejb in https://github.com/yorkie-team/codepair/pull/97
- (FE) Apply URL Spec by @devleejb in https://github.com/yorkie-team/codepair/pull/98
- (BE) Retrieve `lastChangedAt` from Yorkie Server by @devleejb in https://github.com/yorkie-team/codepair/pull/101
- (FE) Incorrect Integration of CodeMirror and Yorkie Resulting in Document Synchronization by @devleejb in https://github.com/yorkie-team/codepair/pull/102
- Add GitHub Actions for Publish Docker Image by @devleejb in https://github.com/yorkie-team/codepair/pull/103
- (FE) Refactor `react-query` and `redux` by @devleejb in https://github.com/yorkie-team/codepair/pull/104
- (BE) Error handling for fetch document by @devleejb in https://github.com/yorkie-team/codepair/pull/105
- (BE) Add Auth Webhook for Document Key Access Verification by @devleejb in https://github.com/yorkie-team/codepair/pull/106
- Fix `remoteSelection` to Update Remote Decoration at Once by @devleejb in https://github.com/yorkie-team/codepair/pull/115
- AI Project Configuration by @devleejb in https://github.com/yorkie-team/codepair/pull/116
- Add Migration Scripts by @devleejb in https://github.com/yorkie-team/codepair/pull/117
- (AI) AI Project Configuration OpenAI, Framework, LangChain LangSmith by @devleejb in https://github.com/yorkie-team/codepair/pull/119
- (AI) LLM Yorkie Intelligence Development (GitHub Issue Writing, PR Writing, Additional Question Function) by @devleejb in https://github.com/yorkie-team/codepair/pull/120
- Synchronization Issue when Multiple Users are Editing the Document in the Editor by @devleejb in https://github.com/yorkie-team/codepair/pull/121
- Fix RemoteSelection Infinite Updating by @devleejb in https://github.com/yorkie-team/codepair/pull/122
- (FE) Implement CodePair AI Assistant by @devleejb in https://github.com/yorkie-team/codepair/pull/123
- Bump actions/checkout from 2 to 4 by @dependabot in https://github.com/yorkie-team/codepair/pull/126
- Bump JamesIves/github-pages-deploy-action from 4.1.0 to 4.5.0 by @dependabot in https://github.com/yorkie-team/codepair/pull/125
- Bump actions/setup-node from 1 to 4 by @dependabot in https://github.com/yorkie-team/codepair/pull/124
- Implement `documents.service.spec.ts` by @devleejb in https://github.com/yorkie-team/codepair/pull/128
- Change Yorkie Project Public Key by @devleejb in https://github.com/yorkie-team/codepair/pull/127
- Update `README.md` by @devleejb in https://github.com/yorkie-team/codepair/pull/130
- Add Frontend & Backend `README.md` by @devleejb in https://github.com/yorkie-team/codepair/pull/131
- Remove Admin API used for Data Migration by @devleejb in https://github.com/yorkie-team/codepair/pull/151
- Add Design Document for AuthWebhook Design by @devleejb in https://github.com/yorkie-team/codepair/pull/152
- Add Frontend Sentry & Google Analytics by @devleejb in https://github.com/yorkie-team/codepair/pull/153
- Add Backend Architecture Documentation by @devleejb in https://github.com/yorkie-team/codepair/pull/154
- Fix typo by @hackerwins in https://github.com/yorkie-team/codepair/pull/155
- Add documentation for using Redux and React Query as state management tools by @devleejb in https://github.com/yorkie-team/codepair/pull/156
- Add ability to attach images in the editor by @devleejb in https://github.com/yorkie-team/codepair/pull/157
- Add left-right panel scroll sync in markdown edit/preview mode by @devleejb in https://github.com/yorkie-team/codepair/pull/166
- Add support for KaTex in Markdown Preview by @devleejb in https://github.com/yorkie-team/codepair/pull/167
- Update Markdown Preview to Open URLs in New Tab by @devleejb in https://github.com/yorkie-team/codepair/pull/168
- Fix Excessive display of presence in the application by @devleejb in https://github.com/yorkie-team/codepair/pull/170
- Fix bug where selecting the document editing mode again deselects the mode by @devleejb in https://github.com/yorkie-team/codepair/pull/171
- Add yorkie cluster to `docker-compose-full.yml` by @devleejb in https://github.com/yorkie-team/codepair/pull/176
- Update 'Return to Workspace' Button Functionality and Visibility by @devleejb in https://github.com/yorkie-team/codepair/pull/190
- Bump JamesIves/github-pages-deploy-action from 4.5.0 to 4.6.0 by @dependabot in https://github.com/yorkie-team/codepair/pull/189
- Bump JamesIves/github-pages-deploy-action from 4.6.0 to 4.6.1 by @dependabot in https://github.com/yorkie-team/codepair/pull/199
- Fix typo in `.env.example` in backend by @devleejb in https://github.com/yorkie-team/codepair/pull/204
- Remove `.env` from git cache by @devleejb in https://github.com/yorkie-team/codepair/pull/206
- Update yorkie-js-sdk to version 0.4.24 by @hackerwins in https://github.com/yorkie-team/codepair/pull/208
- Update CodePair Workspace Page Layout with Recent Figma Design by @devleejb in https://github.com/yorkie-team/codepair/pull/207
- Ensure Proper Cleanup of Yorkie Initialization Process by @chacha912 in https://github.com/yorkie-team/codepair/pull/210
- Fix Document Count Display Issue and Loading Progress Bar Size in Pagination by @devleejb in https://github.com/yorkie-team/codepair/pull/212
- Change `NODE_ENV` value to 'development' temporarily for enabling Devtools by @devleejb in https://github.com/yorkie-team/codepair/pull/214
- Enable Devtools Flag for Debugging in Production Environment by @devleejb in https://github.com/yorkie-team/codepair/pull/215
- Implement Sentry SourceMap Upload during Build Time for GitHub Page deployment by @devleejb in https://github.com/yorkie-team/codepair/pull/216
- Change working directory of Sentry setup in `./frontend` by @devleejb in https://github.com/yorkie-team/codepair/pull/217
- Modify GitHub Actions Triggering to Include Changes in Action Definition Files by @devleejb in https://github.com/yorkie-team/codepair/pull/218
- Fix issue where SourceMaps were not uploaded even though Sentry keys were correctly registered by @devleejb in https://github.com/yorkie-team/codepair/pull/219
- Add console.log for debugging document sync issue in CodePair by @devleejb in https://github.com/yorkie-team/codepair/pull/221
- Wrap `doc.update` to ensure `doc.update` code is executed only once by @devleejb in https://github.com/yorkie-team/codepair/pull/222
- Add log to snapshot handler by @devleejb in https://github.com/yorkie-team/codepair/pull/225
- Change `GetDocument` API call to `GetDocuments` to prevent consecutive API calls by @devleejb in https://github.com/yorkie-team/codepair/pull/226
- Update `yorkie-js-sdk` to `0.4.26` by @devleejb in https://github.com/yorkie-team/codepair/pull/227
- Remove unused logs by @devleejb in https://github.com/yorkie-team/codepair/pull/229
- Reduce initial project setup cost by introducing Feature Toggle functionality by @devleejb in https://github.com/yorkie-team/codepair/pull/230
- Remove removed types import statement by @devleejb in https://github.com/yorkie-team/codepair/pull/231
- Bump up Yorkie to v0.4.27 by @devleejb in https://github.com/yorkie-team/codepair/pull/232
- update file paths in README.md by @minai621 in https://github.com/yorkie-team/codepair/pull/233
- Fix loading issue of Document when viewing shared documents by moving `useSettingsQuery` Hook globally by @devleejb in https://github.com/yorkie-team/codepair/pull/235
- Add Display additional users in a popover when there are more than 4 users by @KimKyuHoi in https://github.com/yorkie-team/codepair/pull/241
- Update Code to Match GetDocuments API Request Specifications by @kokodak in https://github.com/yorkie-team/codepair/pull/242
- Remove Global Scroll on Document Edit Page by @bishoe01 in https://github.com/yorkie-team/codepair/pull/243
- Add Rename Nickname by @devysi0827 in https://github.com/yorkie-team/codepair/pull/237
- Fix typo in README and Contributing Guide by @choidabom in https://github.com/yorkie-team/codepair/pull/245
- Add Document Export Functionality by @minai621 in https://github.com/yorkie-team/codepair/pull/238
- Disable Markdown Export feature due to inability to build backend in current Docker image by @devleejb in https://github.com/yorkie-team/codepair/pull/246
- Fix build issues in CI by @minai621 in https://github.com/yorkie-team/codepair/pull/248
- Disable Codes Related to Markdown Export by @devleejb in https://github.com/yorkie-team/codepair/pull/249
- Update Dockerfile to Support Export Feature and Enable Export Feature by @krapie in https://github.com/yorkie-team/codepair/pull/251
- Add Korean font to Docker image for language rendering in Markdown Export using Puppeteer by @devleejb in https://github.com/yorkie-team/codepair/pull/252
- Fix document updateAt mapping by @blurfx in https://github.com/yorkie-team/codepair/pull/254
