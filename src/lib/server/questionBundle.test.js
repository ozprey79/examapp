import test from 'node:test';
import assert from 'node:assert/strict';

import {
  readQuestionBundle
} from './questionBundle.js';


const bank = {
  meta: {
    id: 'bundle-test',
    title: 'Bundle test',
    duration_minutes: 5
  },
  scoring: {
    correct: 2,
    wrong: -0.66,
    skipped: 0
  },
  questions: [
    {
      id: 'q1',
      m: 'M1',
      s: 'Topic',
      t: 'Question with a figure',
      image: '/question-assets/diagram.svg',
      image_alt: 'Two force arrows.',
      o: ['A', 'B'],
      a: 0
    }
  ]
};


test(
  'matches a local image reference by filename',
  async () => {
    const form = createForm(
      '<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0h10"/></svg>'
    );

    const result =
      await readQuestionBundle(form);

    assert.equal(
      result.bundle.matchedImageCount,
      1
    );

    assert.match(
      result.questionBank.questions[0].image,
      /^data:image\/svg\+xml;base64,/
    );
  }
);


test(
  'rejects a bundle with a missing referenced image',
  async () => {
    const form = new FormData();

    form.set(
      'questionBankFile',
      jsonFile(bank)
    );

    await assert.rejects(
      () => readQuestionBundle(form),
      /diagram\.svg.*not selected/
    );
  }
);


test(
  'rejects active content in an uploaded SVG',
  async () => {
    const form = createForm(
      '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'
    );

    await assert.rejects(
      () => readQuestionBundle(form),
      /active SVG content/
    );
  }
);


function createForm(svg) {
  const form = new FormData();

  form.set(
    'questionBankFile',
    jsonFile(bank)
  );

  form.append(
    'questionImages',
    new File(
      [svg],
      'diagram.svg',
      {
        type: 'image/svg+xml'
      }
    )
  );

  return form;
}


function jsonFile(value) {
  return new File(
    [JSON.stringify(value)],
    'questions.json',
    {
      type: 'application/json'
    }
  );
}
