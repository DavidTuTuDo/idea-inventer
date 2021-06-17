const GlobalConfig = {
    ENCRYPT_KEY: 'davidlovemimi',
    IS_NODE_ENV: process.env.is_node,
    INVOKE_REAL_CHROME: false,
    PERMISSION_FORCE_DOWNLOAD_TONE: true,
    DEBUG_MODE: process.env.self_debug, /** use sample object under ./ObjectSamples/* */
    CONTINUE_FROM_LAST_TIME: true,
    USE_SQL_DATABASE: true,
    HACK_LIMITED_TESTING_MODE: false,
    PERMISSION_DOWNLOAD_DEPEND_ON_POPULAR: true,
    SKIP_DEPEND_ON_EXIST: true,
    HACK_FETCH_DEPEND_ON_POPULAR_LEVEL_THRESHOLD: 0, // 0 means all
    HACK_DELAY_OF_MILLION_SECS: 1200,// 0 means 或出去了
    HACK_LIMITED_COUNT_OF_DOWNLOAD_SINGER: 20,
    HACK_LIMITED_COUNT_OF_SONG_LIST: 3,

    SINGER_TYPE_OF_ALL: 6,
    SINGER_TYPE_OF_NORTH_EAST_ASIA: 5,
    SINGER_TYPE_OF_WESTERN: 4,
    SINGER_TYPE_OF_GROUP: 3,
    SINGER_TYPE_OF_FEMALE: 2,
    SINGER_TYPE_OF_MALE: 1,

    MAIN_MSG: {
        SHOW_ERROR: true,
        SHOW_SUCCEED: true,
    },

    MODULE_MSG: {
        SHOW_ERROR: false,
        SHOW_SUCCEED: false,
    },

    BASE_SHELL_SCRIPT: '/Users/davidtu/shell-script/webstorm_gen_command.sh',

    BASE_DATABASE_PATH: './secret_infos_latest.db',
    BASE_URL: 'https://www.91pu.com.tw',
    TONES_ROOT: './Tones/',
    PATH_SAMPLE_OBJECT_ROOT: './ObjectSamples/',
    PATH_FILE_COMPLETED_SINGERS: './cache/completed_singer.txt',
    PATH_FILE_COMPLETED_TONES: './cache/completed_tone.txt',
    PATH_SAMPLE_URL_SONG_LIST: 'https://www.91pu.com.tw/singer/2015/0525/28.html',
    PATH_SAMPLE_URL_TONE: 'https://www.91pu.com.tw/song/2015/0903/620.html',
    PATH_SAMPLE_URL_SONG_RANK: 'https://www.91pu.com.tw/singer/',
    PATH_SAMPLE_URL_SINGER: 'https://www.91pu.com.tw/singer/',
    PATH_SAMPLE_URL_JEST_SAMPLE: 'https://www.91pu.com.tw/song/2020/0829/13002.html',
    PATH_SAMPLE_URL_BASE: 'https://www.91pu.com.tw/song/2020/0829/13002.html',
    PATH_ERROR_LOG: './error_logs.txt',
    PATH_INFO_LOG: './info_logs.txt',
    PATH_DYNAMIC_INFO: './dynamic_info.js',


    SAMPLE_FILE_NAME_SINGER: 'AllSingerObject.txt',
    SAMPLE_FILE_NAME_SONG_RANK: 'WeekRankObject.txt',
    SAMPLE_FILE_NAME_TONE: 'ToneObject.txt',
    SAMPLE_FILE_NAME_SONG_LIST: 'SongListObject.txt',
    SAMPLE_FILE_JEST_SAMPLE: 'JestSampleObject.txt',
    SAMPLE_FILE_NAME_BASE: 'JestSampleObject.txt',

    /** firebase configs */
    DATA_BASE_URL: "https://mimi19up.firebaseio.com",
    PATH_ACCOUNT_ADMIN: "./key/mimi19up-firebase-adminsdk.json",
    REFERENCE_ROOT: '/',
    SEPARATE_TONE_SINGER: '編曲',
    REFERENCE_SINGER: 'SINGER',
    REFERENCE_PRICE: 'PlanOfPurchase',
    REFERENCE_SUGGEST_WORDS: 'SUGGEST_WORDS',
    REFERENCE_TONE: 'TONE',
    REFERENCE_INFO: 'INFO',
    REFERENCE_TYPE: 'TYPE',
    REFERENCE_SINGER_TONES: 'SINGER_TONES',
    REFERENCE_SUGGEST_TYPE: 'type',
    REFERENCE_SUGGEST_POPULAR: 'popular',
    REFERENCE_QUESTION: 'MIMI_QUESTION',
    REFERENCE_QUESTION_REPLY_RECORD: 'MIMI_QUESTION_REPLY_RECORD',
    REFERENCE_QUESTION_REPLY_WRONG: 'WRONG',
    REFERENCE_QUESTION_REPLY_HISTORY: 'HISTORY',


    TYPE_SUGGEST_SINGER: 1,
    TYPE_SUGGEST_TONE: 2,
    TYPE_SUGGEST_OTHER: 3,

    SQL_NEEDLESS_WHERE_START_OF: ['GROUP', 'LIMIT', 'ORDER', 'DISTINCT'],

    UID: 'uid',

    POOLLER_WORKER_DEFAULT: 1,
    POOLLER_PRIORITY: ['high', 'medium', 'low'],
    POOLLER_STATE: {'RUN_BY_PARAMS': 0, 'RUN_BY_TIMES': 1, 'RUN_INFINITE': 2, 'RUN_BY_EACH_TASK': 3},

    RANK_TABLE_TYPE: {
        FAVORITE: {ID: 3},
        LATEST: {ID: 2},
        POPULAR: {ID: 1, SORT: {YEAR: 5, SEASON: 4, MONTH: 3, WEEK: 2, DAY: 1}},

    },
    MAX_COUNTS_IN_RANK: 800, RANK_TABLE_NAME: 'RANK', DATABASE_COLUMN_STATE: ['DONE', 'ING', 'NOT'],

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

};

export {GlobalConfig as configer};
