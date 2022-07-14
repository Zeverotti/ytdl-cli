import http, { IncomingMessage, ServerResponse } from 'http';
import url from 'url';

const catchCode = (onCode: (code: string) => void): Promise<http.Server> => {
  return new Promise((resolve, reject) => {
    const host = 'localhost';

    const requestListener = function (
      req: IncomingMessage,
      res: ServerResponse
    ) {
      if (!req.url) return;
      const queryObject = url.parse(req.url, true).query;
      if (!queryObject.code) return res.writeHead(400).end();
      onCode(queryObject.code.toString());
      res.writeHead(200);
      res.end('Code received, you can close this page');
    };

    const server = http.createServer(requestListener);
    server.listen(0, host, () => {
      resolve(server);
      const address = server.address();
      if (typeof address === 'string' || !address) return;
    });
  });
};

export default catchCode;
