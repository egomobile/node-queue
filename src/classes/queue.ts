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

import type { IQueueStorage, IQueueTaskContext, QueueErrorHandler, QueueEvent, QueueTask, SyncQueueStorageProvider } from "../types";
import type { Func, Nilable } from "../types/internal";
import { isNil } from "../utils/internal";
import { MemoryQueueStorage } from "./memoryQueueStorage";

/**
 * Options for a `Queue` instance.
 */
export interface IQueueOptions {
    /**
     * A custom storage or a function, which provides it.
     *
     * If not defined, a new instance of `MemoryQueueStorage` class is created.
     */
    storage?: Nilable<IQueueStorage | SyncQueueStorageProvider>;
}

/**
 * Options for `Queue.enqueue()` method.
 */
export interface IQueueEnqueueOptions {
    /**
     * The optional data to submit.
     */
    data?: Nilable<Record<string, any>>;
}

/**
 * A list of tasks to register, organized as dictionary.
 */
export type QueueTasksToRegisterDictionary = Record<string, QueueTask>;

/**
 * A single task to register, organized as array.
 */
export type QueueTaskToRegister = [string, QueueTask];

/**
 * A possible value with tasks, which should be registers to a `Queue` by keys.
 */
export type QueueTasksToRegister = QueueTasksToRegisterDictionary | QueueTaskToRegister[];

/**
 * A queue / task manager.
 *
 * @example
 * ```
 * import { Queue } from "@egomobile/queue";
 *
 * let queue!: Queue;
 *
 * async function main() {
 *   queue = new Queue();
 *
 *   // first register the task
 *   queue.register({
 *     'myTask1': async (context) => {
 *       console.log("Executing task", context.key, "with data", context.data);
 *     }
 *   });
 *
 *   // and then enqueue it
 *   // while the underlying storage is
 *   // responsable for the execution
 *   await queue.enqueue('myTask1', {
 *     data: {
 *       foo: 'bar',
 *       buzz: 4242
 *     }
 *   });
 * }
 *
 * main().catch(console.error);
 * ```
 */
export class Queue {
    private readonly _errorHandlers: QueueErrorHandler[] = [];
    private _isRunning: boolean = false;
    private readonly _tasks: Record<string, QueueTask> = {};

    /**
     * Initializes a new instance of that class.
     *
     * @param {Nilable<IQueueOptions>} [options] Custom options.
     */
    public constructor(options?: Nilable<IQueueOptions>) {
        if (isNil(options?.storage)) {
            // default => MemoryQueueStorage

            const memStorage = new MemoryQueueStorage(this);

            this.getStorage = () => {
                return memStorage;
            };
        }
        else {
            if (typeof options?.storage === "function") {
                const provider = options.storage as SyncQueueStorageProvider;

                this.getStorage = () => {
                    return provider();
                };
            }
            else {
                const storage = options!.storage;

                this.getStorage = () => {
                    return storage;
                };
            }
        }

        this.init();
    }

    private getErrorHandlers(): QueueErrorHandler[] {
        return [...this._errorHandlers];
    }

    private readonly getStorage: SyncQueueStorageProvider;

    private init() {
        const { storage } = this;

        // handle errors
        storage.on("error", (error) => {
            this.getErrorHandlers().forEach((handler, index) => {
                const handleInnerError = (error2: any) => {
                    console.error("[ERROR]", "@egomobile/queue", "Queue.init(storage.on(error))", index, error2);
                };

                try {
                    Promise.resolve(
                        handler({
                            error
                        })
                    ).catch(handleInnerError);
                }
                catch (error2) {
                    handleInnerError(error2);
                }
            });
        });

        // handle executions
        storage.on("execute", ({ data, taskKey }) => {
            const task = this._tasks[taskKey];
            if (typeof task !== "function") {
                return;
            }

            return Promise.resolve(task({
                data,
                "key": taskKey
            }));
        });
    }

    /**
     * Gets if queue is running or not.
     *
     * @returns {boolean} A value, which indicates if queue is running or not.
     */
    public get isRunning(): boolean {
        return this._isRunning;
    }

