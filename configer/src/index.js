const GlobalConfig = {
    ENCRYPT_KEY: 'DavidIsProudOfSingle',
    IS_NODE_ENV: process.env.is_node,
    DEBUG_MODE: process.env.self_debug, /** use sample object under ./ObjectSamples/* */
    MAIN_MSG: {
        SHOW_ERROR: true,
        SHOW_SUCCEED: true,
    },
    MODULE_MSG: {
        SHOW_ERROR: false,
        SHOW_SUCCEED: false,
    },

    BASE_SHELL_SCRIPT: '/Users/davidtu/shell-script/webstorm_gen_command.sh',
    POOLLER_PRIORITY: ['high', 'medium', 'low'],
    POOLLER_STATE: {'RUN_BY_PARAMS': 0, 'RUN_BY_TIMES': 1, 'RUN_INFINITE': 2, 'RUN_BY_EACH_TASK': 3},

    /** 用來處理每一個task的timeout, 避免task處理太久卡在Queue裡面 */
    POOLLER_ENABLE_TASK_TIMEOUT: true,
    POOLLER_TASK_TIMEOUT_DEFAULT: 40000,

    /** 用來處理 Queue 當沒有工作(TASK)時, 設定多久後讓他的while停止, 減少不必要的耗能  */
    POOLLER_ENABLE_QUEUE_TERMINATE_BY_SLEEP_COUNT: true,
    POOLLER_QUEUE_MAX_SLEEP_COUNTS_DEFAULT: 15,
    POOLLER_QUEUE_TIME_OF_SLEEP_INTERVAL_DEFAULT: {min: 50, max: 200},

    /** 用來處理Task的延遲,假設要偷網頁東西, 不能太頻繁, 要偽裝成手動只能透過這方式, 如果是multi thread, 延遲是針對worker滿載後,再加進去的那一個 */
    POOLLER_ENABLE_TASK_SLEEP_BY_INTERVAL: false,
    POOLLER_TASK_OF_INTERVAL_DEFAULT: {min: 0, max: 10},

    PATH_ERROR_LOG: './error_logs.txt',
    PATH_INFO_LOG: './info_logs.txt',
};

export {GlobalConfig as configer};
