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

import type { IQueueExecutionHandlerContext, IQueueTaskContext, IQueueTaskInStorageOptions } from "../types";
import { QueueStorageBase } from "./queueStorageBase";

interface ITaskInQueue {
    id: string;
    options: IQueueTaskInStorageOptions;
    status: TaskInQueueStatus;
}

enum TaskInQueueStatus {
    Queued = 0,
    Running = 1,
    Succeded = 2,
    Failed = 3,
    Stopped = 4,
}

/**
 * A queue stroage based on array in memory.
 */
export class MemoryQueueStorage extends QueueStorageBase {
    private _nextId: number = Number.MIN_SAFE_INTEGER;
    private _tasksInQueue: ITaskInQueue[] = [];

    private cleanupTasksInQueue() {
        this._tasksInQueue = this._tasksInQueue.filter((t) => {
            return t.status !== TaskInQueueStatus.Succeded;
        });
    }

    private executeTask(taskInQueue: ITaskInQueue) {
        const isStopped = () => {
            return taskInQueue.status === TaskInQueueStatus.Stopped;
        };

        const executionHandlers = this.getExecutionHandlers();
        if (!executionHandlers.length) {
            return;
        }

        const { options } = taskInQueue;
        const { data, key } = options;

        const handleError = (error: any) => {
            const shouldRetry = !isStopped();

            taskInQueue.status = TaskInQueueStatus.Failed;

            this.getErrorHandlers().forEach((handler) => {
                try {
                    handler({
                        error
                    });
                }
                catch (error2) {
                    console.error("[ERROR]", "@egomobile/queue", "MemoryQueueStorage.executeTask(handleError)", error2);
                }
            });

            if (shouldRetry) {
                this.executeTask(taskInQueue);
            }
        };

        setImmediate(() => {
            if (isStopped()) {
                return;
            }

            taskInQueue.status = TaskInQueueStatus.Queued;

            const context: IQueueExecutionHandlerContext = {
                "data": {
                    ...data
                },
                "taskKey": key
            };

            try {
                taskInQueue.status = TaskInQueueStatus.Running;

                Promise.all(executionHandlers.map((handler) => {
                    return Promise.resolve(handler(context));
                }))
                    .then(() => {
                        taskInQueue.status = TaskInQueueStatus.Succeded;

                        this.cleanupTasksInQueue();
                    })
                    .catch(handleError);
            }
            catch (error: any) {
                handleError(error);
            }
        });
    }

    /**
     * @inheritdoc
     */
    public async enqueueRemainingTasks(): Promise<IQueueTaskContext[]> {
        const result: IQueueTaskContext[] = [];

        const tasksWithQueuedStatus = this._tasksInQueue.filter((t) => {
            return t.status === TaskInQueueStatus.Queued;
        });
        tasksWithQueuedStatus.forEach((t) => {
            this.executeTask({
                "id": t.id,
                "options": t.options,
                "status": t.status
            });
        });

        return result;
    }

    /**
     * @inheritdoc
     */
    public async enqueueTask(options: IQueueTaskInStorageOptions): Promise<IQueueTaskContext> {
        const id = String(this._nextId++);

        const taskInQueue: ITaskInQueue = {
            id,
            options,
            "status": TaskInQueueStatus.Queued
        };

        this._tasksInQueue.push(taskInQueue);
        this.executeTask(taskInQueue);

        return {
            id
        };
    }

    /**
     * @inheritdoc
     */
    public async stopAllEnqueuedTasks(): Promise<any> {
        const tasksToStop = this._tasksInQueue.filter((t) => {
            return t.status === TaskInQueueStatus.Queued ||
                t.status === TaskInQueueStatus.Running ||
                t.status === TaskInQueueStatus.Failed;
        });

        tasksToStop.forEach((t) => {
            t.status = TaskInQueueStatus.Stopped;
        });
    }
}
