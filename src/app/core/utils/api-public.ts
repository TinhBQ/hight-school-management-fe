import { environment } from 'src/environments/environment';

const endpoint: string = environment.apiURL;

// Api không cần kiếm tra
export const apiPublic = [endpoint + +'/auth/login'];
