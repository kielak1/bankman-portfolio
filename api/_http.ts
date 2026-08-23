import type { IncomingHttpHeaders } from 'node:http';

export type ApiRequest = {
  method?: string;
  body?: unknown;
  headers: IncomingHttpHeaders;
  socket: {
    remoteAddress?: string;
  };
};

export type ApiResponse = {
  setHeader(name: string, value: string): unknown;
  status(statusCode: number): ApiResponse;
  json(body: unknown): void;
};
