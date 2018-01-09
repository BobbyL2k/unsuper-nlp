# Web Page for Labeling Text Data


## Setup Instruction

### Install Dependencies

The basic-react is a "node package". `yarn` is recommended for installing deps instead of `npm`.

    $ yarn install

### Build Client

Our React front-end is written in `Typescript`, which needs to be transpiled and bundled with `Webpack`.

    $ webpack --config client/webpack.config.js

### Build Server

Our backend is also written in `Typescript`, which needs to be transpiled before running on `Node.js`.

    $ tsc -p server/

And the setup is complete

## Start Server

    $ node server/build/index.js

## Development

### Active Building

#### Client

    $ webpack --config client/webpack.config.js -w

#### Server

    $ tsc -p server/ -w