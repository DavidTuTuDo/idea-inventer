module.exports = {
    compress: {
        drop_console: true,      // 移除所有 console
        drop_debugger: true,     // 移除所有 debugger
        passes: 2,               // 壓縮兩次（更徹底）

        // 額外的壓縮選項
        dead_code: true,         // 移除永遠不會執行的代碼
        unused: true,            // 移除未使用的變數和函數
        warnings: false,         // 不顯示警告
        unsafe: false,           // 不使用不安全的優化
        unsafe_comps: false,     // 不使用不安全的比較優化
        unsafe_math: false,      // 不使用不安全的數學優化
        unsafe_proto: false,     // 不優化 prototype

        // 內聯選項
        inline: true,            // 內聯簡單的函數
        join_vars: true,         // 合併連續的 var 聲明
        reduce_vars: true,       // 優化變數賦值
        collapse_vars: true,     // 合併變數

        // 移除特定的函數調用
        pure_funcs: [],          // 可以添加要移除的純函數，如 ['console.log']
    },
    mangle: true,                // ✅ 混淆所有變數名（a, b, c...）
    // 可以選擇性保留某些名稱不被混淆
    // mangle: {
    //     reserved: ['$', 'exports', 'require'],  // 保留這些名稱
    //     keep_fnames: false,     // 不保留函數名
    //     keep_classnames: false  // 不保留類名
    // },

    format: {
        beautify: false,         // ✅ 不美化，壓縮成一行
        comments: false,         // ✅ 移除所有註解

        // 如果需要保留特定註解（如 license），可以用正則
        // comments: /^!|@preserve|@license|@cc_on/i,

        ascii_only: false,       // 支持 Unicode 字符
        quote_style: 3,          // 保持原有的引號風格
        wrap_iife: false,        // 不包裹立即執行函數
    },

    sourceMap: false             // 不生成 source map
};
