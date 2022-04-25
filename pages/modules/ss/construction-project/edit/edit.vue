<template>
    <view>
        <view class="w-form-wrap">
            <u--form v-if="!loading" :model="formModel" :labelWidth="80">
                <u-form-item label="项目编码" prop="code" borderBottom>
                    {{ formModel.code }}
                </u-form-item>
                <u-form-item label="项目名称" prop="code" borderBottom>
                    {{ formModel.name }}
                </u-form-item>
                <u-form-item label="项目简称" prop="code" borderBottom>
                    {{ formModel.shortName }}
                </u-form-item>
            </u--form>
            <view class="corp-tabs">
                <u-tabs :list="tabs" @change="tabChange"></u-tabs>
            </view>
            <view class="corp-card">
                <view class="corp-name">
                    {{ formModel[unit].name ? formModel[unit].name : '' }}
                </view>

                <view
                    v-for="staff in staffs"
                    :key="staff.id"
                    class="staff-content"
                    @click="makePhoneCall(formModel[manager].person.mobile)"
                >
                    <view class="staff-job">
                        {{ staff.job.name }}
                    </view>
                    <view class="staff-main">
                        <view class="staff-name">
                            {{ staff.person.name }}
                        </view>
                        <view class="staff-work">
                            <view v-if="isSafetyCheckDaysVisible(staff)">
                                安全质量检查应检<text class="info">28</text
                                >天，已检<text class="success">{{
                                    staff.safetyCheckDays
                                        ? staff.safetyCheckDays
                                        : 0
                                }}</text
                                >天
                            </view>
                            <!--
							<view>
								质量检查已检<text
									class="success">{{staff.qualityCheckDays ? staff.qualityCheckDays : 0}}</text>天
							</view> 
							-->
                            <view v-if="isSafetyTrainingDaysVisible(staff)">
                                安全教育培训已培训<text class="success">{{
                                    staff.safetyTrainingDays
                                        ? staff.safetyTrainingDays
                                        : 0
                                }}</text
                                >天
                            </view>
                        </view>
                    </view>
                    <u-icon
                        size="20"
                        color="#2979ff"
                        name="phone-fill"
                    ></u-icon>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            loading: true,
            tabs: [
                {
                    unit: 'buildingUnit',
                    name: '施工单位',
                    manager: 'buManager'
                },
                {
                    unit: 'supervisionUnit',
                    name: '监理单位',
                    manager: 'suManager'
                },
                {
                    unit: 'owner',
                    name: '建设单位',
                    manager: 'ownerManager'
                },
                {
                    name: '监管单位',
                    unit: 'regulatoryUnit',
                    manager: 'ruManager'
                }
            ],
            unit: {},
            manager: 'buManager',
            staffs: [],
            formModel: {
                id: ''
            },
            timestamp: 0
        };
    },
    onLoad(option) {
        if (option.id) {
            this.formModel.id = option.id;
        }
    },
    onShow() {
        this.findOne();
    },
    methods: {
        isSafetyCheckDaysVisible(staff) {
            return ['监理', '质检员', '安全员'].some(
                (job) => staff.job.name === job
            );
        },
        isSafetyTrainingDaysVisible(staff) {
            return staff.job.name === '安全员';
        },
        tabChange(tab) {
            if (tab.index) {
                tab = this.tabs[tab.index];
            }
            this.unit = tab.unit;
            this.manager = tab.manager;
            if (this.formModel[this.manager]) {
                const departmentId = this.formModel[this.manager].department.id;
                const roleCode =
                    'ru_manager, owner_manager, su_manager, supervision_engineer, bu_manager, quality_inspector, security_officer, cashier';
                this.findAllStaffs(tab, departmentId, roleCode);
            } else {
                this.staffs = [];
            }
        },
        makePhoneCall(phoneNumber) {
            if (phoneNumber) {
                uni.makePhoneCall({
                    phoneNumber
                });
            }
        },
        sectionChange(index) {
            this.current = index;
            this.getDutyPerformance();
        },
        findOne() {
            uni.request({
                url: `/api/ss/construction-project/find-one`,
                data: {
                    id: this.formModel.id
                },
                success: (res) => {
                    this.loading = false;
                    this.formModel = res.data;
                    this.tabChange(
                        this.tabs.find((tab) => tab.manager === 'buManager')
                    );
                }
            });
        },
        findAllStaffs(tab, departmentId, roleCode) {
            if (tab.staffs && tab.staffs.length > 0) {
                this.staffs = tab.staffs;
            } else {
                uni.request({
                    url: '/api/basedata/staff/find-all-by-department-and-role-codes',
                    data: {
                        'department.id': departmentId,
                        'role.code': roleCode
                    },
                    success: (res) => {
                        this.staffs = res.data.filter(
                            (data) =>
                                !['18508101366', '13908329221'].some(
                                    (mobile) => mobile === data.person.mobile
                                )
                        );
                        tab.staffs = this.staffs;
                        this.getDutyPerformance();
                    }
                });
            }
        },
        getDutyPerformance() {
            const startTime = uni.atStartOfCurrentMonth();
            const endTime = uni.atStartOfNextMonth();
            const checkerIds = this.staffs
                .filter((staff) => this.isSafetyCheckDaysVisible(staff))
                .map((staff) => staff.id)
                .join(',');
            if (checkerIds) {
                uni.request({
                    url: '/api/ss/safety-check/statistic-by-checker',
                    data: {
                        'project.id': this.formModel.id,
                        'checker.id': checkerIds,
                        startTime,
                        endTime
                    },
                    success: (res) => {
                        this.staffs.forEach((staff) => {
                            const data = res.data.find(
                                (item) => staff.id === item.checker
                            );
                            if (data) {
                                staff.safetyCheckDays = data.count;
                            } else {
                                staff.safetyCheckDays = 0;
                            }
                        });
                        this.timestamp = new Date().getTime();
                    }
                });
            }
            // uni.request({
            // 	url: '/api/ss/quality-check/statistic-by-checker',
            // 	data: {
            // 		'project.id': this.formModel.id,
            // 		'checker.id': this.staffs.map(staff => staff.id).join(','),
            // 		startTime,
            // 		endTime
            // 	},
            // 	success: res => {
            // 		this.staffs.forEach(staff => {
            // 			const data = res.data.find(item => staff.id === item.checker);
            // 			if (data) {
            // 				staff.qualityCheckDays = data.count;
            // 			} else {
            // 				staff.qualityCheckDays = 0;
            // 			}
            // 		});
            // 		this.timestamp = new Date().getTime();
            // 	}
            // });
            const trainerIds = this.staffs
                .filter((staff) => this.isSafetyTrainingDaysVisible(staff))
                .map((staff) => staff.id)
                .join(',');
            if (trainerIds) {
                uni.request({
                    url: '/api/ss/safety-training/statistic-by-trainer',
                    data: {
                        'project.id': this.formModel.id,
                        'trainer.id': trainerIds,
                        startTime,
                        endTime
                    },
                    success: (res) => {
                        this.staffs.forEach((staff) => {
                            const data = res.data.find(
                                (item) => staff.id === item.trainer
                            );
                            if (data) {
                                staff.safetyTrainingDays = data.count;
                            } else {
                                staff.safetyTrainingDays = 0;
                            }
                        });
                        this.timestamp = new Date().getTime();
                    }
                });
            }
        },
        statistics() {}
    }
};
</script>

<style lang="scss" scoped>
.corp-tabs {
    margin-bottom: 5px;
}

.corp-card {
    border: 1px solid #ddd;
    border-radius: 4px;

    .corp-name {
        padding: 10px;
        border-bottom: 1px solid #ddd;
    }

    .staff-content {
        display: flex;
        padding: 10px;
        align-items: center;
        border-bottom: 1px solid #ddd;

        .staff-job {
            width: 60px;
            flex: none;
            font-size: 12px;
            color: #666;
            text-align: right;
        }

        .staff-main {
            flex: auto;
            display: flex;
            align-items: center;

            .staff-name {
                font-size: 14px;
                padding: 0 8px;
                flex: none;
            }

            .staff-work {
                flex: auto;
                font-size: 12px;
            }
        }

        .u-icon {
            margin-left: 8px;
        }
    }
}
</style>
