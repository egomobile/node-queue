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

export type Constructor<T = any> = (new (...args: any[]) => T);

export type Func = (...args: any[]) => any;

export type Optional<T = any> = T | undefined;

export type Nilable<T = any> = Nullable<T> | Optional<T>;

export type Nullable<T = any> = T | null;
