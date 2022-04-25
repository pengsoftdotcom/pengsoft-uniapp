<template>
    <view class="w-list-wrap">
        <view class="charts">
            <uni-ec-canvas class="chart" :ec="ec"> </uni-ec-canvas>
            <view class="chart" style="line-height: 60upx">
                <view class="info">合同总数: {{ total }}</view>
                <view class="success">已确认数: {{ confirmed }}</view>
                <view class="warning">未确认数: {{ unconfirmed }}</view>
                <view class="danger">未上传数: {{ not_uploaded }}</view>
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
                (<text class="info">{{ project.total }} </text>)
            </view>
            <view class="unconfirmed">
                <text class="success">{{ project.confirmed }} </text>/
                <text class="warning">{{ project.unconfirmed }}</text
                >/
                <text class="danger">{{ project.not_uploaded }} </text>
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
import UniEcCanvas from '@/components/uni-ec-canvas/uni-ec-canvas';
export default {
    components: {
        UniEcCanvas
    },
    data() {
        return {
            total: 0,
            not_uploaded: 0,
            confirmed: 0,
            unconfirmed: 0,
            ec: {
                option: {
                    color: ['#4cd964', '#f0ad4e', '#dd524d'],
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
                                { value: 0, name: '已确认' },
                                { value: 0, name: '未上传' }
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
        getProjects() {
            uni.request({
                url: '/api/ss/construction-project/find-all',
                success: (res) => {
                    this.listData = res.data;
                    this.listData.forEach((project) => {
                        project.total = 0;
                        project.unconfirmed = 0;
                    });
                    this.statistic();
                }
            });
        },
        statistic() {
            uni.request({
                url: '/api/oa/contract/statistic-by-department',
                data: {
                    'department.id': this.listData
                        .map((project) => project.buManager.job.department.id)
                        .join(',')
                },
                success: (res) => {
                    this.total = 0;
                    this.not_uploaded = 0;
                    this.confirmed = 0;
                    this.unconfirmed = 0;
                    this.listData.forEach((project) => {
                        project.total = 0;
                        project.confirmed = 0;
                        project.unconfirmed = 0;
                        res.data.forEach((data) => {
                            if (
                                project.buManager.job.department.id ===
                                data.department
                            ) {
                                project[data.status] = data.count;
                                project.cashier = data.cashier;
                            }
                            this[data.status] += data.count;
                        });
                        project.total =
                            project.not_uploaded +
                            project.unconfirmed +
                            project.confirmed;
                        this.total =
                            this.not_uploaded +
                            this.confirmed +
                            this.unconfirmed;
                    });
                    this.ec.option.series[0].data[0].value = this.unconfirmed;
                    this.ec.option.series[0].data[1].value = this.confirmed;
                    this.ec.option.series[0].data[2].value = this.not_uploaded;
                    console.log(this.ec.option.series[0].data);
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
            padding: 65upx 50upx 0;
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
