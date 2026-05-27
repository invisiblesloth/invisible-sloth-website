---
layout: ../../layouts/LegalDocumentLayout.astro
title: Tracer Privacy Policy
description: Privacy policy for Tracer, the local-only iOS time tracker from Invisible Sloth, LLC.
canonicalUrl: https://invisiblesloth.com/tracer/privacy
---

# Tracer Privacy Policy

## The short version

Tracer is a local-only time tracker. Everything you create in Tracer – your activities, time entries, and notes – stays on your device unless you choose to export, import, share, or send it somewhere else. Invisible Sloth, LLC does not automatically collect or receive your Tracer app data.

---

## 1. What this policy covers

This policy describes how Tracer, the iOS app published by Invisible Sloth, LLC, handles information. It covers the Tracer iOS app only. It does not cover Apple's App Store, TestFlight, or websites outside the app.

## 2. Information you create in the app

When you use Tracer, you create data locally on your device:

- **Activities** – names, optional notes, colors, ordering, archive state, and related timestamps
- **Time entries** – start times, end times, durations, time zones, source type, and optional notes
- **App preferences** – settings you configure within the app

This data belongs to you. It is stored in a local SQLite database on your iPhone. It is not automatically transmitted to Invisible Sloth, LLC or to any third party. It leaves your device only if you explicitly export or share it, or if you send it to someone through a support or feedback channel.

Tracer treats activity names, entry notes, and other user-created text as opaque content. The app does not categorize, analyze, or transmit that text to Invisible Sloth, LLC.

## 3. Information we do not collect

Tracer does not automatically collect, transmit, or receive:

- Account information
- Location data
- Device identifiers or advertising IDs
- Usage analytics or behavioral data
- Crash reports or diagnostic data sent directly to Invisible Sloth, LLC
- Contacts, photos, camera, or audio recording data
- Information linked to your identity

Tracer has no accounts, no sign-up flow, no advertising SDK, no analytics SDK, no crash-reporting SDK, and no server backend.

## 4. Third-party code and SDKs

Tracer uses one third-party library:

- <a href="https://github.com/groue/GRDB.swift" target="_blank" rel="noopener noreferrer"><strong>GRDB</strong></a> – an open-source Swift library for reading and writing SQLite databases locally on your device. GRDB makes no network calls and collects no data. It is a file-access library, not a service.

Tracer does not include analytics SDKs, crash-reporting SDKs, advertising SDKs, or other third-party SDKs that communicate over the network.

If we add third-party libraries in the future that affect data practices, we will update this policy and our App Privacy disclosure in App Store Connect before shipping those changes.

## 5. Data export, import, and sharing

Tracer includes data export and import.

- **JSON backup export** creates a backup file that includes your Tracer activities, entries, notes, timestamps, time zones, and backup metadata such as app version, build number, bundle identifier, platform, export time, and schema version.
- **CSV export** creates a spreadsheet-friendly entries file with start time, end time, duration, activity name, and notes.
- **JSON import** lets you choose a Tracer JSON backup file from your device and restore it into Tracer.

When you export, Tracer presents the iOS share sheet. You choose where to send the exported file, such as Files, email, or another destination you select. Invisible Sloth, LLC has no visibility into where you send exports or what happens to them after they leave your device.

When you import, Tracer reads the JSON backup file you choose. Import does not send that file to Invisible Sloth, LLC.

Exported files may contain the activity names, time entries, notes, and other information you created in Tracer. Tracer export files are not encrypted by Tracer, so keep that in mind when choosing where to save or send them.

## 6. Apple platform services

Tracer is currently distributed for beta testing through TestFlight and may later be distributed through Apple's App Store. Apple operates those platforms under Apple's own terms and privacy policies.

For TestFlight builds, Apple may process tester, feedback, diagnostic, crash, session, screenshot, comment, device, and operating-system information as part of TestFlight and App Store Connect. Depending on how feedback is submitted and how a tester was invited, some of that information may be visible to Invisible Sloth, LLC through Apple's App Store Connect tools so we can review beta feedback and investigate issues.

That Apple platform processing is separate from Tracer's local app data storage. Tracer itself does not automatically send your activity, entry, note, or preference data to Invisible Sloth, LLC.

Apple's privacy practices are governed by <a href="https://www.apple.com/legal/privacy/" target="_blank" rel="noopener noreferrer">Apple's Privacy Policy</a>.

## 7. Data retention, deletion, and security

Because Tracer stores its app data locally on your device, you control retention and deletion:

- **Delete specific entries or activities** – use the in-app delete actions.
- **Delete all Tracer data** – delete the app from your iPhone. iOS removes the app's local database and associated app files from your device when the app is uninstalled.

Invisible Sloth, LLC does not retain copies of your Tracer app data on a server. There is no Tracer account to close and no server-side deletion request needed.

**Device backups:** If your device backs up to iCloud or to a computer through Finder, or through iTunes on earlier macOS versions, Tracer's local database may be included in those system-level backups. Those backups are managed by Apple and iOS, not by Tracer. Uninstalling the app removes Tracer data from your device, but historical backup copies may persist until you manage them through your iCloud or device backup settings.

**Exported files:** Files you export from Tracer are controlled by you and by the destination you choose. Deleting Tracer does not delete exported files you saved elsewhere.

**How we protect data:** Tracer data is stored locally in the iOS app sandbox, and Tracer does not automatically transmit this data to Invisible Sloth, LLC. The security of your data also depends on your device security settings, your backup settings, and the destinations you choose when exporting or sharing. No method of electronic storage or transmission is 100% secure.

## 8. Future features that may change this policy

We will update this document and the App Privacy disclosures in App Store Connect before shipping changes that affect data practices. Examples include:

- Cloud sync or backup
- Analytics, crash-reporting, advertising, or tracking SDKs
- New third-party SDKs that collect data or make network calls
- Website analytics, hosted forms, cookies, third-party embeds, or other website processing that changes how Tracer support or legal pages handle information

## 9. Children's privacy

Tracer is a general-audience app and is not directed to children under 13. We do not knowingly collect personal information from children under 13 through the Tracer app. If you have questions, contact us using the email address below.

## 10. Regional privacy rights

Depending on where you live, you may have privacy rights under local law, including California privacy laws, GDPR, or UK GDPR. Because Tracer stores app data locally on your device and does not automatically transmit that data to Invisible Sloth, LLC, requests to access, delete, or correct Tracer app data can usually be handled directly on your device.

If you contact us for support, we will use the information you send to respond to your request.

## 11. Changes to this policy

This policy describes our current data practices. Where this policy describes security, it describes controls currently in the product.

When we make material changes to this policy, we will update the effective date at the top. For changes that affect data practices, we will update App Store Connect privacy disclosures before shipping the corresponding app version. A short changelog is maintained at the bottom of this document.

## 12. Contact

If you have questions about this policy or Tracer's privacy practices, contact us:

**Invisible Sloth, LLC**  
Email: [support@invisiblesloth.com](mailto:support@invisiblesloth.com)

Related links:

- [Tracer](/tracer)
- [Terms of Use](/tracer/terms)
- [Support](/tracer#support)

---

## Changelog

**Effective date:** 2026-05-19  
**Last updated:** 2026-05-27

<div class="legal-document__table-scroll">
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Version</th>
        <th>Change</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>2026-05-27</td>
        <td>1.1</td>
        <td>Clarified current TestFlight distribution, linked GRDB, and refined future-change examples</td>
      </tr>
      <tr>
        <td>2026-05-19</td>
        <td>1.0</td>
        <td>Initial version published</td>
      </tr>
    </tbody>
  </table>
</div>
