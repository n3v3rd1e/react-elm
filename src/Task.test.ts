/*
 * MIT License
 *
 * Copyright (c) 2019 Rémi Van Keisbelck
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */

import {Task} from "./Task";
import {Result} from "./Result";


test("succeed", done => {
    expectOk(done, Task.succeed(123), 123);
});


test("fail", done => {
    expectErr(done, Task.fail("wtf?"), "wtf?");
});


test("map", done => {
    expectOk(
        done,
        Task.succeed(1).map(i => i + 1),
        2
    )
});


test("mapError", done => {
    expectErr(
        done,
        Task.fail("wtf").mapError(s => s + " is wrong?"),
        "wtf is wrong?"
    )
});


test("andThen", done => {
    expectOk(
        done,
        Task.succeed(1).andThen((i:number) => {
            return Task.succeed(i + 10)
        }),
        11
    );
});


test("more complex stuff", done => {
    expectOk(
        done,
        Task.succeed("hello")
            .map(s => s + " world")
            .andThen(s => Task.succeed(s + " and").map(s => s + " people"))
            .map(s => s + " and dolphins"),
        "hello world and people and dolphins"
    )
});

test("more complex stuff with err", done => {
    expectErr(
        done,
        Task.fail("hello")
            .mapError(s => s + " world")
            .andThen(s => Task.fail(s + " foo")), // this should not appear ! second task never gets executed
        "hello world"
    )
});



export function attempt<E,R>(t:Task<E,R>, callback:(r:Result<E,R>) => void) {
    Task.attempt(t, m => m).execute(callback)
}


export function perform<R>(t:Task<never,R>, callback:(r:R) => void) {
    Task.perform(t, m => m).execute(callback)
}


export function expectOk<R>(done: () => void, t:Task<never,R>, r:R) {
    perform(t, result => {
        expect(result).toBe(r);
        done()
    })
}


export function expectErr<E,R>(done: () => void, t:Task<E,R>, e:E) {
    attempt(t, result => {
        result.match(
            (_:R) => fail("expected an error"),
            (err:E) => expect(err).toBe(e)
        );
        done()
    })
}
