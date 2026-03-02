import { IEnvironment } from "@models/environment";

export const environment: IEnvironment = {
  isItDev: true,
  rootUrl: 'http://localhost:8000',
  websocketUrl: 'ws://localhost:8000/api/v1',

  version: '0.0.0',
  brandName: 'SignSync'

};
