const GlobalConfig =
    {
        ENCRYPT_KEY: 'davidlovemimi',
        INVOKE_REAL_CHROME: false,
        PERMISSION_FORCE_DOWNLOAD_TONE: true,
        DEBUG_MODE: process.env.self_debug, /** use sample object under ./ObjectSamples/* */
        USE_SAMPLES_CACHE: false,

        CONTINUE_FROM_LAST_TIME: true,
        HACK_LIMITED_TESTING_MODE: false,
        DELAY_OF_MILLION_SECS: 800,

        PERMISSION_DOWNLOAD_DEPEND_ON_CLICK: true,
        HACK_PERMISSION_CLICKED_THRESHOLD: 10000,

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
            SHOW_ERROR: true,
            SHOW_SUCCEED: false,
        },

        BASE_URL: 'https://www.91pu.com.tw',
        TONES_ROOT: './Tones/',
        PATH_SAMPLE_OBJECT_ROOT: './ObjectSamples/',
        PATH_COMPLETED_SINGERS: './cache/completed_singer.txt',
        PATH_COMPLETED_TONES: './cache/completed_tone.txt',
        PATH_SAMPLE_URL_SONG_LIST: 'https://www.91pu.com.tw/singer/2015/0525/28.html',
        PATH_SAMPLE_URL_TONE: 'https://www.91pu.com.tw/song/2015/0903/620.html',
        PATH_SAMPLE_URL_SONG_RANK: 'https://www.91pu.com.tw/singer/',
        PATH_SAMPLE_URL_SINGER: 'https://www.91pu.com.tw/singer/',
        PATH_SAMPLE_URL_JEST_SAMPLE: 'https://www.91pu.com.tw/song/2020/0829/13002.html',
        PATH_SAMPLE_URL_BASE: 'https://www.91pu.com.tw/song/2020/0829/13002.html',

        SAMPLE_OBJECT_FILE_NAME_SINGER: 'AllSingerObject.txt',
        SAMPLE_OBJECT_FILE_NAME_SONG_RANK: 'WeekRankObject.txt',
        SAMPLE_OBJECT_FILE_NAME_TONE: 'ToneObject.txt',
        SAMPLE_OBJECT_FILE_NAME_SONG_LIST: 'SongListObject.txt',
        SAMPLE_OBJECT_FILE_JEST_SAMPLE: 'JestSampleObject.txt',
        SAMPLE_OBJECT_FILE_NAME_BASE: 'JestSampleObject.txt',

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


    };


export default GlobalConfig;
