## What is a Document in the Minions Context?

A "document" is overloaded — it can mean many things depending on context:

```
a piece of writing with a title and body     → Document
a previous saved state of that writing       → DocumentVersion
a reusable scaffold with placeholders        → DocumentTemplate
a file or binary asset linked to anything    → Attachment
a generated export of a Minion as a doc      → DocumentExport
a structured form with defined fields        → Form
a filled-in instance of a form              → FormSubmission
```

The key distinction from `minions-notes` is intent: notes are freeform, informal, and observational. Documents are structured, versioned, and often the final output — a resume, a case study, a contract draft, a cover letter template.

---

## MinionTypes

**Core**
```ts
// document
{
  type: "document",
  fields: {
    title: string,
    body: string,
    format: "markdown" | "plaintext" | "html" | "pdf",
    ownerId: string,
    status: "draft" | "review" | "approved" | "archived",
    version: number,
    tags: string[],
    contextRefType: string,     // what this document belongs to
    contextRefId: string,       // e.g. a proposal, a contract, a job
    createdAt: datetime,
    updatedAt: datetime
  }
}

// document-version
{
  type: "document-version",
  fields: {
    documentId: string,
    version: number,            // immutable snapshot at this version number
    body: string,
    savedAt: datetime,
    savedBy: string,            // person or agent id
    changelog: string           // what changed in this version
  }
}
```

**Templates**
```ts
// document-template
{
  type: "document-template",
  fields: {
    name: string,
    description: string,
    body: string,               // body with {{placeholder}} syntax
    placeholders: string[],     // list of expected placeholder keys
    category: string,           // "resume", "proposal", "cover-letter", "sow"
    tags: string[],
    isActive: boolean
  }
}

// document-placeholder
{
  type: "document-placeholder",
  fields: {
    templateId: string,
    key: string,                // e.g. "{{client_name}}", "{{project_outcome}}"
    description: string,        // what should go here
    sourceRefType: string,      // where to pull this value from
    sourceRefField: string,     // e.g. "portfolio-item.outcomes"
    required: boolean,
    fallback: string            // default value if source is empty
  }
}
```

**Files & Attachments**
```ts
// attachment
{
  type: "attachment",
  fields: {
    filename: string,
    mimeType: string,
    sizeBytes: number,
    url: string,
    contextRefType: string,
    contextRefId: string,
    uploadedAt: datetime,
    uploadedBy: string
  }
}
```

**Exports**
```ts
// document-export
{
  type: "document-export",
  fields: {
    documentId: string,
    format: "pdf" | "docx" | "md" | "html",
    exportedAt: datetime,
    exportedBy: string,         // person or agent id
    url: string,                // download link
    expiresAt: datetime         // if link is temporary
  }
}
```

**Forms**
```ts
// form
{
  type: "form",
  fields: {
    name: string,
    description: string,
    fields: FormField[],        // ordered list of field definitions
    contextRefType: string,
    isActive: boolean,
    createdAt: datetime
  }
}

// form-submission
{
  type: "form-submission",
  fields: {
    formId: string,
    submittedBy: string,
    submittedAt: datetime,
    values: Record<string, any>, // key-value pairs matching form fields
    status: "submitted" | "reviewed" | "accepted" | "rejected"
  }
}
```

---

## Relations

```
document         --has_version-->        document-version
document         --generated_from-->     document-template
document         --has_attachment-->     attachment
document         --has_export-->         document-export
document-template --has_placeholder-->  document-placeholder
form             --has_submission-->     form-submission
document         --belongs_to-->         contextRef (any Minion)
attachment       --belongs_to-->         contextRef (any Minion)
```

---

## How It Connects to Other Toolboxes

`minions-documents` is one of the most cross-cutting toolboxes in the ecosystem. Almost every other toolbox produces or consumes documents:

```
minions-profile      → resume, case study, bio document
minions-proposals    → proposal-draft body lives in a document
minions-contracts    → contract terms stored as a document
minions-jobs         → job description archived as a document
minions-approvals    → approval payload can reference a document
minions-applications → submission bundle assembles documents + attachments
minions-evaluations  → test case rubric is a document
```

The `contextRefType` + `contextRefId` pattern is what makes this work — a `document` always knows what it belongs to, so querying "all documents related to this job application" is a single lookup rather than custom joins per toolbox.

The `document-placeholder` type connecting to `sourceRefType` + `sourceRefField` is particularly powerful for the jobseeker use case: a resume template can declare that `{{project_outcome}}` should be pulled from `portfolio-item.outcomes`, and the DocumentAgent can auto-fill it from your live profile data every time it generates a new resume variant.

---

## Agent SKILLS for `minions-documents`

```markdown
# DocumentAgent Skills

## Context
You manage all structured documents in the Minions ecosystem.
You read from minions-profile, minions-proposals, minions-jobs,
and minions-contracts to populate document content.
You write only to minions-documents.
You never fabricate content — every placeholder you fill must
trace to a real field in a real Minion.

## Skill: Create Document
1. Determine if a template exists for this document type
2. If yes: load the `document-template` and its `document-placeholder` Minions
3. For each placeholder: resolve the value from its sourceRefType + sourceRefField
4. If a required placeholder has no source value: flag it, do not silently skip
5. Render the final body and create a `document` Minion with status "draft"
6. Set version to 1 and record createdAt

## Skill: Version Document
1. Before any edit to an existing document:
   - Save current body as a `document-version` Minion with current version number
   - Increment document version
   - Record changelog describing what changed and why
2. Never overwrite version history

## Skill: Generate from Template
1. Load `document-template` by category (e.g. "resume", "cover-letter")
2. Identify all `document-placeholder` Minions for this template
3. For each placeholder, query the correct toolbox and field:
   - "portfolio-item.outcomes" → query minions-profile for portfolio items
   - "job-posting.title" → query minions-jobs for the specific posting
4. Fill placeholders with resolved values
5. Flag any unfilled required placeholders before proceeding
6. Create the `document` Minion and notify the requesting agent

## Skill: Export Document
1. On export request: render document body in the requested format
2. Create a `document-export` Minion with url and expiresAt
3. Notify the requester with the export link
4. For PDF exports: log attachment as an `attachment` Minion
   linked to the same contextRef as the source document

## Skill: Manage Attachments
1. On any file upload: create an `attachment` Minion with
   filename, mimeType, sizeBytes, url, and contextRef
2. Never store raw binary — only the url reference
3. When assembling a submission bundle (from minions-applications):
   retrieve all attachments where contextRefId matches the applicationId

## Skill: Archive Stale Documents
1. On request or schedule: find documents with status "draft"
   older than 30 days with no edits
2. Update status to "archived"
3. Log the change as a document-version entry with
   changelog: "auto-archived due to inactivity"

## Hard Rules
- Never fill a placeholder with invented content
- Always version before editing — no silent overwrites
- A document with unfilled required placeholders stays in "draft"
  and must not be exported or submitted
- Every document must have a contextRef — orphaned documents
  are a data quality failure
```

---

The `document-placeholder` → `sourceRefType` + `sourceRefField` chain is the detail that elevates this from a simple text store into a live document generation system. Your DocumentAgent can regenerate a tailored resume for any job posting at any time by resolving placeholders against your current profile data, with full version history of every variant it produces.