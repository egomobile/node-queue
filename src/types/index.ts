// This file is part of the @egomobile/queue distribution.
// Copyright (c) Next.e.GO Mobile SE, Aachen, Germany (https://e-go-mobile.com/)
//
// @egomobile/queue is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as
// published by the Free Software Foundation, version 3.
//
// @egomobile/queue is distributed in the hope that it will be useful, but
// WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with this program. If not, see <http://www.gnu.org/licenses/>.

import type { Func } from "./internal";

/**
 * A function, which returns a queue storage asynchroniously.
 */
export type AsyncQueueStorageProvider = () => PromiseLike<IQueueStorage>;

/**
 * Context for a `QueueErrorHandler` function.
 */
export interface IQueueErrorHandlerContext {
    /**
     * The error.
     */
    error: any;
}

/**
 * Execution context for a `QueueExecutionHandler` instance.
 */
export interface IQueueExecutionHandlerContext {
    /**
     * Data.
     */
    data: QueueTaskData;
    /**
     * The key of the task.
     */
    taskKey: string;
}

/**
 * A queue storage.
 */
export interface IQueueStorage {
    /**
     * Registers one or more error handlers.
     *
     * @param {QueueStorageEvent} event The name of the known event.
     * @param {Func} handler The handler to register.
     *
     * @returns {this} This instance.
     */
    on(event: "error", handler: QueueErrorHandler): this;
    on(event: "execute", handler: QueueExecutionHandler): this;
    on(event: QueueStorageEvent, handler: Func): this;

    /**
     * Enqueues all remaing tasks, which are not finished or aborted.
     *
     * @returns {IQueueTaskContext[]|PromiseLike<IQueueTaskContext[]>} The contextes or the promise with it.
     */
    enqueueRemainingTasks(): IQueueTaskContext[] | PromiseLike<IQueueTaskContext[]>;

    /**
     * Queues a task.
     *
     * @param {IQueueTaskInStorageOptions} options The options.
     *
     * @returns {IQueueTaskContext|PromiseLike<IQueueTaskContext>} The context or the promise with it.
     */
    enqueueTask: (options: IQueueTaskInStorageOptions) => IQueueTaskContext | PromiseLike<IQueueTaskContext>;

    /**
     * Stops all enqueued tasks.
     */
    stopAllEnqueuedTasks(): any;
}

/**
 * A context of a `QueueTask`.
 */
export interface IQueueTaskContext {
}

/**
 * An execution context for a `QueueTask`.
 */
export interface IQueueTaskExecutionContext {
    /**
     * (normalized) Data for the execution.
     */
    data: QueueTaskData;
    /**
     * The key of the task.
     */
    key: string;
}

/**
 * Options for a `IQueueStorage.queue()` method.
 */
export interface IQueueTaskInStorageOptions {
    /**
     * Data.
     */
    data: QueueTaskData;
    /**
     * The key of the task.
     */
    key: string;
}

/**
 * Options for `IQueueStorage.registerTasks()` method.
 */
export interface IRegisterQueueTasksOptions {
    /**
     * The tasks to register.
     */
    tasks: Record<string, QueueTask>;
}

/**
 * An error handler.
 *
 * @param {IQueueExecutionHandlerContext} context The context.
 */
export type QueueExecutionHandler = (context: IQueueExecutionHandlerContext) => any;

/**
 * An error handler.
 *
 * @param {IQueueErrorHandlerContext} context The context.
 */
export type QueueErrorHandler = (context: IQueueErrorHandlerContext) => any;

/**
 * A name of a known queue event.
 */
export type QueueEvent = "error";

/**
 * A name of a known queue storage event.
 */
export type QueueStorageEvent = "error" | "execute";

/**
 * A function, which returns a queue storage.
 */
export type QueueStorageProvider = AsyncQueueStorageProvider | SyncQueueStorageProvider;

/**
 * A task for a queue.
 */
export type QueueTask = (context: IQueueTaskExecutionContext) => any;

/**
 * Possible data value for a `QueueTask`.
 */
export type QueueTaskData = Record<string, any>;

/**
 * A function, which returns a queue storage synchroniously.
 */
export type SyncQueueStorageProvider = () => IQueueStorage;
