import { environment } from 'src/environments/environment';

const domain: string = environment.baseUrl;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const endpoint: any = environment.endpoint;

// Api không cần kiếm tra
export const apiPublic = [
  domain + endpoint.auth.login,
  domain + endpoint.auth.refreshToken,
];
