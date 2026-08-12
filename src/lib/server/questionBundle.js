const MAX_JSON_BYTES = 2 * 1024 * 1024;
const MAX_IMAGE_BYTES = 1024 * 1024;
const MAX_BUNDLE_IMAGE_BYTES = 6 * 1024 * 1024;

const IMAGE_TYPES = new Map([
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.svg', 'image/svg+xml']
]);


export async function readQuestionBundle(
  formData
) {
  const jsonFile =
    formData.get('questionBankFile');

  const pastedJson =
    formData.get('questionBank');

  let jsonText = '';

  if (isUploadedFile(jsonFile)) {
    if (jsonFile.size > MAX_JSON_BYTES) {
      throw new Error(
        'Question-bank JSON must be 2 MB or smaller.'
      );
    }

    jsonText = await jsonFile.text();
  } else if (
    typeof pastedJson === 'string'
  ) {
    jsonText = pastedJson;
  }

  if (jsonText.trim().length === 0) {
    throw new Error(
      'Choose a question-bank JSON file or paste its contents.'
    );
  }

  let questionBank;

  try {
    questionBank = JSON.parse(jsonText);
  } catch {
    throw new Error(
      'The supplied question bank is not valid JSON.'
    );
  }

  const uploadedImages =
    formData
      .getAll('questionImages')
      .filter(isUploadedFile);

  const assets =
    await prepareImageAssets(uploadedImages);

  const usedAssets = new Set();
  const missingAssets = [];
  let matchedImageCount = 0;
  let hostedImageCount = 0;

  for (
    const [index, question]
      of (questionBank.questions ?? []).entries()
  ) {
    if (
      !question ||
      typeof question !== 'object' ||
      !question.image
    ) {
      continue;
    }

    if (isHostedImage(question.image)) {
      hostedImageCount += 1;
      continue;
    }

    const assetName =
      getAssetName(question.image);

    const asset =
      assets.get(assetName.toLowerCase());

    if (!asset) {
      missingAssets.push(
        `Question ${index + 1} references “${assetName}”, but that image was not selected.`
      );
      continue;
    }

    question.image = asset.dataUrl;
    usedAssets.add(asset.key);
    matchedImageCount += 1;
  }

  if (missingAssets.length > 0) {
    throw new Error(missingAssets.join(' '));
  }

  const unusedAssets =
    [...assets.values()]
      .filter((asset) =>
        !usedAssets.has(asset.key)
      )
      .map((asset) => asset.name);

  return {
    questionBank,
    bundle: {
      jsonFileName:
        isUploadedFile(jsonFile)
          ? jsonFile.name
          : null,
      selectedImageCount:
        uploadedImages.length,
      matchedImageCount,
      hostedImageCount,
      unusedAssets
    }
  };
}


async function prepareImageAssets(files) {
  const assets = new Map();
  let totalBytes = 0;

  for (const file of files) {
    const extension =
      getExtension(file.name);

    const mimeType =
      IMAGE_TYPES.get(extension);

    if (!mimeType) {
      throw new Error(
        `“${file.name}” is not a supported PNG, JPEG, WebP, or SVG image.`
      );
    }

    if (file.size > MAX_IMAGE_BYTES) {
      throw new Error(
        `“${file.name}” exceeds the 1 MB per-image limit.`
      );
    }

    totalBytes += file.size;

    if (totalBytes > MAX_BUNDLE_IMAGE_BYTES) {
      throw new Error(
        'The selected images exceed the 6 MB bundle limit.'
      );
    }

    const key =
      getAssetName(file.name).toLowerCase();

    if (assets.has(key)) {
      throw new Error(
        `The bundle contains more than one image named “${file.name}”.`
      );
    }

    const bytes =
      Buffer.from(
        await file.arrayBuffer()
      );

    if (mimeType === 'image/svg+xml') {
      validateSvg(bytes, file.name);
    }

    assets.set(key, {
      key,
      name: file.name,
      dataUrl:
        `data:${mimeType};base64,${bytes.toString('base64')}`
    });
  }

  return assets;
}


function validateSvg(bytes, name) {
  const svg =
    bytes.toString('utf8');

  if (!/<svg[\s>]/i.test(svg)) {
    throw new Error(
      `“${name}” does not contain valid SVG markup.`
    );
  }

  if (
    /<script|<foreignObject|\bon\w+\s*=|javascript:/i.test(svg)
  ) {
    throw new Error(
      `“${name}” contains active SVG content and cannot be imported.`
    );
  }
}


function isUploadedFile(value) {
  return Boolean(
    value &&
    typeof value === 'object' &&
    typeof value.name === 'string' &&
    value.name.length > 0 &&
    typeof value.arrayBuffer === 'function'
  );
}


function isHostedImage(value) {
  return (
    typeof value === 'string' &&
    (
      /^https:\/\//i.test(value) ||
      /^data:image\//i.test(value)
    )
  );
}


function getAssetName(value) {
  const cleanValue =
    String(value)
      .split(/[?#]/, 1)[0]
      .replace(/\\/g, '/');

  return decodeURIComponent(
    cleanValue.split('/').pop() ?? ''
  );
}


function getExtension(name) {
  const assetName =
    getAssetName(name);

  const dotIndex =
    assetName.lastIndexOf('.');

  return dotIndex >= 0
    ? assetName.slice(dotIndex).toLowerCase()
    : '';
}
