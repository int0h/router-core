import './route';

import test = require('tape');

import {Router as BaseRouter, Route, route, TransitionType, RouteView} from '../src';

test('base', t => {
    let htCalledTimes = 0;
    let checker: Function;

    class Router<Routes extends {[key: string]: Route<string>}> extends BaseRouter<Routes> {
        handleTransition(type: TransitionType, oldCW: RouteView, newCW: RouteView){
            htCalledTimes++;
            checker(type, oldCW, newCW);
        }
    }

    const router = new Router({
        cart: route('/cart', {}),
        category: route(['catalog', {$: 'id'}], {})
    });

    router.init('cart', {});

    t.is(htCalledTimes, 0);

    checker = (type: TransitionType, oldCW: RouteView, newCW: RouteView) => {
        t.is(type, 'routeChange');
        t.deepEqual(oldCW, {
            routeName: 'cart',
            route: router.routes.cart,
            data: {}
        });
        t.deepEqual(newCW, {
            routeName: 'category',
            route: router.routes.category,
            data: {id: '432'}
        });
    }
    router.go('category', {id: '432'});
    t.is(htCalledTimes, 1);

    checker = (type: TransitionType, oldCW: RouteView, newCW: RouteView) => {
        t.is(type, 'pathChange');
        t.deepEqual(oldCW, {
            routeName: 'category',
            route: router.routes.category,
            data: {id: '432'}
        });
        t.deepEqual(newCW, {
            routeName: 'category',
            route: router.routes.category,
            data: {id: '123'}
        });
    }
    router.go('category', {id: '123'});
    t.is(htCalledTimes, 2);

    checker = (type: TransitionType, oldCW: RouteView, newCW: RouteView) => {
        t.is(type, 'paramChange');
        t.deepEqual(oldCW, {
            routeName: 'category',
            route: router.routes.category,
            data: {id: '123'}
        });
        t.deepEqual(newCW, {
            routeName: 'category',
            route: router.routes.category,
            data: {id: '123', page: '2'}
        });
    }
    router.go('category', {id: '123', page: '2'});
    t.is(htCalledTimes, 3);

    checker = (type: TransitionType, oldCW: RouteView, newCW: RouteView) => {
        t.is(type, 'paramChange');
        t.deepEqual(oldCW, {
            routeName: 'category',
            route: router.routes.category,
            data: {id: '123', page: '2'}
        });
        t.deepEqual(newCW, {
            routeName: 'category',
            route: router.routes.category,
            data: {id: '123', page: '3'}
        });
    }
    router.changeParams({page: '3'});
    t.is(htCalledTimes, 4);

    t.end();
});
