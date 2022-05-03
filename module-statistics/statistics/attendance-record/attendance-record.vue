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
                        <text v-if="current === 0">{{ day }} 日</text>
                        <text v-if="current === 1">{{ month }} 月</text>
                        <text v-if="current === 2">{{ year }} 年</text>
                    </view>
                    <u-icon name="arrow-right" @click="plus"></u-icon>
                </view>
                <view class="info">应到人数: {{ total }}</view>
                <view class="success">进场人数: {{ entered }}</view>
                <view class="danger">报警人数: {{ illegal }}</view>
            </view>
        </view>
        <view class="project-head">
            <view class="name">项目</view>
            <view class="number">人数</view>
            <view class="manager">项目经理</view>
        </view>
        <view v-for="project in listData" :key="project.id" class="project">
            <view class="name">
                {{ project.shortName }}
                (<text class="info">{{ project.total }} </text>)
            </view>
            <view class="number">
                <text class="success">{{ project.entered }}</text>
                /
                <text class="danger">{{ project.illegal }}</text>
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
            modes: ['日', '月', '年'],
            current: 0,
            day: new Date().getDate(),
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            total: 0,
            entered: 0,
            illegal: 0,
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
                                { value: 0, name: '进场人数' },
                                { value: 0, name: '报警人数' }
                            ]
                        }
                    ]
                }
            },
            ...JSON.parse(JSON.stringify(uni.listModel))
        };
    },
    onShow() {
        this.getProjects();
    },
    methods: {
        change(current) {
            this.current = current;
            this.statistic();
        },
        minus() {
            if (this.current === 0 && this.day > 1) {
                this.day--;
                this.statistic();
            }
            if (this.current === 1 && this.month > 1) {
                this.month--;
                this.statistic();
            }
            if (this.current === 2) {
                this.year--;
                this.statistic();
            }
        },
        plus() {
            if (this.current === 0 && this.day < new Date().getDate()) {
                this.day++;
                this.statistic();
            }
            if (this.current === 1 && this.month < new Date().getMonth() + 1) {
                this.month++;
                this.statistic();
            }
            if (this.current === 2 && this.year < new Date().getFullYear()) {
                this.year++;
                this.statistic();
            }
        },
        getProjects() {
            uni.request({
                url: '/api/ss/construction-project/find-all',
                success: (res) => {
                    this.listData = res.data;
                    this.listData.forEach((project) => {
                        project.total = 0;
                        project.entered = 0;
                        project.illegal = 0;
                    });
                    this.statistic();
                }
            });
        },
        statistic() {
            const params = {
                'organization.id': this.listData
                    .map((project) => project.buManager.organization.id)
                    .join(','),
                'department.id': this.listData
                    .map((project) => project.buManager.department.id)
                    .join(',')
            };
            const currentMonth = new Date().getMonth() + 1;
            const currentYear = new Date().getFullYear();
            switch (this.current) {
                case 0:
                    params.day = this.day;
                    params.month = currentMonth;
                    params.year = currentYear;
                    break;
                case 1:
                    params.month = this.month;
                    params.year = currentYear;
                    break;
                case 2:
                    params.year = this.year;
                    break;
                default:
                    break;
            }
            uni.request({
                url: '/api/oa/attendance-record/statistic',
                data: params,
                success: (res) => {
                    this.total = 0;
                    this.entered = 0;
                    this.illegal = 0;
                    this.listData.forEach((project) => {
                        project.total = 0;
                        project.entered = 0;
                        project.illegal = 0;
                        res.data.forEach((data) => {
                            if (
                                data.organization ===
                                    project.buManager.organization.id &&
                                data.department ===
                                    project.buManager.department.id
                            ) {
                                project.total = data.total;
                                project.entered = data.entered;
                                project.illegal = data.illegal;
                            }
                        });
                        this.total += project.total;
                        this.entered += project.entered;
                        this.illegal += project.illegal;
                    });
                    this.ec.option.series[0].data[0].value = this.entered;
                    this.ec.option.series[0].data[1].value = this.illegal;
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
    .number {
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
    .number {
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
