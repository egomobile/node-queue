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

import type { IQueueStorage, IQueueTaskContext, IQueueTaskInStorageOptions, QueueErrorHandler, QueueExecutionHandler, QueueStorageEvent } from "../types";
import type { Func } from "../types/internal";

/**
 * A queue stroage base class.
 */
export abstract class QueueStorageBase implements IQueueStorage {
    private readonly _errorHandlers: QueueErrorHandler[] = [];
    private readonly _executionHandlers: QueueExecutionHandler[] = [];

    /**
     * Returns a copy of the list of error handlers.
     *
     * @returns {QueueErrorHandler[]} The list of error handlers.
     */
    protected getErrorHandlers(): QueueErrorHandler[] {
        return [...this._errorHandlers];
    }

    /**
     * Returns a copy of the list of execution handlers.
     *
     * @returns {QueueExecutionHandler[]} The list of execution handlers.
     */
    protected getExecutionHandlers(): QueueExecutionHandler[] {
        return [...this._executionHandlers];
    }

    /**
     * @inheritdoc
     */
    public on(event: QueueStorageEvent, handler: Func): this {
        if (typeof handler !== "function") {
            throw new TypeError("handler must be of type function");
        }

        if (event === "error") {
            this._errorHandlers.push(handler as QueueErrorHandler);
        }
        else if (event === "execute") {
            this._executionHandlers.push(handler as QueueExecutionHandler);
        }
        else {
            throw new TypeError(`${event} is no valid value for event argument`);
        }

        return this;
    }

    /**
     * @inheritdoc
     */
    public abstract enqueueRemainingTasks(): PromiseLike<IQueueTaskContext[]>;

    /**
     * @inheritdoc
     */
    public abstract enqueueTask(options: IQueueTaskInStorageOptions): PromiseLike<IQueueTaskContext>;

    /**
     * @inheritdoc
     */
    public abstract stopAllEnqueuedTasks(): PromiseLike<any>;
}
