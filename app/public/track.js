(function () {
    let POST_INTERVAL = 3000;
    let GET_ENTRIES_INTERVAL = 1000;
    let GET_MEMORY_INTERVAL = 1000;
    let GET_REFRESH_RATE_INTERVAL = 5000;
    let trackServiceUrl = 'http://127.0.0.1:7001/track';
    let recordData = {};
    let reportZone;
    /** */
    window.track = init();

    /**
     * 返回track函数供用户使用
     */
    function init() {
        try {
            recordBasicInfo();
            recordPerformance();
            recordAjax();
            recordMemory();
            recordRefreshRate();
            postData();
        } catch (error) {
            console.error(error);
        }

        //依赖Zone.js
        var Zone = window.Zone;
        if (!Zone) {
            throw new Error("请引入Zone.js");
        }

        reportZone = Zone.root.fork({
            name: 'reportZone'
        });


        let trackZone = Zone.root.fork({
            name: 'trackZone',
            //监控错误
            onHandleError: function (parentZoneDelegate, currentZone, targetZone, error) {
                recordError(error);
                return parentZoneDelegate.handleError(targetZone, error);
            },

            //监控所有异步行为：setTimeout/Ajax请求/鼠标键盘事件
            onInvokeTask: function (parentZoneDelegate, currentZone, targetZone, task, applyThis, applyArgs) {
                console.log("onInvokeTask:", currentZone.name, "--", targetZone.name, "---:", task.source, "-", task.type);
                //event
                if (task.type == "eventTask"&&task.eventName!='load') {
                    recordEvent(task);
                }if(task.type=="macroTask"&&task.source=="XMLHttpRequest.send"&&task.state == "running"){
                    recordAjaxError(task);
                }
                parentZoneDelegate.invokeTask(targetZone, task, applyThis, applyArgs);
            },
        });

        function track(callback) {
            trackZone.run(() => {
                callback.apply(this);
            });
        }
        return track;
    }

    function postData() {
        setInterval(() => {
            run();
        }, POST_INTERVAL);

        //立即执行
        run();

        function run() {
            if (Object.keys(recordData).length) {
                reportZone ? reportZone.run(() => {
                    post()
                }) : post();
            }
        }

        function post() {
            let data = recordData;
            recordData = {};
            $.ajax({
                xhrFields: {
                    withCredentials: true
                },
                type: "post",
                data: data,
                url: trackServiceUrl,
                dataType: "json",
                success: function (json) {
                    console.log(json);
                },
                error: function () {
                    console.log('fail');
                }
            });
        }
    }


    /**
     * 浏览器基本信息 navigator
     */
    function recordBasicInfo() {
        let result = {
            timestamp: Date.now()
        };
        //客户端系统
        result.navigator_platform = navigator.platform;
        //返回浏览器名称
        result.navigator_appName = navigator.appName;
        //返回浏览器及版本信息
        result.navigator_userAgent = navigator.userAgent;
        //显示器高度
        result.window_screen_height = window.screen.height;
        //显示器高度
        result.window_screen_width = window.screen.width;
        //浏览器默认语言
        result.navigator_language = navigator.language;
        //url
        result.location_herf = location.href;
        recordData.basic = result;
    }

    /**
     * 性能信息
     */
    function recordPerformance() {
        var time = performance.timing;
        if (time.loadEventEnd == 0 || time.loadEventStart == 0) {
            setTimeout(function () {
                recordPerformance();
            }, 200);
        } else {
            recordData.timing = time.toJSON();
        }
    }

    /**
     * 内存监控
     */
    function recordMemory(){
        if(performance.memory){
            setInterval(()=>{
                recordData.memory = {
                    timestamp:Date.now(),
                    location_herf : location.href,
                    "totalJSHeapSize": performance.memory.totalJSHeapSize,
                    "usedJSHeapSize": performance.memory.usedJSHeapSize,
                    "jsHeapSizeLimit": performance.memory.jsHeapSizeLimit
                };
            }, GET_MEMORY_INTERVAL);
        }
    }

    /**
     * 刷新频率
     */
    function recordRefreshRate(){
        setInterval(()=>{
            testRefreshRate().then(function(rate){
                recordData.refreshRate = {
                    timestamp : Date.now(),
                    location_herf : location.href,
                    rate: Math.round(1000/rate)
                }
            });
        }, GET_REFRESH_RATE_INTERVAL)

        function testRefreshRate(){
            return new Promise(function(resolve, reject) {
                var last = Date.now();
                var data1 = [];
                var logTime = function(){
                    let now = Date.now(); 
                    data1.push(now-last);
                    last=now;
                    if(data1.length<100){
                        window.requestAnimationFrame(logTime);
                    }else{
                        resolve(data1.reduce((pre, current)=>{return pre+current}, 0)/data1.length);
                    }
                }
                logTime();
            });
        }
    }

    /**
     * 用户事件
     */
    function recordEvent(eventTask) {
        recordData.event = recordData.event || [];
        let result = {
            timestamp: Date.now(),
            location_herf: location.href
        };
        result.eventName = eventTask.eventName;
        result.target = Utils.cssPath(eventTask.target);
        recordData.event.push(result);
    }

    /**
     * Ajax请求
     */
    function recordAjax() {
        let count = 0;
        (function () {
            setInterval(getEntries, GET_ENTRIES_INTERVAL);

            function getEntries() {
                recordData.performance_entries = recordData.performance_entries || [];
                let entries = performance.getEntries();
                let result = entries.slice(count);
                result = result.filter(function (item) {
                    //ignore track data post service
                    return !((item.entryType=='resource'&&(item.name == trackServiceUrl))||(item.name.indexOf("Zone")==0))
                }).map(function (item) {
                    return item.toJSON();
                });
                recordData.performance_entries = recordData.performance_entries.concat(result);
                if (recordData.performance_entries && recordData.performance_entries.length == 0) {
                    delete recordData.performance_entries;
                }
                count = entries.length;
            }
        })();
    }

    /**
     * 异常信息
     */
    function recordError(error) {
        recordData.error = recordData.error || [];
        result = {
            message: error.message,
            stack: error.stack,
            location_herf:location.href,
            timestamp:Date.now()
        }
        recordData.error.push(result);
    }

    /**
     * ajax请求错误
     */
    function recordAjaxError(ajaxTask) {
        recordData.ajaxError = recordData.ajaxError || [];
        let target = ajaxTask.data.target;
        let status = target.status;
        if(status&&status>=400){
            let result = {};
            result.responseURL = target.responseURL;
            result.status = status;
            result.statusText = target.statusText;
            result.response = target.response;
            result.timestamp = Date.now();
            result.location_herf = location.href;
            recordData.ajaxError.push(result);
        }
    }
})();