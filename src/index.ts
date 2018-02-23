export type Pattern<Params extends string> = Array<{$: Params} | string> | string;

export interface RouteData<Params extends string> {
    params?: {[key in Params]: Param | RegExp}
}

export function route<Params extends string>(pattern: Pattern<Params>, config: RouteData<Params>): Route<Params> {
    return new Route(pattern, config);
}

export type Data<Params extends string> = {
    [key in Params]: any;
}

export type Param = {
    re?: RegExp;
    //isNumber?: boolean;
    validator?: (s: string) => boolean;
    // acceptSlashes?: boolean;
};

function parseSimpleParam(url: string, offset: number): string | null {
    let end = url.lastIndexOf('/', offset) + offset;
    if (end === -1) {
        end = url.length;
    }
    const str = url.slice(offset, end);
    return str || null;
}

function parseParam(param: Param, url: string, offset: number): string | null {
    const simple = parseSimpleParam(url, offset);

    if (simple === null) {
        return null;
    }

    if (param.re && !param.re.test(simple)) {
        null;
    }

    // if (param.isNumber) {
    //     const num = Number(simple);
    //     if (isNaN(num)) {
    //         return null;
    //     }
    //     return num;
    // }

    return simple;
}

export class Route<Params extends string> {
    pattern: Pattern<Params>;
    params: {[key in Params]: Param};

    constructor(pattern: Pattern<Params>, cfg: RouteData<Params>) {
        this.pattern = pattern;

        this.params = {} as any;
        if (cfg.params) {
            for (const name in cfg.params) {
                let param = cfg.params[name] as RegExp | Param;

                if (param instanceof RegExp) {
                    param = {re: param};
                }

                this.params[name] = param;
            }
        }
    }

    stringify(data: {[key in Params]: string}): string {
        if (typeof this.pattern === 'string') {
            return this.pattern;
        }

        return '/' + this.pattern.map(part => {
            if (typeof part === 'string') {
                return part;
            }

            return data[part.$];
        }).join('/');
    }

    parse(url: string): Data<Params> | null {
        let urlOffset = 0;
        let data = {} as Data<Params>;

        for (const part of this.pattern) {
            if (typeof part === 'string') {
                urlOffset = url.indexOf('/' + part);
                if (urlOffset !== 0) {
                    return null;
                }
                urlOffset += part.length + 1;
                continue;
            }
            const paramName = part.$;
            const param = this.params[paramName];
            const founded = parseParam(param, url, urlOffset);
            if (founded === null) {
                return null;
            }
            data[paramName] = founded;
            urlOffset += founded.length;
        }

        return data;
    }

}

export class Router<Routes extends {[key: string]: Route<string>}> {
    routes: Routes;

    constructor(routes: Routes) {
        this.routes = routes;
    }

    // stringify<Name extends keyof Routes>(name: Name, data: {[key in Routes[Name]['params']]: string}): string {
    //     const route = this.routes[name];

    //     if (!route) {
    //         throw new Error(`Route '${name}' is not found!`);
    //     }

    //     if (typeof route.pattern === 'string') {
    //         return route.pattern;
    //     }

    //     return route.pattern.map(part => {
    //         if (typeof part === 'string') {
    //             return part;
    //         }

    //         return data[part.$];
    //     }).join('/');
    // }
}

// const router = new Router({
//     foo: route(['sad', {$: 'a'}, {$: 'b'}], {
//         params: {
//             a: {},
//             b: {}
//         }
//     })
// });

// router.routes.foo
