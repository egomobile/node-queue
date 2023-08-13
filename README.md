[![npm](https://img.shields.io/npm/v/@egomobile/queue.svg)](https://www.npmjs.com/package/@egomobile/queue)
[![last build](https://img.shields.io/github/workflow/status/egomobile/node-queue/Publish)](https://github.com/egomobile/node-queue/actions?query=workflow%3APublish)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/egomobile/node-queue/pulls)

# @egomobile/queue

> A simple and powerful queue implementation.

## Install

Execute the following command from your project folder, where your `package.json` file is stored:

```bash
npm install --save @egomobile/queue
```

## Usage

```typescript
import { Queue } from "@egomobile/queue";

let queue!: Queue;

async function main() {
  queue = new Queue();

  // register 2 tasks at once
  queue.register({
    // 1st
    "my task 1": async (context) => {
      console.log("This is task 1 with following data:", context.data);
    },

    // 2nd
    "my task 2": async (context) => {
      console.log("This is task 2 with following data:", context.data);
    },
  });

  // anything is prepared, lets start the queue
  await queue.start();

  // first enqueue 2nd task
  await queue.enqueue("my task 2", {
    buzz: 5979,
  });
  // then 1st one
  await queue.enqueue("my task 1", {
    foo: "bar",
  });
}

main().catch(console.error);
```

## Documentation

The API documentation can be found [here](https://egomobile.github.io/node-queue/).
