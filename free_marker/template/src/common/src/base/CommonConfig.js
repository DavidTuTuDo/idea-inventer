const edit = true;

class CommonConfig {
    getLabelByValue = (target, value) => {
        return Object.entries(target).find(([_, v]) => v === value)?.[0] ? target[Object.entries(target).find(([_, v]) => v === value)[0]] : undefined;
    };
}

export default CommonConfig;
