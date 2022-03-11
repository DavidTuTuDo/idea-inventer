const struct = {
    path: '/navigator',
    name: 'navigator',
    useInjectStore: true,
    events: [
        {
            name: 'authStateChanged',
            params: ['user']
        },

    ],
    struct: {
        name: `navigator`,
        view: 'div',
        type: 'object',
        children: [
            {
                name: 'appBar',
                view: 'AppBar',
                type: 'object',
                children: [{
                    name: 'toolBar',
                    view: `Toolbar`,
                    type: 'object',
                    children: [
                        {
                            name: 'menu',
                            view: 'IconButton',
                            click: true,
                            props: {
                                edge: 'start',
                                color: 'inherit',
                            },
                            children: [
                                {
                                    name: 'icon',
                                    view: 'MenuIcon'
                                }
                            ]
                        },
                        {
                            name: 'title',
                            view: 'Typography',
                            type: 'string',
                            defaultValue: '明玥科技',
                            click: true,
                        },
                        {
                            name: 'toEditMode',
                            defaultValue: '切換至編輯模式',
                            view: 'Button',
                            type: 'string',
                            props: {
                                variant: `outlined`,
                                color: 'secondary',
                            },
                            injectStyle: true,
                            click: true,
                        },
                        {
                            name: `login`,
                            defaultValue: `登入`,
                            view: 'Button',
                            type: 'string',
                            props: {
                                variant: `outlined`,
                                color: 'primary',
                            },
                            click: true,
                        },

                    ]
                }],
            },
            {
                name: 'drawer',
                view: 'Drawer',
                type: 'object',
                props: {
                    anchor: 'top',
                    classes: '###{paper:classes.paper}',
                    onClose: '###() => self.onDrawerClosed()',
                    open: '###self.getDrawerOpenStatus()',
                },
                children: [
                    {
                        name: 'shortcut',
                        plural: 's',
                        path: '/shortcuts',
                        listView: 'List',
                        conditions: [`{orderBy:(stmt) => stmt.orderBy('indexOfSequence')}`],
                        type: 'array',
                        permission: {
                            create: 'isAdmin()',
                            update: 'isAdmin()',
                            read: 'alwaysTrue()',
                            delete: 'isAdmin()',
                        },
                        view: 'ListItem',
                        children: [
                            {
                                column: true,
                                name: 'indexOfSequence',
                                type: 'number',
                                description: '用來調整順序orderBy'

                            },
                            {
                                column: true,
                                name: 'title',
                                view: 'Typography',
                                type: 'string',
                            },
                            {
                                column: true,
                                name: 'route',
                                type: 'string',
                                /** 'path:https://www.google.com/' or  `route:exam:31232:tedsld` page後面接的是param */
                            },
                            {
                                column: true,
                                name: 'icon',
                                view: 'img',
                                type: 'string',
                                /**  'muIcon:HelpCenter' or 'path:https://www.google.com/' */
                            },
                            {
                                name: 'open',
                                type: 'number',
                            },
                            {
                                column: true,
                                name: 'sub',
                                plural: 's',
                                ref: 'shortcut',
                            },

                        ]
                    },
                    {
                        name: 'myShortcut',
                        plural: 's',
                        ref: 'shortcut',
                        type: 'array',
                        initFetchOnlyLogin: true,
                        permission: {
                            create: 'isSelf(uid)',
                            update: 'isSelf(uid)',
                            read: 'isSelf(uid)',
                            delete: 'isSelf(uid)',
                        },
                        independence: true,
                        path: '/users/:uid/shortcuts',
                    }
                ]
            },
            {
                name: `credential`,
                type: `object`,
                children: [
                    {name: 'accessToken', type: 'string'},
                    {name: 'idToken', type: 'string'},
                    {name: 'oauthIdToken', type: 'string'},
                    {name: 'oauthAccessToken', type: 'string'},
                ],
            },
            {
                name: `userInfo`,
                path: '/users/:uid',
                type: `object`,
                initFetchOnlyLogin: true,
                permission: {
                    create: 'isSelf(uid)',
                    update: 'isSelf(uid)',
                    read: 'isAdmin() || isSelf(uid)',
                },
                children: [
                    {
                        name: 'uid',
                        column: true,
                        type: 'string'
                    },
                    {
                        name: 'email',
                        column: true,
                        type: 'string'
                    },
                    {
                        name: 'isAnonymous',
                        column: true,
                        type: 'number'
                    },
                    {
                        name: 'displayName',
                        column: true,
                        type: 'string'
                    },
                    {
                        name: 'photoUrl',
                        column: true,
                        type: 'string'
                    },
                    {
                        name: 'phoneNumber',
                        column: true,

                        type: 'string'
                    },
                    {
                        name: 'refreshToken',
                        column: true,

                        type: 'string'
                    },
                    {
                        name: 'emailVerified',
                        column: true,
                        type: 'number'
                    },
                ],
            }
        ]
    }
}

export default struct;
