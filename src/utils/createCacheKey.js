let createCacheKey = (base, query) =>{
    if(!query || Object.keys(query).length == 0)
    {
        return base;
    }
    let sortedQuery = Object.keys(query).sort().map((key)=> `${key}=${JSON.stringify(query[key])}`).join("&");
    return `${base}:${sortedQuery}`;
}

export default createCacheKey;