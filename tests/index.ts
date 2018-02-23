import test = require('tape');

import {Router, Route, route} from '../src';

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
