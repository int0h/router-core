export function trimSlashes(str: string): string {
    return str.slice(
        str[0] === '/' ? 1 : 0,
        str[str.length - 1] === '/' ? -1 : str.length
    );
}

export function parseUrlPath(url: string) {
    const hashPos = url.indexOf('#');
    let beginning: string;
    let hash: string;
    if (hashPos === -1) {
        beginning = url;
        hash = '';
    } else {
        beginning = url.slice(0, hashPos);
        hash = url.slice(hashPos);
    }
    const [path, query] = beginning.split('?');
    return {path, hash, query: query || ''};
}

export function parseQuery(query: string): QueryData {
    if (query.length === 0) {
        return {};
    }
    const pairs = query.split('&');
    let resultObj: any = {};
    for (const pair of pairs) {
        const [name, value] = pair.split('=').map(decodeURIComponent);
        if (resultObj[name]) {
            if (!Array.isArray(resultObj[name])) {
                resultObj[name] = [resultObj[name]];
            }
            resultObj[name].push(value);
            continue;
        }
        resultObj[name] = value;
    }
    return resultObj;
}

export interface QueryData {
    [key: string]: string | string[];
}

export interface UrlData {
    path: string;
    query: QueryData;
    hash: string;
}

export function parseUrl(url: string): UrlData {
    const {path, query, hash} = parseUrlPath(url);
    return {path, hash, query: parseQuery(query)};
}

export function stringifyQuery(query: QueryData): string {
    return Object.keys(query)
        .map(name => {
            const value = query[name];
            if (Array.isArray(value)) {
                return value.map(item => {
                    return [name, item].map(encodeURIComponent).join('=');
                }).join('&');
            }
            return [name, value].map(encodeURIComponent).join('=');
        })
        .join('&');
}
