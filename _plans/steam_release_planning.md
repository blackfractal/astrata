# Steam release and desktop platform planning

Planning draft 0.1 · 2026-10-26 · Jonathan / Codex

Status: planning only. No Steam registration, purchase, upload, release, platform port or account configuration has been performed. Baseline inspected: Astrata 4.0.40, `package.json`, `tools/package.mjs` and `desktop.cjs`.

## Scope and feasibility

Astrata can retain its Electron/JavaScript implementation for a Steam release. The existing standalone Windows package is the starting point; Steam distribution does not require a gameplay rewrite or a special game file format. Upload builds, configure their launch options, and test them through Steam. Integrating Steamworks APIs into the game is optional, although some Steam features require it. [Steam uploads](https://partner.steamgames.com/doc/sdk/uploading), [Steamworks API overview](https://partner.steamgames.com/doc/sdk/api)

A Windows release does not require macOS or Linux support. Plan macOS as a separate workstream; Linux is an optional third workstream. They can share game code and assets, but **a macOS build cannot run on Linux**. Each needs a package containing the appropriate Electron runtime and native executable. CPU architecture matters as well as OS. [Electron packaging](https://www.electronjs.org/docs/latest/tutorial/application-distribution)

| Target | Shared content | Platform-specific deliverable | Proposed scope |
| --- | --- | --- | --- |
| Windows | Game rules, UI, assets, save schema | `Astrata.exe` and supporting files | First Steam test build; existing package needs release cleanup |
| macOS | Same game code and assets | Signed and notarized `Astrata.app` | Separate port and release validation |
| Linux | Same game code and assets | Linux executable and supporting files | Optional later port and release validation |

These are proposed release targets, not claims that untested platforms already work. Additional OS builds can be configured as depots and launch options within the same Steam application. Do not advertise support until the corresponding build has passed testing. [Steam platform setup](https://partner.steamgames.com/doc/store/application/platforms)

## 1. Prepare a clean player distribution

The current packaging script copies the installed Electron runtime, renames `electron.exe`, includes game code/assets, and adds many development reports. It is Windows-specific and is not yet a cross-platform release pipeline.

Planned work:

- Create a reproducible player-package target with an explicit file allowlist. Include the game, runtime dependencies and required license notices. Exclude development reports, replay fixtures, snapshots, command queues, test profiles and unused art variants.
- Keep the existing development distribution available separately if useful. Build player packages in a fresh staging directory so previously copied report files cannot survive into a new release.
- Add Astrata branding, icons and executable/bundle metadata. Evaluate Electron Forge or equivalent maintained packaging tooling rather than extending Windows-only file-copy assumptions to every OS.
- Preserve version identifiers in saves and run archives. Audit every shipped asset reference and package path.
- Validate launch from Steam's install location with no Node, editor or repository present; avoid relying on the working directory or writing into the installation folder.
- Keep settings, Continue, discoveries and local run archives in a writable per-user location. `desktop.cjs` already uses Electron's `app.getPath("userData")`; verify the actual paths and migration behavior on each OS.
- Test offline play, restart/Continue, updates, clean uninstall/reinstall behavior, display scaling, audio, long sessions and crash recovery.

The game rules and UI should remain shared. Packaging, OS integration and platform testing are the expected changes; compatibility is an expectation to verify, not a guarantee of zero game-code changes.

## 2. Steam onboarding and store preparation

Jonathan will need to supply the publishing identity, bank and tax details and approve the Steam agreement and payment. The Steam Direct fee is currently US$100 per product, recoupable after US$1,000 adjusted gross revenue under Valve's terms. Prepare pricing, descriptions, store/library artwork, screenshots, system requirements and the content survey. Submit the store page and build for review. [Steam Direct](https://partner.steamgames.com/steamdirect)

Allow time for onboarding and review. As checked on 2026-10-26, Valve's onboarding documentation says a 21-day fee-to-release wait, while the Steam Direct page still says 30 days; both specify at least two weeks of public Coming Soon visibility. Verify the application's actual eligibility date in Steamworks before promising a launch date. These waits may overlap; they are not engineering effort estimates. [Onboarding](https://partner.steamgames.com/doc/gettingstarted/onboarding), [Steam Direct](https://partner.steamgames.com/steamdirect)

Astrata's shipped AI-generated artwork requires a pre-generated AI disclosure. Describe the actual player-facing uses accurately and review distribution rights for art, fonts, audio and third-party dependencies. Ordinary game decision AI is distinct from live generative content; describe any future live generation separately if introduced. [Content survey](https://partner.steamgames.com/doc/gettingstarted/contentsurvey)

## 3. Upload, testing and updates

- Configure a Windows depot and launch option targeting the packaged `Astrata.exe`.
- Create repeatable SteamPipe upload configuration, with credentials kept outside the repository.
- Upload to a private test branch before public release. Verify download, launch, saves and upgrade behavior through the Steam client on a clean machine/account.
- Use Steam to distribute game updates. Keep a known-good build available for rollback and test save compatibility before promoting a new build.
- Add OS-specific depots and launch settings when macOS or Linux is ready. Share common assets where practical without allowing one OS's executable to overwrite another's.

Steam's upload system handles file delivery and build branches; it does not establish that our game works correctly on every platform. [Steam upload workflow](https://partner.steamgames.com/doc/sdk/uploading)

## 4. Cloud saves and Steam features

Recommended early addition: Steam Cloud for Continue, tutorial completion, discoveries, achievement progress and other persistent player progress. Auto-Cloud can synchronize selected files without implementing the Cloud API. Use OS path overrides if supporting cross-platform saves. [Steam Cloud](https://partner.steamgames.com/doc/features/cloud)

For Astrata specifically:

- Audit which files are authoritative before selecting Cloud patterns; do not synchronize the entire profile with a wildcard.
- Keep large debugging/replay archives, frozen source builds, backups and caches local by default. Preserve local run recording for statistics/debugging.
- Decide how multiple Steam accounts on one computer get separate progress. The current single user-data directory should not silently mix their saves.
- Test interrupted sync, offline sessions, conflicts, switching computers, and Windows-to-Mac/Linux transfers if those platforms are supported. Do not silently overwrite a newer run with an older cloud copy.
- Keep machine-specific display settings local unless there is a deliberate reason to sync them.

Optional integrations: map existing achievement events to Steam achievements; add rich presence and test overlay behavior. Evaluate a maintained Electron-compatible Steamworks binding and its native binaries for every supported architecture before choosing one. Preserve offline operation and account for previously earned achievements. These features are separate from basic upload/launch compatibility. [Steamworks API overview](https://partner.steamgames.com/doc/sdk/api)

## 5. macOS workstream

Build a real macOS application bundle from the shared source. The Windows `.exe` cannot simply be renamed or placed in a Mac wrapper. Choose Apple Silicon support first or Apple Silicon plus Intel; do not promise Intel support until runtime/tooling compatibility and test hardware are confirmed.

Release preparation needs a macOS build/signing environment, Apple Developer credentials and certificates, and signing/notarization automation. Steam documents notarization and 64-bit requirements for new Mac applications. Follow current Electron and Steam entitlement guidance, including overlay/native-library compatibility; this is a Steam distribution, not a Mac App Store submission. [Electron signing](https://www.electronjs.org/docs/latest/tutorial/code-signing), [Steam macOS requirements](https://partner.steamgames.com/doc/store/application/platforms)

Astrata validation should cover trackpad dragging, double-click targeting, hover tooltips, keyboard modifiers, Retina scaling, fullscreen, window closing/reopening, sound, save paths and archive writes. Test the actual signed, notarized, Steam-installed bundle on supported hardware. Set minimum macOS versions from the chosen Electron release and real tests, not old minimums quoted in general Steam documentation.

## 6. Optional Linux and Steam Deck workstream

Produce a Linux Electron package with the same shared game source. Linux does not use Apple's `.app`, signing certificates or notarization. Select supported architectures/distributions and verify runtime libraries, file permissions, case-sensitive asset paths, display behavior, audio and per-user saves. Test both relevant Linux desktop environments and the Steam-installed build.

Steam Deck is a separate usability target: its screen, controls and suspend/resume need validation. A Linux build alone does not establish controller support or Deck verification. Testing the Windows build through Proton is another possible route, but should not be advertised as supported until verified. Do not expand the first Steam milestone into mandatory Linux/Deck work.

## Delivery sequence and completion criteria

1. **Windows private build:** clean packaging, repeatable upload, successful Steam installation/launch/update, and working saves on a clean machine.
2. **Player release preparation:** store material, disclosures, rights/license review, measured system requirements, broader playtesting and a support/update process. Decide full release versus Early Access separately.
3. **Cloud/progress:** configured file selection and successful multi-device/account testing; optional Steam achievement integration.
4. **macOS:** functioning signed/notarized bundle, correct depot/launch configuration and verified play/save/update behavior on each advertised architecture.
5. **Optional Linux/Deck:** equivalent platform-specific validation before adding supported-platform claims.

Completion means a player can install from Steam, start tutorials/a normal run, save/Continue, reach the S4 win screen, exit and receive updates without needing development tools. Existing deterministic replay and automated tests should continue to pass, but cannot replace platform UI and Steam-client testing.

Remaining planning decisions: Windows-only first versus a simultaneous Mac launch; Apple Silicon/Intel coverage; availability of a Mac or macOS CI runner; Steam feature priorities; cloud-account isolation; store pricing and release model. No engine migration is anticipated. The Windows packaging step is smaller than the overall public-release effort; estimate implementation time after the first clean Steam build and macOS feasibility check.
