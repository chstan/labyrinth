# How to get up and running

Assuming you've `npm install`ed, you'll need to do a few more things in order to get a running copy of this project up. You'll also need `PostgreSQL` and `redis` and you'll need to setup a `secrets.json` in the root of the project with appropriate ports and secrets (this will probably be changing soon).

You should be able to start `redis` with `npm run redis`. Assuming you have the `redis` server running (look for a process `redis-server`) and a running PostgreSQL installation, you can run `npm run update-schema` to update the GraphQL cache of types, and then `npm start` to actually start the server.
