import { registerMvuSchema } from 'https://testingcf.jsdelivr.net/gh/eumenes12ds/ASTRAEA-JP@v1.5.3/static/vendor/mvu-zod-stagedog-4b3ce613.esm.js';

import { Schema } from './schema.ts';

$(() => {
  registerMvuSchema(Schema);
});
