const component = {
    name: "demeter",
    path: "/demeter",
    disposablePage: true,
    struct: {
        name: "demeter",
        type: "object",
        view: "div",
        injectView: true,
        children: [
            {
                name: "course",
                plural: "s",
                type: "array",
                children: [
                    {
                        name: "id",
                        type: "string",
                        description: "用來當作key"
                    },
                    {
                        name: "period",
                        type: "string",
                        example: "202510181700-202510181900"
                    },
                    {
                        name: "name",
                        type: "string",
                        description: "課程名稱"
                    },
                    {
                        name: "color",
                        type: "string",
                        defaultValue: "default"
                    },
                    {
                        name: "idOfBooze",
                        type: "string"
                    },
                    {
                        name: "idOfVariant",
                        type: "string"
                    },
                    {
                        name: "useMainTrunk",
                        type: "boolean"
                    }
                ]
            }
        ]
    }
};

export default component;
