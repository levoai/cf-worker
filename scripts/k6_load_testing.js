/*
 * k6 load testing script
 * Follow the instructions at https://k6.io/docs/get-started/installation/ to install k6.
 * Run the script with `k6 run k6_load_testing.js`.
 */

import http from 'k6/http';
import { randomItem, randomString, uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

export const options = {
  scenarios: {
    constant_request_rate: {
      executor: 'constant-arrival-rate',
      rate: 100,
      timeUnit: '1s', // 1000 iterations per second, i.e. 1000 RPS
      duration: '5s',
      preAllocatedVUs: 10, // how large the initial pool of VUs would be
      maxVUs: 50, // if the preAllocatedVUs are not enough, we can initialize more
    },
  },
  // scenarios: {
  //   contacts: {
  //     executor: 'ramping-arrival-rate',
  //     preAllocatedVUs: 50,
  //     timeUnit: '1s',
  //     startRate: 50,
  //     stages: [
  //       { target: 200, duration: '30s' }, // linearly go from 50 iters/s to 200 iters/s for 30s
  //       { target: 500, duration: '0' }, // instantly jump to 500 iters/s
  //       { target: 500, duration: '70s' }, // continue with 500 iters/s for 70 secs
  //     ],
  //   },
  // },
  thresholds: {
    // http_req_duration: ['p(99)<1500'], // 99% of requests must complete below 1.5s
    http_req_failed: ['rate<0.01'], // http errors should be less than 1%
  },
};

export default function () {
    const url = 'https://crapi-dev.getlevoai.com/identity/privacy/user_agent'
    http.get(url);
}
