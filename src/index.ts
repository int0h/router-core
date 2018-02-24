import {Route, Data} from './route';
export {Route, route, RouteData, Param, Data} from './route';

export interface RouteView<Params extends string> {
    routeName: string;
    route: Route<Params>;
    data: Data<Params>;
}

export type TransitionType = 'routeChange' | 'pathChange' | 'paramChange';

export abstract class RouterCore<Routes extends {[key: string]: Route<string>}> {
    routes: Routes;
    currentView: RouteView<string>;

    constructor(routes: Routes) {
        this.routes = routes;
        for (const name in routes) {
            routes[name].name = name;
        }
    }

    private resolveRoute<N extends keyof Routes, P extends string>(route: Route<P> | N): Route<string> {
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
                return {
                    routeName,
                    route: this.routes[routeName],
                    data
                };
            }
        }
        return null;
    }

    build<N extends keyof Routes, P extends string>(route: Route<P> | N, data: Data<P>) {
        return this.resolveRoute(route).stringify(data);
    }

    init<N extends keyof Routes, P extends string>(route: Route<P> | N, data: Data<P>) {
        this.go(route, data, true);
    }

    go<N extends keyof Routes, P extends string>(route: Route<P> | N, data: Data<P>, silent?: boolean) {
        const resolved = this.resolveRoute(route);

        const newCW = {
            routeName: resolved.name,
            route: resolved,
            data: data
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

        this.handleTransition(type, this.currentView, newCW);
        this.currentView = newCW;
    }

    changeParams(dataDiff: Data<string>) {
        const newData = Object.assign({}, this.currentView.data);
        for (const name in dataDiff) {
            newData[name] = dataDiff[name];
        }
        this.go(this.currentView.route, newData);
    }

    abstract handleTransition(type: TransitionType, oldCW: RouteView<string>, newCW: RouteView<string>): void;

}
