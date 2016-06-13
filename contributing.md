# Contributing

## Important notes
Please don't edit files in the `dist` subdirectory as they are generated via Gulp. You'll find source code in the `src` subdirectory!

### Code style
Regarding code style like indentation and whitespace, **follow the conventions you see used in the source already.**

## Modifying the code
First, ensure that you have the latest [Node.js](http://nodejs.org/) and [npm](http://npmjs.org/) installed.

Test that Gulp's CLI and Bower are installed by running `gulp --version` and `bower --version`.  If the commands aren't found, run `npm install -g gulp-cli bower`.  For more information about installing the tools, see the [getting started with Gulp guide](https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md) or [bower.io](http://bower.io/) respectively.

1. Fork the repo and clone your fork.
1. Run `npm install` to install all build dependencies (including Gulp).
1. Run `bower install` to install the front-end dependencies.
1. Run `gulp` to build this project.

## Submitting pull requests

1. Configure remotes (assign to upstream).
1. Get latest changes from upstream (pull).
1. Create a new topic branch to contain your feature, change, or fix, please don't work in your `master` branch directly.
1. Fix stuff.
1. Run `gulp` to rebuild project.
1. Update the documentation to reflect any changes.
1. Commit your changes. Please, use Git's interactive rebase feature to tidy up your commits before making them public.
1. Locally merge (or rebase) the upstream development branch into your topic branch (pull [--rebase]).
1. Push to your fork and submit a pull request.
