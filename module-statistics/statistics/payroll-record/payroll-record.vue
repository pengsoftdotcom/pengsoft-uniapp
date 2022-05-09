<template>
    <view class="w-list-wrap">
        <u-subsection
            :list="modes"
            mode="subsection"
            :current="current"
            @change="change"
        ></u-subsection>
        <view class="charts">
            <uni-ec-canvas class="chart" :ec="ec"> </uni-ec-canvas>
            <view class="chart" style="line-height: 60upx">
                <view>
                    <u-icon name="arrow-left" @click="minus"></u-icon>
                    <view style="flex: 1; text-align: center">
                        <text v-if="current === 0">{{ month }} 月</text>
                        <text v-if="current === 1">{{ year }} 年</text>
                    </view>
                    <u-icon name="arrow-right" @click="plus"></u-icon>
                </view>
                <view class="info">发放总数: {{ paid }}</view>
                <view class="success">已确认数: {{ confirmed }}</view>
                <view class="danger">未确认数: {{ unconfirmed }}</view>
            </view>
        </view>
        <view class="project-head">
            <view class="name">项目</view>
            <view class="unconfirmed">数量</view>
            <view class="cashier">发薪员</view>
            <view class="manager">项目经理</view>
        </view>
        <view v-for="project in listData" :key="project.id" class="project">
            <view class="name">
                {{ project.shortName }}
                (<text class="info">{{ project.paid }} </text>)
            </view>
            <view class="unconfirmed">
                <text class="success">{{ project.confirmed }}</text>
                /
                <text class="danger">{{ project.unconfirmed }}</text>
            </view>
            <view
                class="cashier"
                @click="makePhoneCall(project.cashier.mobile)"
            >
                <text>{{ project.cashier.name }}</text>
                <u-icon
                    size="20"
                    color="#2979ff"
                    name="phone-fill"
                    top="2"
                ></u-icon>
            </view>
            <view
                class="manager"
                @click="makePhoneCall(project.buManager.person.mobile)"
            >
                <text>{{ project.buManager.person.name }}</text>
                <u-icon
                    size="20"
                    color="#2979ff"
                    name="phone-fill"
                    top="2"
                ></u-icon>
            </view>
        </view>
    </view>
</template>

<script>
import UniEcCanvas from '../../components/uni-ec-canvas/uni-ec-canvas';
export default {
    components: {
        UniEcCanvas
    },
    data() {
        return {
            modes: ['月', '年'],
            current: 0,
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            paid: 0,
            confirmed: 0,
            unconfirmed: 0,
            ec: {
                option: {
                    color: ['#dd524d', '#4cd964'],
                    series: [
                        {
                            type: 'pie',
                            radius: ['40%', '70%'],
                            label: {
                                formatter: '{c}',
                                position: 'inside'
                            },
                            data: [
                                { value: 0, name: '未确认' },
                                { value: 0, name: '已确认' }
                            ]
                        }
                    ]
                }
            },
            ...JSON.parse(JSON.stringify(uni.listModel))
        };
    },
    onLoad() {
        this.getProjects();
    },
    methods: {
        makePhoneCall(mobile) {
            uni.makePhoneCall({
                phoneNumber: mobile
            });
        },
        change(current) {
            this.current = current;
            this.getPayrollRecords();
        },
        minus() {
            if (this.current === 0 && this.month > 1) {
                this.month--;
                this.getPayrollRecords();
            }
            if (this.current === 1) {
                this.year--;
                this.getPayrollRecords();
            }
        },
        plus() {
            if (this.current === 0 && this.month < new Date().getMonth() + 1) {
                this.month++;
                this.getPayrollRecords();
            }
            if (this.current === 1 && this.year < new Date().getFullYear()) {
                this.year++;
                this.getPayrollRecords();
            }
        },
        getProjects() {
            uni.request({
                url: '/api/ss/construction-project/find-all',
                success: (res) => {
                    this.listData = res.data;
                    this.listData.forEach((project) => {
                        project.paid = 0;
                        project.confirmed = 0;
                        project.unconfirmed = 0;
                    });
                    this.getPayrollRecords();
                }
            });
        },
        getPayrollRecords() {
            const data = {
                'project.id': this.listData
                    .map((project) => project.id)
                    .join(',')
            };
            if (this.current === 0) {
                data.month = this.month;
                data.year = new Date().getFullYear();
            } else {
                data.year = this.year;
            }
            uni.request({
                url: '/api/oa/payroll-record/find-all-with-cashier',
                data,
                success: (res) => {
                    this.paid = 0;
                    this.confirmed = 0;
                    this.unconfirmed = 0;
                    this.listData.forEach((project) => {
                        project.paid = 0;
                        project.unconfirmed = 0;
                        res.data.forEach((record) => {
                            this.paid += record.paidCount;
                            this.confirmed += record.confirmedCount;
                            if (project.buildingUnit.id === record.belongsTo) {
                                project.paid += record.paidCount;
                                project.confirmed = record.confirmedCount;
                                project.unconfirmed +=
                                    record.paidCount - record.confirmedCount;
                                project.cashier = record.cashier;
                            }
                        });
                    });
                    this.unconfirmed = this.paid - this.confirmed;

                    this.ec.option.series[0].data[0].value = this.unconfirmed;
                    this.ec.option.series[0].data[1].value = this.confirmed;
                }
            });
        }
    }
};
</script>

<style lang="scss" scoped>
.charts {
    width: 100%;
    display: flex;
    .chart {
        width: 50%;
        height: 375upx;
        display: block;

        > view {
            padding: 0 0 0 50upx;
        }

        > view:first-of-type {
            display: flex;
            align-items: center;
            padding: 45upx 50upx 0;
        }
    }
}
.project-head {
    display: flex;
    padding: 10px 15px;
    font-size: 14px;
    border-bottom: 0.5px solid #ddd;
    .name {
        flex: 1;
    }
    .unconfirmed {
        width: 60px;
        text-align: center;
    }
    .cashier {
        width: 65px;
        text-align: center;
    }
    .manager {
        width: 65px;
        text-align: center;
    }
}
.project {
    display: flex;
    padding: 10px 15px;
    font-size: 14px;
    border-bottom: 0.5px solid #ddd;
    color: #666;
    &:last-of-type {
        border-bottom: none !important;
    }
    .name {
        flex: 1;
    }
    .unconfirmed {
        width: 60px;
        text-align: center;
    }
    .cashier {
        width: 65px;
        display: flex;
        justify-content: center;
    }
    .manager {
        width: 65px;
        display: flex;
        justify-content: center;
    }
}
</style>
