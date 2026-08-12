<script>
  import {
    onDestroy
  } from 'svelte';


  let {
    form
  } = $props();

  let jsonFileName =
    $state('No JSON selected');

  let imageNames =
    $state([]);

  let imagePreviews =
    $state([]);


  function selectJson(event) {
    jsonFileName =
      event.currentTarget.files?.[0]?.name ??
      'No JSON selected';
  }


  function selectImages(event) {
    revokePreviews();

    imagePreviews =
      [...(event.currentTarget.files ?? [])]
        .map((file) => ({
          name: file.name,
          url: URL.createObjectURL(file)
        }));

    imageNames =
      imagePreviews.map(
        (preview) => preview.name
      );
  }


  function revokePreviews() {
    for (const preview of imagePreviews) {
      URL.revokeObjectURL(preview.url);
    }
  }


  onDestroy(revokePreviews);
</script>


<svelte:head>
  <title>Question Bundle Import</title>
</svelte:head>


<main class="import-page">
  <header class="page-header">
    <div>
      <p class="eyebrow">Content administration</p>
      <h1>Import a question bundle</h1>
      <p class="intro">
        Select one question-bank JSON file and every local image it references.
        The filenames are matched before the test is saved.
      </p>
    </div>

    <a class="back-link" href="/admin/tests">
      ← Tests
    </a>
  </header>

  <section class="workflow" aria-label="Bundle structure">
    <div>
      <span>01</span>
      <strong>Question JSON</strong>
      <small>Metadata, scoring and questions</small>
    </div>
    <i aria-hidden="true">+</i>
    <div>
      <span>02</span>
      <strong>Referenced figures</strong>
      <small>PNG, JPEG, WebP or safe SVG</small>
    </div>
    <i aria-hidden="true">→</i>
    <div>
      <span>03</span>
      <strong>Validated test</strong>
      <small>Images travel with their questions</small>
    </div>
  </section>

  <form method="POST" enctype="multipart/form-data">
    <div class="bundle-inputs">
      <label class="file-panel">
        <span class="panel-index">JSON</span>
        <strong>Question bank</strong>
        <small>.json · maximum 2 MB</small>
        <input
          type="file"
          name="questionBankFile"
          accept="application/json,.json"
          onchange={selectJson}
        />
        <em>{jsonFileName}</em>
      </label>

      <label class="file-panel">
        <span class="panel-index">MEDIA</span>
        <strong>Question figures</strong>
        <small>Up to 1 MB each · 6 MB total</small>
        <input
          type="file"
          name="questionImages"
          accept="image/png,image/jpeg,image/webp,image/svg+xml,.svg"
          multiple
          onchange={selectImages}
        />
        <em>
          {imageNames.length > 0
            ? `${imageNames.length} image${imageNames.length === 1 ? '' : 's'} selected`
            : 'No images selected'}
        </em>
      </label>
    </div>

    {#if imageNames.length > 0}
      <div class="asset-list" aria-label="Selected image files">
        {#each imagePreviews as preview}
          <figure>
            <img src={preview.url} alt="" />
            <figcaption>{preview.name}</figcaption>
          </figure>
        {/each}
      </div>
    {/if}

    <details class="paste-fallback">
      <summary>Or paste JSON directly</summary>
      <p>
        Pasted JSON can use hosted HTTPS images. Local image references still
        require the matching files above.
      </p>
      <textarea
        name="questionBank"
        rows="15"
        spellcheck="false"
        placeholder={'{ "meta": { ... }, "questions": [ ... ] }'}
      ></textarea>
    </details>

    <div class="format-note">
      <div>
        <span>Image fields</span>
        <code>"image": "/question-assets/diagram.svg"</code>
        <code>"image_alt": "Description of the diagram"</code>
      </div>

      <div>
        <span>Try the included sample</span>
        <a href="/samples/visual-question-bank.json" download>
          Sample JSON ↓
        </a>
        <a href="/samples/sample-force-diagram.svg" download>
          Sample figure ↓
        </a>
      </div>
    </div>

    {#if form?.error}
      <section class="message error-message" role="alert">
        <strong>Bundle not imported</strong>
        <p>{form.error}</p>

        {#if form.validationErrors}
          <ul>
            {#each form.validationErrors as validationError}
              <li>{validationError}</li>
            {/each}
          </ul>
        {/if}
      </section>
    {/if}

    <button class="import-button" type="submit">
      Validate and import bundle
      <span aria-hidden="true">→</span>
    </button>
  </form>

  {#if form?.success}
    <section class="message success-message" aria-live="polite">
      <div>
        <span>Import completed</span>
        <h2>{form.result.testId}</h2>
      </div>

      <dl>
        <div>
          <dt>Questions</dt>
          <dd>{form.result.receivedCount}</dd>
        </div>
        <div>
          <dt>Inserted</dt>
          <dd>{form.result.insertedCount}</dd>
        </div>
        <div>
          <dt>Updated</dt>
          <dd>{form.result.updatedCount}</dd>
        </div>
        <div>
          <dt>Images matched</dt>
          <dd>{form.bundle.matchedImageCount}</dd>
        </div>
      </dl>

      {#if form.bundle.unusedAssets.length > 0}
        <p>
          Unused files: {form.bundle.unusedAssets.join(', ')}
        </p>
      {/if}

      <a href={`/admin/tests/${form.result.testId}`}>
        Review imported test →
      </a>
    </section>
  {/if}
</main>


<style>
  .import-page {
    width: min(1060px, calc(100% - 32px));
    margin: 0 auto;
    padding: var(--space-8) 0 80px;
  }

  .page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-6);
    padding-bottom: var(--space-6);
    border-bottom: 1px solid var(--border);
  }

  .eyebrow,
  h1,
  .intro,
  .paste-fallback p,
  .message p {
    margin: 0;
  }

  .eyebrow,
  .panel-index,
  .format-note span,
  .message > div > span,
  dt {
    color: var(--text-muted);
    font-family: var(--font-metadata);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.09em;
    text-transform: uppercase;
  }

  h1 {
    margin-top: var(--space-2);
    color: var(--text);
    font-family: var(--font-heading);
    font-size: clamp(30px, 5vw, 56px);
    font-weight: 600;
    letter-spacing: -0.035em;
  }

  .intro {
    max-width: 660px;
    margin-top: var(--space-3);
    color: var(--text-muted);
    line-height: 1.6;
  }

  .back-link,
  .format-note a,
  .success-message > a {
    color: var(--primary);
    text-decoration: none;
  }

  .workflow {
    display: grid;
    grid-template-columns: 1fr auto 1fr auto 1fr;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-6) 0;
    border-bottom: 1px solid var(--border-soft);
  }

  .workflow div {
    display: grid;
    gap: 4px;
  }

  .workflow span {
    color: var(--primary);
    font-family: var(--font-metadata);
    font-size: 11px;
  }

  .workflow strong {
    color: var(--text);
    font-family: var(--font-ui);
  }

  .workflow small,
  .file-panel small {
    color: var(--text-muted);
  }

  .workflow i {
    color: var(--text-muted);
    font-style: normal;
  }

  form {
    display: grid;
    gap: var(--space-5);
    padding-top: var(--space-6);
  }

  .bundle-inputs {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-4);
  }

  .file-panel {
    min-height: 210px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: var(--space-2);
    padding: var(--space-6);
    background: var(--surface);
    border: 1px solid var(--border);
    cursor: pointer;
  }

  .file-panel:hover {
    border-color: var(--primary);
  }

  .file-panel strong {
    color: var(--text);
    font-family: var(--font-heading);
    font-size: 24px;
  }

  .file-panel input {
    width: 100%;
    margin-top: var(--space-3);
    color: var(--text-muted);
  }

  .file-panel input::file-selector-button {
    margin-right: var(--space-3);
    padding: 8px 12px;
    background: transparent;
    color: var(--text);
    border: 1px solid var(--border);
    cursor: pointer;
  }

  .file-panel em {
    color: var(--primary);
    font-family: var(--font-metadata);
    font-size: 11px;
    font-style: normal;
  }

  .asset-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: var(--space-2);
  }

  .asset-list figure {
    min-width: 0;
    margin: 0;
    padding: var(--space-2);
    background: var(--surface);
    border: 1px solid var(--border-soft);
  }

  .asset-list img {
    width: 100%;
    height: 92px;
    display: block;
    object-fit: contain;
  }

  .asset-list figcaption {
    overflow: hidden;
    margin-top: var(--space-2);
    color: var(--text-muted);
    font-family: var(--font-metadata);
    font-size: 10px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .paste-fallback {
    border-top: 1px solid var(--border-soft);
    border-bottom: 1px solid var(--border-soft);
  }

  .paste-fallback summary {
    padding: var(--space-4) 0;
    color: var(--text);
    cursor: pointer;
  }

  .paste-fallback p {
    padding-bottom: var(--space-3);
    color: var(--text-muted);
    font-size: 13px;
  }

  textarea {
    width: 100%;
    resize: vertical;
    padding: var(--space-4);
    background: var(--surface);
    color: var(--text);
    border: 1px solid var(--border);
    font-family: var(--font-metadata);
    line-height: 1.55;
  }

  .format-note {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: var(--space-6);
    padding: var(--space-4);
    background: var(--surface);
    border-left: 3px solid var(--primary);
  }

  .format-note div {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-3);
  }

  code {
    color: var(--text-muted);
    font-family: var(--font-metadata);
    font-size: 11px;
  }

  .import-button {
    width: 100%;
    min-height: 58px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 var(--space-5);
    background: var(--primary);
    color: var(--primary-text);
    border: 0;
    font-family: var(--font-ui);
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
  }

  .message {
    margin-top: var(--space-6);
    padding: var(--space-5);
    border: 1px solid var(--border);
  }

  .error-message {
    color: var(--danger);
    border-color: var(--danger);
  }

  .error-message p,
  .error-message ul {
    color: var(--text-muted);
  }

  .success-message {
    display: grid;
    gap: var(--space-5);
    border-color: var(--success);
  }

  .success-message h2 {
    margin: var(--space-1) 0 0;
    color: var(--text);
  }

  dl {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    margin: 0;
    border-top: 1px solid var(--border-soft);
    border-bottom: 1px solid var(--border-soft);
  }

  dl div {
    padding: var(--space-4);
    border-right: 1px solid var(--border-soft);
  }

  dl div:last-child {
    border-right: 0;
  }

  dd {
    margin: var(--space-2) 0 0;
    color: var(--text);
    font-family: var(--font-heading);
    font-size: 26px;
  }

  @media (max-width: 760px) {
    .page-header,
    .format-note {
      grid-template-columns: 1fr;
    }

    .page-header {
      flex-direction: column;
    }

    .workflow {
      grid-template-columns: 1fr;
    }

    .workflow i {
      display: none;
    }

    .bundle-inputs {
      grid-template-columns: 1fr;
    }

    dl {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    dl div:nth-child(2) {
      border-right: 0;
    }

    dl div:nth-child(-n + 2) {
      border-bottom: 1px solid var(--border-soft);
    }
  }
</style>
