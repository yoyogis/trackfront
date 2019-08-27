
let data = [];
let dataBySession = {};
let connections = {};
let filters = {};
function getData() {
    return data;
}

function addData(item) {
    console.log("addData of sessionId:" + item.sessionId)
    data.push(item);
    if (!dataBySession[item.sessionId]) {
        dataBySession[item.sessionId] = [];
        sentMessages({ newSessionId: item.sessionId });
    }

    dataBySession[item.sessionId].push(item);
    sentMessages(item);
}

function addConnection(id, connection) {
    connections[connection.id] = connections[connection.id] || {};
    connections[connection.id].connection = connection;
}

function removeConnection(connection) {
    delete connections[connection.id];
}

function sentMessages(item) {
    Object.keys(connections).forEach((connectionId) => {
        let filter = connections[connectionId].filter;
        //给指定sessionId发送
        if (item.sessionId && filter && filter.sessionId) {
            if (item.sessionId == filter.sessionId) {
                connections[connectionId].connection.emit('track', item);
                if (item.performance_entries || item.ajaxError) {
                    connections[connectionId].connection.emit('track', calculateAjaxStatistic(dataBySession[item.sessionId]));
                }
            }
        } else {
            //未指定sessionId，统一发送
            connections[connectionId].connection.emit('track', item);
            if (item.performance_entries || item.ajaxError) {
                connections[connectionId].connection.emit('track', calculateAjaxStatistic(data));
            }
        }


    })
}

function calculateAjaxStatistic(tracks) {
    console.log("into error:");
    let successAjaxCount = 0;
    let errorCount = 0;
    tracks.forEach(aTrack => {
        if (aTrack.performance_entries) {
            let ajax = aTrack.performance_entries.filter(entriy => entriy.entryType=="resource"&&(entriy.initiatorType === "xmlhttprequest"||entriy.initiatorType === "fetch"));
            successAjaxCount += ajax.length;
        }
        if (aTrack.ajaxError) {
            errorCount += aTrack.ajaxError.length;
        }
    });

    return {
        timstamp: Date.now(),
        ajaxErrorCount: errorCount,
        successAjaxCount: successAjaxCount,
        ajaxCount: successAjaxCount + errorCount
    };
}

function getSessions(online) {
    let ids = Array.from(new Set(data.map(oneTrack => oneTrack.sessionId)));
    // if(online){
    //     ids = ids.filter(sessionId=>{
    //         return (Date.now()-dataBySession[sessionId][0].trackTimestamp) < 3000;
    //     })
    // }
    return ids;
}

function updateFilter(connectionId, filter) {
    if(filter.sessionId&&(!connections[connectionId].filter||filter.sessionId!=connections[connectionId].filter.sessionId)){
        sentHistoryMessages(connectionId, filter.sessionId);
    }
    connections[connectionId].filter = filter;
}

function sentHistoryMessages(connectionId, sessionId){
    
    let tracks = dataBySession[sessionId];
    if(tracks){
        tracks.forEach(oneTrack=>{
            connections[connectionId].connection.emit('track', oneTrack);
        });   
    }
    
}

function getTracks(sessionId) {
    if (sessionId) {
        return dataBySession[sessionId];
    } else {
        return data;
    }
}

