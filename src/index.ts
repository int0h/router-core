import {Route, Data} from './route';
export {Route, route, RouteData, Param, Data} from './route';
export {handleHistory} from './browser';

export interface CVState {
    routeName: string;
    data: Data<string>;
}

export interface RouteView<Params extends string = string, Meta = {}> {
    routeName: string;
    route: Route<Params, Meta>;
    data: Data<Params>;
    state: CVState;
}

export interface RouterConfig {
    hashPrefix?: boolean;
    noRouteRedirect?: {routeName: string, data: Data<string>};
}

export interface RouteTable<Meta = {}> {
    [key: string]: Route<string, Meta>
}

export type TransitionHandler<Meta> = (type: TransitionType, oldCW: RouteView<string, Meta>, newCW: RouteView<string, Meta>, handleHistory: boolean) => void;

export type TransitionType = 'routeChange' | 'pathChange' | 'paramChange';

export class RouterCore<Meta = {}, Routes extends RouteTable<Meta> = RouteTable<Meta>> {
    cfg: RouterConfig;
    routes: Routes;
    currentView: RouteView<string, Meta>;
    private transitionHandlers: Array<TransitionHandler<Meta>> = [];

    constructor(cfg: RouterConfig, routes: Routes) {
        this.routes = routes;
        for (const name in routes) {
            routes[name].name = name;
        }
        this.cfg = cfg;
    }

    private resolveRoute<N extends keyof Routes, P extends string>(route: Route<P, Meta> | N): Route<string, Meta> {
        const found = typeof route === 'string'
            ? this.routes[route]
            : route;

        if (!found) {
            throw new Error(`Route [${route}] is not found`);
        }

        return found;
    }

    match(url: string): RouteView<string> | null {
        for (const routeName in this.routes) {
            const data = this.routes[routeName].parse(url);
            if (data) {
                const route = this.routes[routeName];

                return {
                    routeName,
                    route,
                    data,
                    state: route.getState(data)
                };
            }
        }
        return null;
    }

    build<N extends keyof Routes, P extends string>(route: Route<P, Meta> | N, data: Data<P>) {
        return this.resolveRoute(route).stringify(data);
    }

    initWithRoute<N extends keyof Routes, P extends string>(route: Route<P, Meta> | N, data: Data<P>) {
        this.go(route, data, true);
    }

    init() {
        const url = this.cfg.hashPrefix
            ? location.hash.slice(1)
            : location.href.slice(location.origin.length);

        const currentView = this.match(url);

        if (!currentView) {
            if (this.cfg.noRouteRedirect) {
                this.initWithRoute(this.cfg.noRouteRedirect.routeName, this.cfg.noRouteRedirect.data);
            } else {
                console.warn('bad route');
            }
            return;
        }

        this.initWithRoute(currentView.routeName, currentView.data);
    }

    go<N extends keyof Routes, P extends string>(route: Route<P, Meta> | N, data: Data<P>, silent?: boolean, handleHistory = true) {
        const resolved = this.resolveRoute(route);

        const newCW = {
            routeName: resolved.name,
            route: resolved,
            data: data,
            state: resolved.getState(data)
        }

        if (silent) {
            this.currentView = newCW;
            return;
        }

        let type: TransitionType;
        if (this.currentView.route === resolved) {
            const pathChanged = resolved.pathParams.some(paramName => {
                return this.currentView.data[paramName] !== (data as any)[paramName];
            });
            type = pathChanged ? 'pathChange' : 'paramChange';
        } else {
            type = 'routeChange';
        }

        this.transitionHandlers.forEach(handler => handler(type, this.currentView, newCW, handleHistory));
        this.currentView = newCW;
    }

    changeParams(dataDiff: Data<string>) {
        const newData = Object.assign({}, this.currentView.data);
        for (const name in dataDiff) {
            newData[name] = dataDiff[name];
        }
        this.go(this.currentView.route, newData);
    }

    onTransition(handler: TransitionHandler<Meta>) {
        this.transitionHandlers.push(handler);
    }
}
