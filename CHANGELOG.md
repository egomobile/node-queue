# Change Log (@egomobile/queue)

## 3.1.0

- add `id` property to [IQueueTaskContext](https://egomobile.github.io/node-queue/interfaces/IQueueTaskContext.html)

## 3.0.0

- BREAKING CHANGE: [constructor of QueueStorageBaseAbstract](https://egomobile.github.io/node-queue/classes/QueueStorageBase.html#constructor) does not require a parameter anymore
- BREAKING CHANGE: [storage property of IQueueOptions](https://egomobile.github.io/node-queue/interfaces/IQueueOptions.html#storage) replaced with `storageClass`

## 2.0.0

- BREAKING CHANGE: rename [queueTask](https://egomobile.github.io/node-queue/interfaces/IQueueStorage.html#queueTask) to `enqueueTask`
- add `enqueueRemaing()` method to [IQueueStorage](https://egomobile.github.io/node-queue/interfaces/IQueueStorage.html)
- fix [MemoryQueueStorage](https://egomobile.github.io/node-queue/classes/MemoryQueueStorage.html)

## 1.0.1

- initial release
