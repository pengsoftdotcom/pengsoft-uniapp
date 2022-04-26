<template>
    <view>
        <view
            class="home-menu-wrap"
            v-for="(item, index) in menus"
            :key="index"
            v-if="isMenuVisible(item)"
        >
            <uni-section :title="item.name" type="line">
                <view class="home-menu-container">
                    <view
                        v-for="(child, index2) in item.children"
                        :key="index2"
                        class="home-menu-item"
                        @click="handleClickMenu(child)"
                        v-if="isMenuVisible(child)"
                    >
                        <uni-icons
                            class="menu-icon"
                            :type="child.icon"
                            size="30"
                        />
                        <text class="menu-text"> {{ child.name }} </text>
                    </view>
                </view>
            </uni-section>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            menus: [
                {
                    name: '施工监管',
                    children: [
                        {
                            name: '安全质量检查',
                            icon: 'shop-filled',
                            page: '/module-ss/ss/safety-check/list/list',
                            roles: [
                                'ru_manager',
                                'owner_manager',
                                'su_manager',
                                'supervision_engineer',
                                'bu_manager',
                                'quality_inspector',
                                'security_officer'
                            ]
                        },
                        {
                            name: '安全教育培训',
                            icon: 'shop-filled',
                            page: '/module-ss/ss/safety-training/list/list',
                            roles: [
                                'ru_manager',
                                'owner_manager',
                                'bu_manager',
                                'security_officer',
                                'worker'
                            ]
                        }
                    ]
                },
                {
                    name: '薪酬监管',
                    children: [
                        {
                            name: '劳务合同',
                            icon: 'shop-filled',
                            page: '/module-oa/oa/contract/list/list',
                            roles: ['bu_manager', 'cashier']
                        },
                        {
                            name: '薪酬发放',
                            icon: 'shop-filled',
                            page: '/module-oa/oa/payroll-record/list/list',
                            roles: ['bu_manager', 'cashier']
                        }
                    ]
                },
                {
                    name: '汇总统计',
                    children: [
                        {
                            name: '检查数据',
                            icon: 'shop-filled',
                            page: '/module-statistics/statistics/safety-check/safety-check',
                            roles: [
                                'ru_manager',
                                'owner_manager',
                                'su_manager',
                                'bu_manager'
                            ]
                        },
                        {
                            name: '劳务合同',
                            icon: 'shop-filled',
                            page: '/module-statistics/statistics/contract/contract',
                            roles: ['ru_manager', 'owner_manager', 'bu_manager']
                        },
                        {
                            name: '工资支付',
                            icon: 'shop-filled',
                            page: '/module-statistics/statistics/payroll-record/payroll-record',
                            roles: ['ru_manager', 'owner_manager', 'bu_manager']
                        },
                        {
                            name: '项目看板',
                            icon: 'shop-filled',
                            page: '/module-statistics/statistics/construction-project/list/list',
                            roles: [
                                'ru_manager',
                                'owner_manager',
                                'su_manager',
                                'bu_manager'
                            ]
                        }
                    ]
                }
            ],
            time: ''
        };
    },
    onShow() {
        this.time = new Date();
    },
    methods: {
        isMenuVisible(menu) {
            let roles = [];
            if (menu.children) {
                menu.children.forEach((child) =>
                    child.roles.forEach((role) => roles.push(role))
                );
            } else {
                roles = menu.roles;
            }
            return uni.hasAnyRole(...roles);
        },
        handleClickMenu(item) {
            uni.navigateTo({
                url: item.page
            });
        }
    }
};
</script>

<style lang="scss">
.home-menu-wrap {
    margin: 8px;
    padding-bottom: 20px;
    border-radius: 4px;
    border: 1px solid #ebeef5;
    background: #ffffff;
    box-shadow: 0 3px 1px -2px #0003, 0 2px 2px #00000024, 0 1px 5px #0000001f;

    // reset
    .uni-section {
        margin: 0;
    }

    .home-menu-container {
        display: flex;
        flex-wrap: wrap;
        overflow: hidden;

        .home-menu-item {
            width: 33.33%;
            padding: 8px;
            box-sizing: border-box;
            flex: none;

            .menu-icon {
                display: block;
                text-align: center;
                padding: 8px;
            }

            .menu-text {
                display: block;
                text-align: center;
                font-size: 13px;
            }
        }
    }
}
</style>
