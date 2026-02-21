import { IEnvironment } from "@models/environment";

export const environment: IEnvironment = {
  isItDev: true,
  rootUrl: 'https://signsync-be.onrender.com',
  websocketUrl: 'wss://signsync-be.onrender.com/api/v1',

  version: '0.0.0',
  brandName: 'SignSync'

};
