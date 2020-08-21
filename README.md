# Gridsome Webhook Builder 👷🏻

_Why?:_

If you are using a static site generator like **Gridsome** (Or Gatsby) with a backend CMS like **WordPress**, you will need a way to trigger the fetch&&rebuild of new content after update. Using **[JAMstack Deployments](https://pl.wordpress.org/plugins/wp-jamstack-deployments/)** plugin for wordpress and this script you will be able to trigger the rebuild after any update or manually for that matter.

_Features:_
* runs build in child process
* rate limiter
* build limiter
* logging to file
* logging to Sentry.io
* logrotate


## Usage:
Clone somwhere close to your Gridsome project (ideally next to the project files [_not inside!_]).

Rename `sample.env` to `.env`

Change `TARGET_DIR` to relative directory to your gridsome project (or leave as is)

Install deps:

```bash
yarn
```

### Start local:

```bash
yarn run start:dev
```

### Build & Start prod
Change `NODE_ENV` to `production` in `.env` and run:

```bash
yarn run build && yarn run start:prod
```

### Using Sentry
Just add your project dsn to `.env`

### Local test
You can test the webhook trigger and build using localtunnel like ngork or [localtunnel](https://github.com/localtunnel/localtunnel) (with `lt -h "https://serverless.social" -p 3333` command)

You can change the build command in `app.service` to run any desired build command.
