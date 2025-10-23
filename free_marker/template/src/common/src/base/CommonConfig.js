const edit = true;

class CommonConfig {
    getLabelByValue = (values, labels, value) => {
        return Object.entries(values).find(([_, v]) => v === value)?.[0] ? labels[Object.entries(values).find(([_, v]) => v === value)[0]] : undefined;
    };
}

export default CommonConfig;
