import { IEnvironment } from "@models/environment";

export const environment: IEnvironment = {
  isItDev: true,
  // rootUrl: 'https://operation-packed-swimming-exchange.trycloudflare.com',
  // websocketUrl: 'wss://operation-packed-swimming-exchange.trycloudflare.com/api/v1',
  rootUrl: 'http://localhost:8000',
  websocketUrl: 'ws://localhost:8000/api/v1',

  version: '0.0.0',
  brandName: 'SignSync'

};
