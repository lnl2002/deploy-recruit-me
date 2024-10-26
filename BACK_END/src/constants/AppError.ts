class AppErrorIdentity extends Error {
  code: number;
  constructor(message: string, code: number) {
    super(message);
    this.code = code;
  }
}

export const AppError ={
    //unknown
    UNKNOWN_ERROR : new AppErrorIdentity("Unknown error happened, please try again!", 10000),

    //auth
    INVALID_TOKEN : new AppErrorIdentity("Access permission error, please try again!", 10001),
}