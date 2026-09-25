import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },
    { duration: '1m', target: 100 },
    { duration: '1m', target: 200 },
    { duration: '30s', target: 0 },
  ],
};

export default function () {

  const res = http.get('https://bella-beaute-site-700yvxjyu-zbatti-7216s-projects.vercel.app/');

  check(res, {
    'HTTP 200': (r) => r.status === 200,
    'Load < 3s': (r) => r.timings.duration < 3000,
  });

}