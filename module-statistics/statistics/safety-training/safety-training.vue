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
                <view class="info">培训场次: {{ total }}</view>
                <view class="warning">应到人数: {{ should_arrive }}</view>
                <view class="success">实到人数: {{ participate }}</view>
                <view class="danger">未到人数: {{ leave }}</view>
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
                <text class="warning">{{ project.should_arrive }}</text>
                /
                <text class="success">{{ project.participate }}</text>
                /
                <text class="danger">{{ project.leave }}</text>
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
            should_arrive: 0,
            participate: 0,
            leave: 0,
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
                        project.should_arrive = 0;
                        project.participate = 0;
                        project.leave = 0;
                    });
                    this.statistic();
                }
            });
        },
        statistic() {
            let startTime = null;
            let endTime = null;
            switch (this.current) {
                case 2:
                    startTime = this.year + '-01-01 00:00:01';
                    endTime = this.year + 1 + '-01-01 00:00:01';
                    break;
                case 1:
                    startTime =
                        this.year +
                        '-' +
                        uni.format(this.month) +
                        '-01 00:00:01';
                    endTime =
                        this.year +
                        '-' +
                        uni.format(this.month + 1) +
                        '-01 00:00:01';
                    break;
                default:
                    startTime =
                        this.year +
                        '-' +
                        uni.format(this.month) +
                        '-' +
                        uni.format(this.day) +
                        ' 00:00:01';
                    endTime =
                        this.year +
                        '-' +
                        uni.format(this.month) +
                        '-' +
                        uni.format(this.day + 1) +
                        ' 00:00:01';
                    break;
            }
            this.total = 0;
            this.should_arrive = 0;
            this.participate = 0;
            this.leave = 0;
            uni.request({
                url: '/api/ss/safety-training/statistic',
                data: {
                    'project.id': this.listData
                        .map((project) => project.id)
                        .join(','),
                    startTime,
                    endTime
                },
                success: (res) => {
                    this.listData.forEach((project) => {
                        project.total = 0;
                        project.should_arrive = 0;
                        project.participate = 0;
                        project.leave = 0;
                        res.data.forEach((data) => {
                            if (data.project === project.id) {
                                project.total = data.count;
                                project.should_arrive = data.should_arrive;
                                project.participate = data.participate;
                                project.leave = data.leave;
                            }
                        });
                        this.total += project.total;
                        this.should_arrive += project.should_arrive;
                        this.participate += project.participate;
                        this.leave += project.leave;
                    });

                    this.ec.option.series[0].data[0].value = this.participate;
                    this.ec.option.series[0].data[1].value = this.leave;
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
            line-height: 28px;
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
        width: 80px;
        text-align: center;
    }
    .manager {
        width: 65px;
        display: flex;
        justify-content: center;
    }
}
</style>
