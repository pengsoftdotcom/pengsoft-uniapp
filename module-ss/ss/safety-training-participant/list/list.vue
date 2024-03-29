<template>
    <view>
        <template v-if="type === 'create'">
            <u-subsection
                :list="subsections"
                mode="subsection"
                :current="current"
                @change="change"
            ></u-subsection>

            <u--input
                v-if="current === 1"
                placeholder="请输入姓名、手机号码或身份证号"
                v-model="keyword"
                @change="keywordChange"
                suffixIcon="search"
                clearable
                :customStyle="{
                    margin: '15px 11px 0',
                    background: '#ffffff'
                }"
            ></u--input>
            <view class="w-form-wrap">
                <template v-if="current === 0">
                    <u-checkbox-group
                        v-model="formModel.departments"
                        placement="column"
                        @change="changeDepartments"
                    >
                        <u-checkbox
                            v-for="(department, index) in departments"
                            :customStyle="{ margin: '8px 8px 8px 0' }"
                            :key="department.id"
                            :label="`${department.parent.shortName}${department.shortName}  (${department.number})`"
                            :name="department.id"
                        />
                    </u-checkbox-group>
                </template>
                <template v-if="current === 1">
                    <u-checkbox-group
                        v-model="formModel.staffs"
                        placement="column"
                        @change="changeStaffs"
                    >
                        <u-checkbox
                            v-for="(staff, index) in staffs"
                            :customStyle="{
                                margin: '8px 8px 8px 0',
                                display:
                                    staff.visible === false ? 'none' : 'flex'
                            }"
                            :key="staff.id"
                            :label="`${staff.person.name} - ${staff.person.mobile}`"
                            :name="staff.id"
                        />
                    </u-checkbox-group>
                </template>
                <view class="w-form-btn-content">
                    <u-button
                        type="primary"
                        :text="`选定 (${selected})`"
                        @click="select"
                    >
                    </u-button>
                </view>
            </view>
        </template>
        <template v-else>
            <u--input
                placeholder="请输入姓名、手机号码或身份证号"
                v-model="keyword"
                @change="keywordChange"
                suffixIcon="search"
                clearable
                :customStyle="{ margin: '0 11px', background: '#ffffff' }"
            ></u--input>
            <view class="w-list-wrap">
                <view
                    v-for="(item, index) in listData"
                    :key="item.id"
                    class="w-list-item"
                    @click="edit(item)"
                >
                    <view
                        class="w-list-item-title uni-ellipsis-2"
                        style="display: flex"
                    >
                        {{ item.staff.person.name }}
                    </view>
                    <view
                        class="w-list-item-status"
                        :class="
                            item.status ? itemStatus[item.status.code] : 'info'
                        "
                    >
                        {{ item.status ? item.status.name : '未确认' }}
                    </view>
                    <view class="w-list-item-body">
                        {{ item.reason ? item.reason : '' }}
                    </view>
                </view>
            </view>
            <uni-load-more
                :status="status"
                :icon-size="16"
                :content-text="contentText"
            />
        </template>
    </view>
</template>

<script>
export default {
    data() {
        return {
            subsections: ['工区', '人员'],
            current: 0,
            type: '',
            itemStatus: {
                leave: 'warning',
                participate: 'success'
            },
            formModel: { departments: [], staffs: [] },
            departments: [],
            staffs: [],
            selected: 0,
            ...uni.$u.deepClone(uni.listModel),
            keyword: ''
        };
    },
    onLoad(option) {
        this.filterData['training.id'] = option['training.id'];
        this.type = option['type'];
        if (option['departments']) {
            this.formModel.departments = option['departments'].split(',');
        }
        if (option['staffs']) {
            this.formModel.staffs = option['staffs'].split(',');
        }
    },
    onShow() {
        if (this.type === 'create') {
            this.getDepartments();
            this.getStaffs();
        } else {
            this.getList();
        }
    },
    onPullDownRefresh() {
        if (this.type === 'detail') {
            this.pageData.page = 0;
            this.getList();
        }
    },
    onReachBottom() {
        if (this.type === 'detail' && this.status !== 'noMore') {
            this.pageData.page += 1;
            this.getList();
        }
    },
    methods: {
        change(current) {
            this.current = current;
        },
        getDepartments() {
            uni.request({
                url: '/api/basedata/department/find-all-by-parent',
                data: {
                    'parent.id': uni.getUserDetails().primaryDepartment.id
                },
                success: (res) => (this.departments = res.data)
            });
        },
        changeDepartments(event) {
            this.selected = this.departments
                .filter((department) =>
                    event.some((id) => id === department.id)
                )
                .map((department) => department.number)
                .reduce((prev, curr) => prev + curr, 0);
        },
        getStaffs() {
            this.status = 'more';
            if (this.pageData.page !== 0) {
                this.status = 'loading';
            }
            uni.request({
                url: '/api/basedata/staff/find-all-by-department-and-role-codes',
                data: {
                    'department.id': uni.getUserDetails().primaryDepartment.id,
                    'role.code': 'worker',
                    keyword: this.keyword
                },
                success: (res) => (this.staffs = res.data)
            });
        },
        changeStaffs(event) {
            this.selected = event.length;
        },
        keywordChange() {
            this.pageData.page = 0;
            if (this.type === 'create') {
                this.staffs.forEach(
                    (staff) =>
                        (staff.visible =
                            staff.person.name.indexOf(this.keyword) > -1 ||
                            staff.person.mobile.indexOf(this.keyword) > -1 ||
                            staff.person.identityCardNumber.indexOf(
                                this.keyword
                            ) > -1)
                );
            } else {
                this.getList();
            }
        },
        getList() {
            this.status = 'more';
            if (this.pageData.page !== 0) {
                this.status = 'loading';
            }
            uni.request({
                url: '/api/ss/safety-training-participant/find-page',
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
        edit(item) {
            if (uni.hasAnyRole('worker') || item.status) {
                uni.navigateTo({
                    url: `../edit/edit?id=${item.id}`
                });
            }
        },
        select() {
            const pages = getCurrentPages();
            const prevPage = pages[pages.length - 2];
            prevPage.$vm.selectWorkers({
                selected: this.selected,
                departments: this.formModel.departments,
                staffs: this.formModel.staffs
            });
            uni.navigateBack();
        }
    }
};
</script>

<style></style>
