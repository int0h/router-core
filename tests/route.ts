import test = require('tape');

import {Route, route} from '../src';

test('route parse', t => {
    const r = new Route(['foo'], {});
    t.is(r.parse('/no'), null);
    t.deepEqual(r.parse('/foo'), {});

    t.is(r.parse('/no'), null);
    t.deepEqual(r.parse('/foo'), {});


    t.end();
});

test('route stringify', t => {
    const r = new Route(['foo'], {});
    t.is(r.stringify({}), '/foo');
    t.end();
});

test('route params', t => {
    const r = route(['actions', {$: 'actionName'}], {
        params: {
            actionName: {}
        }
    });

    t.deepEqual(r.parse('/actions/sleep'), {actionName: 'sleep'});

    t.is(r.stringify({actionName: 'eat'}), '/actions/eat');

    t.end();
});

test('route params in the middle', t => {
    const r = route(['actions', {$: 'actionName'}, 'now'], {
        params: {
            actionName: {}
        }
    });

    t.deepEqual(r.parse('/actions/sleep/now'), {actionName: 'sleep'});

    t.deepEqual(r.parse('/actions/sleep'), null);

    t.is(r.stringify({actionName: 'eat'}), '/actions/eat/now');

    t.end();
});

test('ignores leading and trailng slashes', t => {
    const r = new Route(['foo'], {});

    t.deepEqual(r.parse('foo'), {});
    t.deepEqual(r.parse('foo/'), {});
    t.deepEqual(r.parse('/foo'), {});
    t.deepEqual(r.parse('/foo/'), {});

    t.end();
})

test('route regExp validation', t => {
    const r = route(['actions', {$: 'actionName'}], {
        params: {
            actionName: /^[a-z]+$/
        }
    });

    t.deepEqual(r.parse('/actions/sleep'), {actionName: 'sleep'});

    t.deepEqual(r.parse('/actions/13'), null);

    t.end();
});

test('support literal routes', t => {
    const r = route('/foo', {});

    t.deepEqual(r.parse('/foo'), {});

    t.deepEqual(r.parse('/a'), null);

    t.is(r.stringify({}), '/foo');

    t.end();
});

test('support query', t => {
    const r = route('/foo', {});

    t.deepEqual(r.parse('/foo?a=2'), {a: '2'});

    t.deepEqual(r.parse('/foo?a=2&b=3'), {a: '2', b: '3'});

    t.deepEqual(r.parse('/foo#?a=2&b=3'), {});

    t.deepEqual(r.parse('/foo?'), {});

    t.deepEqual(r.parse('/foo?a=1&a=2'), {a: ['1', '2']}, 'query arrays');

    t.deepEqual(r.parse('/a'), null);

    t.is(r.stringify({}), '/foo');

    t.is(r.stringify({a: '213'}), '/foo?a=213');

    t.is(r.stringify({a: '213', b: '321'}), '/foo?a=213&b=321');

    t.is(r.stringify({a: ['1', '2']}), '/foo?a=1&a=2');

    const wp = route(['foo', {$: 'param'}], {
        params: {
            param: {}
        }
    });

    t.deepEqual(wp.parse('/foo/par?a=2'), {a: '2', param: 'par'});

    t.deepEqual(wp.parse('/foo/par?a=2&b=3'), {a: '2', b: '3', param: 'par'});

    t.deepEqual(wp.parse('/foo/foo#?a=2&b=3'), {param: 'foo'});

    t.deepEqual(wp.parse('/foo/ew?'), {param: 'ew'});

    t.deepEqual(wp.parse('/foo/s?a=1&a=2'), {a: ['1', '2'], param: 's'}, 'query arrays');

    t.end();
});
