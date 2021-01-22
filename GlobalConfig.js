const GlobalConfig =
    {
        ENCRYPT_KEY: 'davidlovemimi',

        INVOKE_REAL_CHROME: false,
        PERMISSION_FORCE_DOWNLOAD_TONE: true,
        DEBUG_MODE: process.env.self_debug, /** use sample object under ./ObjectSamples/* */
        CONTINUE_FROM_LAST_TIME: true,
        USE_SQL_DATABASE: true,
        PERSIST_ERROR_LOG: true,
        HACK_LIMITED_TESTING_MODE: false,
        PERMISSION_DOWNLOAD_DEPEND_ON_POPULAR: true,
        SKIP_DEPEND_ON_EXIST: true,


        THREAD_WORKER: 3,
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

        BASE_DATABASE_PATH: './database/secret_infos.db',
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
        REFERENCE_SUGGEST_WORDS: 'SUGGEST_WORDS',
        REFERENCE_TONE: 'TONE',
        REFERENCE_INFO: 'INFO',
        REFERENCE_TYPE: 'TYPE',
        REFERENCE_SINGER_TONES: 'SINGER_TONES',
        REFERENCE_SUGGEST_TYPE: 'type',
        REFERENCE_SUGGEST_POPULAR: 'popular',

        TYPE_SUGGEST_SINGER: 1,
        TYPE_SUGGEST_TONE: 2,
        TYPE_SUGGEST_OTHER: 3,

        SQL_NEEDLESS_WHERE_START_OF: ['GROUP', 'LIMIT', 'ORDER', 'DISTINCT'],

        UID: 'uid',

        POOLLER_WORKER_DEFAULT: 3,
        POOLLER_PRIORITY: ['high', 'medium', 'low'],
        POOLLER_SLEEP_RANGE_DEFAULT: {min: 2000, max: 10000},
        POOLLER_TASK_INTERVAL_DEFAULT: {min: 800, max: 2500},
        POOLLER_MAX_SLEEP_DEFAULT: 100,
    };


export default GlobalConfig;
