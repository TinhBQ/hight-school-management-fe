export interface IJwtToken {
  exp: number;
  iat: number;
  nbf: number;
  rol: string;
  tid: string;
  uid: string;
}