function getMetadata() {
    return [
        {
            field: "basic",
            name: "基本信息",
            children: [
                {
                    name: "客户端系统",
                    field: "navigator_platform"
                },
                {
                    name: "返回浏览器名称",
                    field: "navigator_appName"
                },
                {
                    name: "返回浏览器及版本信息",
                    field: "navigator_userAgent"
                },
                {
                    name: "显示器高度",
                    field: "window_screen_height"
                },
                {
                    name: "显示器高度",
                    field: "window_screen_width"
                },
                {
                    name: "浏览器默认语言",
                    field: "navigator_language"
                }]
        },
        {
            field: "memory",
            name: "浏览器内存",
            description: "只有Chrome支持",
            children: [
                { field: "totalJSHeapSize", name: "Javascript的内存总量" },
                { field: "jsHeapSizeLimit", name: "Javascript的剩余内存" },
                { field: "usedJSHeapSize", name: "Javascript占用内存" },
                { field: "timestamp", name: "时间戳" }
            ]
        },
        {
            field:"timing",
            name:"首页加载时间",
            description:"参考文档: https://www.w3.org/TR/navigation-timing/#sec-navigation-timing-interface",
            children:[
                { 
                    field:"connectEnd",
                    name:"TCP连接成功"
                },
                { 
                    field:"connectStart",
                    name:"TCP建立连接"
                },
                { 
                    field:"domComplete",
                    name:"html文档完全解析完毕"
                },
                { 
                    field:"domContentLoadedEventEnd",
                    name:"DOMContentLoaded事件完成"
                },
                { 
                    field:"domContentLoadedEventStart",
                    name:"DOMContentLoaded事件触发"
                },
                { 
                    field:"domInteractive",
                    name:"览器解析html文档的状态为interactive"
                },
                { 
                    field:"domLoading",
                    name:""
                },
                { 
                    field:"domainLookupEnd",
                    name:""
                },
                { 
                    field:"domainLookupStart",
                    name:""
                },
                { 
                    field:"fetchStart",
                    name:""
                },
                { 
                    field:"loadEventEnd",
                    name:""
                },
                { 
                    field:"loadEventStart",
                    name:""
                },
                { 
                    field:"navigationStart",
                    name:""
                },
                { 
                    field:"redirectEnd",
                    name:""
                },
                { 
                    field:"redirectStart",
                    name:""
                },
                { 
                    field:"requestStart",
                    name:""
                },
                { 
                    field:"responseEnd",
                    name:""
                },
                { 
                    field:"responseStart",
                    name:""
                },
                { 
                    field:"secureConnectionStart",
                    name:""
                },
                { 
                    field:"unloadEventEnd",
                    name:""
                },
                { 
                    field:"unloadEventStart",
                    name:""
                },
            ]
        },
        {
            field: "memory",
            name: "浏览器内存",
            children: [
                { field: "totalJSHeapSize", name: "Javascript的内存总量" },
                { field: "jsHeapSizeLimit", name: "Javascript的剩余内存" },
                { field: "usedJSHeapSize", name: "Javascript占用内存" },
                { field: "timestamp", name: "时间戳" }
            ]
        },
        {
            field: "refreshRate",
            name: "页面刷新频率",
            description:"通过requestAnimationFrame调用得到的近似值",
            children: [
                {
                    field:"timestamp",
                    name:"时间戳"
                },
                {
                    field:"rate",
                    name:"刷新频率",
                    description:"近似参考值"
                }
            ]
        },
        {
            field:"event",
            name:"用户事件",
            children:[
                {
                    field:"timestamp",
                    name:"时间戳"
                },
                {
                    field:"location_herf",
                    name:"当前Url"
                },
                {
                    field:"eventName",
                    name:"事件名"
                },
                {
                    field:"target",
                    name:"目标元素"
                }
            ]
        },
        {
            field:"performance_entries",
            name:"资源请求",
            description:"参考: https://www.w3.org/TR/performance-timeline-2/#the-performanceentry-interface",
            children:[
                {
                    field:"name",
                    name:"资源名"
                },
                {
                    field:"entryType",
                    name:"资源入口类型",
                    description:"可取值：resource,marker,measure,navigation"
                },
                {
                    field:"initiatorType",
                    name:"请求类型(fetch,xmlhttprequest,css,script,beacon,other)"
                },
                {
                    field:"connectEnd",
                    name:"连接结束时间"
                },
                {
                    field:"connectStart",
                    name:"连接开始时间"
                },
                {
                    field:"decodedBodySize",
                    name:"解码之后的response body大小"
                },
                {
                    field:"domainLookupEnd",
                    name:"域名解析结束时刻"
                },
                {
                    field:"domainLookupStart",
                    name:"域名解析开始时刻"
                },
                {
                    field:"duration",
                    name:"请求持续时间，responseEnd-startTime"
                },
                {
                    field:"encodedBodySize",
                    name:"编码之后的response body大小"
                },
                {
                    field:"fetchStart",
                    name:"开始时间"
                }
            ]
        },
        {
            field:"error",
            name:"前端异常信息",
            children:[
                {
                    field:"message",
                    name:"异常消息描述"
                },{
                    field:"stack",
                    name:"调用堆栈"
                },
                {
                    field:"location_herf",
                    name:"当前Url"
                },
                {
                    field:"timestamp",
                    name:"时间戳"
                }
            ]
        },
        {
            field:"ajaxError",
            name:"服务端异常信息",
            children:[
                {
                    field:"responseURL",
                    name:"请求url"
                },
                {
                    field:"status",
                    name:"请求状态"
                },
                {
                    field:"statusText",
                    name:"状态文本"
                },
                {
                    field:"response",
                    name:"返回的信息"
                },
                {
                    field:"timestamp",
                    name:"请求结束时间"
                }
            ]
        }

    ]
}

let TrackApi = {
    addData: addData,
    addConnection: addConnection,
    removeConnection: removeConnection,
    getSessions: getSessions,
    updateFilter: updateFilter,
    getTracks: getTracks,
    getMetadata: getMetadata
}

module.exports = TrackApi;