# [DevDocs for GJS](https://gjs-docs.gnome.org) — API documentation browser for the GNOME JavaScript platform

This is the source code for the website with API documentation for writing GNOME applications in JavaScript. It's based on an app called DevDocs, which combines multiple API documentations in a fast, organized, and searchable interface.

# Contributing

- Request missing documentation sets or report APIs that don't work quite the way they're documented, in the [issue tracker](https://gitlab.gnome.org/GNOME/devdocsgjs/-/issues).
- Check out the [code](https://gitlab.gnome.org/GNOME/devdocsgjs) and make improvements.
- Discuss things in the [chat channel](https://gnome.riot.im/#/room/#_gimpnet_#javascript:gnome.org).

----

The README from the original DevDocs project follows:

# [DevDocs](https://devdocs.io) — API Documentation Browser [![Build Status](https://travis-ci.org/freeCodeCamp/devdocs.svg?branch=master)](https://travis-ci.org/freeCodeCamp/devdocs)

DevDocs combines multiple developer documentations in a clean and organized web UI with instant search, offline support, mobile version, dark theme, keyboard shortcuts, and more.

DevDocs was created by [Thibaut Courouble](https://thibaut.me) and is operated by [freeCodeCamp](https://www.freecodecamp.org).

Keep track of development news:

* Join the contributor chat room on [Gitter](https://gitter.im/FreeCodeCamp/DevDocs)
* Watch the repository on [GitHub](https://github.com/freeCodeCamp/devdocs/subscription)
* Follow [@DevDocs](https://twitter.com/DevDocs) on Twitter

**Table of Contents:** [Quick Start](#quick-start) · [Vision](#vision) · [App](#app) · [Scraper](#scraper) · [Commands](#available-commands) · [Contributing](#contributing) · [Documentation](#documentation) · [Plugins and Extensions](#plugins-and-extensions) · [License](#copyright--license) · [Questions?](#questions)

## Quick Start

Unless you wish to contribute to the project, we recommend using the hosted version at [devdocs.io](https://devdocs.io). It's up-to-date and works offline out-of-the-box.

DevDocs is made of two pieces: a Ruby scraper that generates the documentation and metadata, and a JavaScript app powered by a small Sinatra app.

DevDocs requires Ruby 2.6.0, libcurl, and a JavaScript runtime supported by [ExecJS](https://github.com/rails/execjs#readme) (included in OS X and Windows; [Node.js](https://nodejs.org/en/) on Linux). Once you have these installed, run the following commands:

```
git clone https://github.com/freeCodeCamp/devdocs.git && cd devdocs
gem install bundler
bundle install
bundle exec thor docs:download --default
bundle exec rackup
```

Finally, point your browser at [localhost:9292](http://localhost:9292) (the first request will take a few seconds to compile the assets). You're all set.

The `thor docs:download` command is used to download pre-generated documentations from DevDocs's servers (e.g. `thor docs:download html css`). You can see the list of available documentations and versions by running `thor docs:list`. To update all downloaded documentations, run `thor docs:download --installed`.

**Note:** there is currently no update mechanism other than `git pull origin master` to update the code and `thor docs:download --installed` to download the latest version of the docs. To stay informed about new releases, be sure to [watch](https://github.com/freeCodeCamp/devdocs/subscription) this repository.

Alternatively, DevDocs may be started as a Docker container:

```
# First, build the image
git clone https://github.com/freeCodeCamp/devdocs.git && cd devdocs
docker build -t thibaut/devdocs .

# Finally, start a DevDocs container (access http://localhost:9292)
docker run --name devdocs -d -p 9292:9292 thibaut/devdocs
```

## Vision

DevDocs aims to make reading and searching reference documentation fast, easy and enjoyable.

The app's main goals are to: keep load times as short as possible; improve the quality, speed, and order of search results; maximize the use of caching and other performance optimizations; maintain a clean and readable user interface; be fully functional offline; support full keyboard navigation; reduce “context switch” by using a consistent typography and design across all documentations; reduce clutter by focusing on a specific category of content (API/reference) and indexing only the minimum useful to most developers.

**Note:** DevDocs is neither a programming guide nor a search engine. All our content is pulled from third-party sources and the project doesn't intend to compete with full-text search engines. Its backbone is metadata; each piece of content is identified by a unique, "obvious" and short string. Tutorials, guides and other content that don't meet this requirement are outside the scope of the project.

## App

The web app is all client-side JavaScript, written in [CoffeeScript](http://coffeescript.org), and powered by a small [Sinatra](http://www.sinatrarb.com)/[Sprockets](https://github.com/rails/sprockets) application. It relies on files generated by the [scraper](#scraper).

Many of the code's design decisions were driven by the fact that the app uses XHR to load content directly into the main frame. This includes stripping the original documents of most of their HTML markup (e.g. scripts and stylesheets) to avoid polluting the main frame, and prefixing all CSS class names with an underscore to prevent conflicts.

Another driving factor is performance and the fact that everything happens in the browser. `applicationCache` (which comes with its own set of constraints) and `localStorage` are used to speed up the boot time, while memory consumption is kept in check by allowing the user to pick his/her own set of documentations. The search algorithm is kept simple because it needs to be fast even searching through 100,000 strings.

DevDocs being a developer tool, the browser requirements are high:

* Recent versions of Firefox, Chrome, or Opera
* Safari 9.1+
* Edge 16+
* iOS 10+

This allows the code to take advantage of the latest DOM and HTML5 APIs and make developing DevDocs a lot more fun!

## Scraper

The scraper is responsible for generating the documentation and index files (metadata) used by the [app](#app). It's written in Ruby under the `Docs` module.

There are currently two kinds of scrapers: `UrlScraper` which downloads files via HTTP and `FileScraper` which reads them from the local filesystem. They both make copies of HTML documents, recursively following links that match a set of rules and applying all sorts of modifications along the way, in addition to building an index of the files and their metadata. Documents are parsed using [Nokogiri](http://nokogiri.org).

Modifications made to each document include:

* removing content such as the document structure (`<html>`, `<head>`, etc.), comments, empty nodes, etc.
* fixing links (e.g. to remove duplicates)
* replacing all external (not scraped) URLs with their fully qualified counterpart
* replacing all internal (scraped) URLs with their unqualified and relative counterpart
* adding content, such as a title and link to the original document
* ensuring correct syntax highlighting using [Prism](http://prismjs.com/)

These modifications are applied via a set of filters using the [HTML::Pipeline](https://github.com/jch/html-pipeline) library. Each scraper includes filters specific to itself, one of which is tasked with figuring out the pages' metadata.

The end result is a set of normalized HTML partials and two JSON files (index + offline data). Because the index files are loaded separately by the [app](#app) following the user's preferences, the scraper also creates a JSON manifest file containing information about the documentations currently available on the system (such as their name, version, update date, etc.).

More information about scrapers and filters is available on the [wiki](https://github.com/freeCodeCamp/devdocs/wiki).

## Available Commands

The command-line interface uses [Thor](http://whatisthor.com). To see all commands and options, run `thor list` from the project's root.

```
# Server
rackup              # Start the server (ctrl+c to stop)
rackup --help       # List server options

# Docs
thor docs:list      # List available documentations
thor docs:download  # Download one or more documentations
thor docs:manifest  # Create the manifest file used by the app
thor docs:generate  # Generate/scrape a documentation
thor docs:page      # Generate/scrape a documentation page
thor docs:package   # Package a documentation for use with docs:download
thor docs:clean     # Delete documentation packages

# Console
thor console        # Start a REPL
thor console:docs   # Start a REPL in the "Docs" module
Note: tests can be run quickly from within the console using the "test" command. Run "help test"
for usage instructions.

# Tests
thor test:all       # Run all tests
thor test:docs      # Run "Docs" tests
thor test:app       # Run "App" tests

# Assets
thor assets:compile # Compile assets (not required in development mode)
thor assets:clean   # Clean old assets
```

If multiple versions of Ruby are installed on your system, commands must be run through `bundle exec`.

## Contributing

Contributions are welcome. Please read the [contributing guidelines](https://github.com/freeCodeCamp/devdocs/blob/master/.github/CONTRIBUTING.md).

DevDocs's own documentation is available on the [wiki](https://github.com/freeCodeCamp/devdocs/wiki).

## Documentation

* [Adding documentations to DevDocs](./docs/adding-docs.md)
* [Scraper Reference](./docs/scraper-reference.md)
* [Filter Reference](./docs/filter-reference.md)
* [Maintainers’ Guide](./docs/maintainers.md)

## Plugins and Extensions

* [Chrome web app](https://chrome.google.com/webstore/detail/devdocs/mnfehgbmkapmjnhcnbodoamcioleeooe)
* [Ubuntu Touch app](https://uappexplorer.com/app/devdocsunofficial.berkes)
* [Sublime Text plugin](https://sublime.wbond.net/packages/DevDocs)
* [Atom plugin](https://atom.io/packages/devdocs)
* [Brackets extension](https://github.com/gruehle/dev-docs-viewer)
* [Fluid](http://fluidapp.com) for turning DevDocs into a real OS X app
* [GTK shell / Vim integration](https://github.com/naquad/devdocs-shell)
* [Emacs lookup](https://github.com/skeeto/devdocs-lookup)
* [Alfred Workflow](https://github.com/yannickglt/alfred-devdocs)
* [Vim search plugin with Devdocs in its defaults](https://github.com/waiting-for-dev/vim-www) Just set `let g:www_shortcut_engines = { 'devdocs': ['Devdocs', '<leader>dd'] }` to have a `:Devdocs` command and a `<leader>dd` mapping.
* [Visual Studio Code plugin](https://marketplace.visualstudio.com/items?itemName=akfish.vscode-devdocs ) (1)
* [Visual Studio Code plugin](https://marketplace.visualstudio.com/items?itemName=deibit.devdocs) (2)
* [Desktop application](https://github.com/egoist/devdocs-desktop)
* [Doc Browser](https://github.com/qwfy/doc-browser) is a native Linux app that supports DevDocs docsets
* [GNOME Application](https://github.com/hardpixel/devdocs-desktop) GTK3 application with search integrated in headerbar
* [macOS Application](https://github.com/dteoh/devdocs-macos)
* [Android Application](https://github.com/Merith-TK/devdocs_webapp_kotlin) is a fully working, advanced WebView with AppCache enabled

## Copyright / License

Copyright 2013-2019 Thibaut Courouble and [other contributors](https://github.com/freeCodeCamp/devdocs/graphs/contributors)

This software is licensed under the terms of the Mozilla Public License v2.0. See the [COPYRIGHT](https://github.com/freeCodeCamp/devdocs/blob/master/COPYRIGHT) and [LICENSE](https://github.com/freeCodeCamp/devdocs/blob/master/LICENSE) files.

Please do not use the name DevDocs to endorse or promote products derived from this software without the maintainers' permission, except as may be necessary to comply with the notice/attribution requirements.

We also wish that any documentation file generated using this software be attributed to DevDocs. Let's be fair to all contributors by giving credit where credit's due. Thanks!

## Questions?

If you have any questions, please feel free to ask them on the contributor chat room on [Gitter](https://gitter.im/FreeCodeCamp/DevDocs).
