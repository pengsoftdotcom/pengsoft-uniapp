<template>
    <view>
        <u--input
            placeholder="请输入姓名、手机号码或身份证号"
            v-model="keyword"
            @change="change"
            suffixIcon="search"
            clearable
            :customStyle="{ margin: '0 11px', background: '#ffffff' }"
        ></u--input>
        <view class="w-list-wrap">
            <view
                v-for="(item, index) in listData"
                :key="index"
                class="w-list-item"
                @click="edit(item.id, 'detail')"
            >
                <view class="w-list-item-title ellipsis-2">{{
                    item.staff.person.name
                }}</view>
                <view class="w-list-item-body">
                    <view style="display: flex">
                        <text style="flex: auto">
                            总收入: {{ item.grossPay ? item.grossPay : 0 }}
                        </text>
                        <text style="flex: none">
                            净收入: {{ item.netPay ? item.netPay : 0 }}
                        </text>
                    </view>
                </view>
            </view>
        </view>
        <uni-load-more
            :status="status"
            :icon-size="16"
            :content-text="contentText"
        />
    </view>
</template>

<script>
export default {
    data() {
        return {
            ...uni.$u.deepClone(uni.listModel),
            keyword: '',
            project: ''
        };
    },
    onLoad(option) {
        if (option['payroll.id']) {
            this.filterData['payroll.id'] = option['payroll.id'];
        }
        if (option.project) {
            this.filterData['project.id'] = option.project;
            this.project = option.project;
        }
    },
    onShow() {
        this.getList();
    },
    onPullDownRefresh() {
        this.pageData.page = 0;
        this.getList();
    },
    onReachBottom() {
        if (this.status !== 'noMore') {
            this.pageData.page += 1;
            this.getList();
        }
    },
    methods: {
        change() {
            this.pageData.page = 0;
            this.getList();
        },
        getList() {
            this.status = 'more';
            if (this.pageData.page !== 0) {
                this.status = 'loading';
            }
            let operation = 'find-page';
            if (uni.hasAnyRole('worker')) {
                operation = 'find-page-of-mine';
            }
            uni.request({
                url: `/api/oa/payroll-detail/${operation}`,
                data: {
                    page: this.pageData.page,
                    size: this.pageData.size,
                    keyword: this.keyword,
                    ...this.filterData
                },
                success: (res) => {
                    uni.stopPullDownRefresh();
                    this.pageData.total = res.data.totalElements;
                    if (res.data.last) {
                        this.status = 'noMore';
                    }
                    this.listData =
                        this.pageData.page === 0
                            ? res.data.content
                            : this.listData.concat(res.data.content);
                }
            });
        },
        edit(id, type) {
            uni.navigateTo({
                url: `../edit/edit?project=${this.project}&id=${id}&type=${type}`
            });
        }
    }
};
</script>

<style></style>
