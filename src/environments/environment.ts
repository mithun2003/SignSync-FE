import { IEnvironment } from "@models/environment";

export const environment: IEnvironment = {
  isItDev: true,
  // rootUrl: 'https://ben-ticket-yours-lite.trycloudflare.com',
  // websocketUrl: 'wss://ben-ticket-yours-lite.trycloudflare.com/api/v1',
  rootUrl: 'http://localhost:8000',
  websocketUrl: 'ws://localhost:8000/api/v1',
  version: '0.0.0',
  brandName: 'SignSync'

};
