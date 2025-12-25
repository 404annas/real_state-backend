import nextConnect from 'next-connect';
import { app } from '../../src/app.js';

const handler = nextConnect();

// Pass all requests to the Express app
handler.all(async (req, res) => {
  // Since we're importing the express app directly, we can use it
  // but we need to make sure it handles the request properly
  app(req, res);
});

export default handler;

export const config = {
  api: {
    externalResolver: true,
    bodyParser: {
      sizeLimit: '16mb',
    },
  },
};