    /**
     * Registers one or more error handlers.
     *
     * @param {QueueStorageEvent} event The name of the known event.
     * @param {Func} handler The handler to register.
     *
     * @returns {this} This instance.
     */
    public on(event: "error", handler: QueueErrorHandler): this;
    public on(event: QueueEvent, handler: Func): this {
        if (event === "error") {
            this._errorHandlers.push(handler as QueueErrorHandler);
        }
        else {
            throw new TypeError(`${event} is no valid value for event argument`);
        }

        return this;
    }

    /**
     * Queues a task.
     *
     * @example
     * ```
     * const queue = new Queue();
     *
     * /// ... register 'myTask1'
     *
     * // enqueue (and execute) without data
     * await queue.enqueue('myTask1');
     * // with data
     * await queue.enqueue('myTask1', {
     *   data: { foo: 'bar' }
     * });
     * ```
     *
     * @param {string} key The key / ID of the task.
     * @param {Nilable<IQueueQueueOptions>} [options] Additional and custom options.
     *
     * @returns {Promise<IQueueTaskContext>} The promise with the context.
     */
    public async enqueue(key: string, options?: Nilable<IQueueEnqueueOptions>): Promise<IQueueTaskContext> {
        const task = this._tasks[key];
        if (typeof task !== "function") {
            throw new Error(`No task found for key ${String(key)}`);
        }

        const { storage } = this;

        return Promise.resolve(
            storage.queueTask({
                "data": options?.data || {},
                key
            })
        );
    }

    /**
     * Registers one or more task actions, seperated by keys.
     *
     * @example
     * ```
     * const queue = new Queue();
     *
     * queue.register({
     *   'myTask1': async (context) => {
     *     // your code ...
     *   }
     * });
     *
     * // from here, you should be able to
     * // enqueue tasks with key/ID 'myTask1'
     * ```
     *
     * @param {QueueTasksToRegisterDictionary|QueueTaskToRegister} arg1 The first task or a dictionary.
     * @param {QueueTaskToRegister[]} [moreTasks] One or more task.
     *
     * @returns {this}
     */
    public register(taskDict: QueueTasksToRegisterDictionary): this;
    public register(...tasks: QueueTaskToRegister[]): this;
    public register(
        arg1: QueueTasksToRegisterDictionary | QueueTaskToRegister,
        ...moreTasks: QueueTaskToRegister[]
    ): this {
        const tasksToAdd = [...moreTasks];

        if (Array.isArray(arg1)) {
            // arg1 => QueueTaskToRegister

            tasksToAdd.unshift(arg1);
        }
        else if (typeof arg1 === "object") {
            // arg1 => taskDict: QueueTasksToRegisterDictionary

            tasksToAdd.unshift(
                ...Object.entries(arg1)
                    .map((entry, index) => {
                        if (typeof entry[1] !== "function") {
                            throw new TypeError(`Entry #${index} (${entry[0]}) of taskDict must be of type function`);
                        }

                        return entry;
                    })
            );
        }
        else {
            throw new TypeError("arg1 must be of type object or array");
        }

        tasksToAdd.forEach(([key, action]) => {
            if (typeof this._tasks[key] === "function") {
                throw new Error(`Task cannot be reset for key ${key}`);
            }
            else {
                this._tasks[key] = action;
            }
        });

        return this;
    }

    /**
     * Starts the queue.
     *
     * @returns {Promise<boolean>} A promise, which indicates if operation was successful or not.
     */
    public async start(): Promise<boolean> {
        if (this.isRunning) {
            return false;  // already running
        }

        this._isRunning = true;
        return true;
    }

    /**
     * Stops the queue.
     *
     * @returns {Promise<boolean>} A promise, which indicates if operation was successful or not.
     */
    public async stop(): Promise<boolean> {
        if (!this.isRunning) {
            return false;  // not running yet
        }

        this._isRunning = false;
        return true;
    }

    /**
     * Gets the underlying storage.
     *
     * @returns {IQueueStorage} The storage.
     */
    public get storage(): IQueueStorage {
        return this.getStorage();
    }
}
