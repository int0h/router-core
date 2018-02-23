export declare type Pattern<Params extends string> = Array<{
    $: Params;
} | string> | string;
export interface RouteData<Params extends string> {
    params?: {
        [key in Params]: Param | RegExp;
    };
}
export declare type Data<Params extends string> = {
    [key in Params]: any;
};
export declare type Param = {
    re?: RegExp;
    isNumber?: boolean;
    validator?: (s: string) => boolean;
};
export declare class Route<Params extends string> {
    pattern: Pattern<Params>;
    params: {
        [key in Params]: Param;
    };
    constructor(pattern: Pattern<Params>, cfg: RouteData<Params>);
    stringify(data: {
        [key in Params]: string;
    }): string;
    parse(url: string): Data<Params> | null;
}
export declare class Router<Routes extends {
    [key: string]: Route<string>;
}> {
    routes: Routes;
    constructor(routes: Routes);
}
