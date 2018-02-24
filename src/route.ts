import {parseUrl, trimSlashes, stringifyQuery} from './utils';

export type Pattern<Params extends string> = Array<{$: Params} | string>;

export interface RouteData<Params extends string> {
    params?: {[key in Params]: Param | RegExp}
}

export function route<Meta = {}, Params extends string = string>
        (pattern: Pattern<Params> | string, config: RouteData<Params> & Meta): Route<Params, Meta>
    {
    if (typeof pattern === 'string') {
        pattern = [trimSlashes(pattern)];
    }
    return new Route(pattern, config);
}

export type Data<Params extends string> = {
    [key in Params]: string | string[];
}

export type Param = {
    re?: RegExp;
    //isNumber?: boolean;
    validator?: (s: string) => boolean;
    // acceptSlashes?: boolean;
};

function parseParam(param: Param, code: string): string | null {
    if (param.re && !param.re.test(code)) {
        return null;
    }

    return code;
}

export class Route<Params extends string, Meta = {}> {
    pattern: Pattern<Params>;
    params: {[key in Params]: Param};
    pathParams: string[] = [];
    name: string;
    meta = {} as Meta;

    constructor(pattern: Pattern<Params>, cfg: RouteData<Params> & Meta) {
        this.pattern = pattern;

        this.pattern.forEach(item => {
            if (typeof item !== 'string') {
                this.pathParams.push(item.$);
            }
        })

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

    stringify(data: Data<Params>): string {
        let usedKeys: string[] = [];

        const path = '/' + this.pattern.map(part => {
            if (typeof part === 'string') {
                return part;
            }

            usedKeys.push(part.$);

            const value = data[part.$];

            if (Array.isArray(value)) {
                throw new Error('array values cannot be passed as path params');
            }

            return value;
        }).join('/');

        if (Object.keys(data).length <= usedKeys.length) {
            return path;
        }

        let restParams: {[key: string]: string | string[]} = {};

        for (const name in data) {
            if (usedKeys.indexOf(name) === -1) {
                restParams[name] = data[name];
            }
        }

        return path + '?' + stringifyQuery(restParams);
    }

    private parsePath(path: string): Data<Params> | null {
        let data = {} as Data<Params>;

        path = trimSlashes(path);

        const parts = path.split('/');

        for (let i = 0; i < this.pattern.length; i++) {
            const urlPart = parts[i];
            const patternPart = this.pattern[i];

            if (!urlPart) {
                return null;
            }

            if (typeof patternPart === 'string') {
                if (patternPart !== urlPart) {
                    return null;
                } else {
                    continue;
                }
            }

            const paramName = patternPart.$;
            const param = this.params[paramName];

            const parsed = parseParam(param, urlPart);
            if (parsed === null) {
                return null;
            }
            data[paramName] = parsed;
        }

        return data;
    }

    parse(url: string): Data<Params> | null {
        const {path, query} = parseUrl(url);

        const pathData = this.parsePath(path);

        if (!pathData) {
            return null;
        }

        return Object.assign({}, pathData, query);
    }

    getState(data: Data<Params>): {routeName: string, data: Data<Params>} {
        return {data, routeName: this.name};
    }

}
