import { spawn } from 'child_process';

import secrets from '../secrets.json';

spawn('redis-server', [`--port ${ secrets.redis.port }`], {
  detached: true,
});
