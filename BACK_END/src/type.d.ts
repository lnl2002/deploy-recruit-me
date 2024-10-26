// types/custom.d.ts

import 'express'; // Import express types

export interface IUserInfo {
    _id: string,
    displayName: string,
    email: string,
    role: string,
    image: string,
}

declare module 'express' {
  interface Request {
    user?: IUserInfo;
  }
}
