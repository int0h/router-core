import {RouterCore, CVState} from './index';

export function handleHistory(router: RouterCore<any, any>) {
    window.addEventListener('popstate', e => {
        const newState = e.state as CVState;
        router.go(newState.routeName, newState.data, false, false);
    });

    router.onTransition((type, oldCW, newCW, handleHistory) => {
        if (!handleHistory) {
            return;
        }

        let url = router.build(newCW.route, newCW.data);

        if (router.cfg.hashPrefix) {
            url = '#' + url;
        }

        switch (type) {
            case 'routeChange':
                history.pushState(newCW.state, '', url);
                return;
            case 'pathChange':
                history.pushState(newCW.state, '', url);
                return;
            case 'paramChange':
                history.replaceState(newCW.state, '', url);
                return;
        }
    });
}
