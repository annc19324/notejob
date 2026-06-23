import { register } from './src/controllers/auth';

const req = {
  body: {
    username: 'test4',
    fullName: 't4',
    email: 'test4@test.com',
    password: 'password'
  }
} as any;

const res = {
  status: (code: number) => ({
    json: (data: any) => {
      console.log('Status:', code, 'Data:', data);
    }
  }),
  json: (data: any) => {
    console.log('Data:', data);
  }
} as any;

register(req, res).catch(console.error);
