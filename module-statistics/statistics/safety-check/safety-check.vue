<template>
    <view class="w-list-wrap">
        <view style="border-bottom: 1px solid #ddd">
            <uni-calendar
                ref="calendar"
                :selected="selected"
                @change="change"
                @monthSwitch="monthSwitch"
            />
        </view>
        <view class="project-head">
            <view class="name">项目</view>
            <view class="checked">状态</view>
            <view class="handled">未整改</view>
            <view class="manager">项目经理</view>
        </view>
        <view v-for="project in listData" :key="project.id" class="project">
            <view class="name">
                {{ project.shortName }}
            </view>
            <view class="checked">
                <text v-if="project.unchecked" class="danger">未检</text>
                <text v-else class="success">已检</text>
            </view>
            <view class="handled">
                <text class="danger">{{ project.unhandled }}</text>
            </view>
            <view class="manager">
                {{ project.buManager.person.name }}
            </view>
            <view class="phone">
                <u-icon
                    size="20"
                    color="#2979ff"
                    name="phone-fill"
                    @click="makePhoneCall(project.buManager.person.mobile)"
                ></u-icon>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            selectedDate: uni.atStartOfToday().substring(0, 10),
            startTime: uni.atStartOfCurrentMonth(),
            endTime: uni.atEndOfToday(),
            selected: [],
            d: new Date().getTime(),
            ...JSON.parse(JSON.stringify(uni.listModel))
        };
    },
    onShow() {
        this.getProjectList();
    },
    methods: {
        makePhoneCall(mobile) {
            uni.makePhoneCall({
                phoneNumber: mobile
            });
        },
        change(day) {
            this.selectedDate = day.fulldate;
            this.statisticByDay(
                this.selectedDate + ' 00:00:01',
                this.selectedDate + ' 23:59:59'
            );
        },
        monthSwitch(date) {
            const startTime = new Date();
            startTime.setFullYear(date.year);
            if (startTime.getMonth() + 1 < date.month) {
                startTime.setMonth(date.month);
                startTime.setDate(0);
            }
            this.startTime =
                startTime.getFullYear() +
                '-' +
                uni.format(date.month) +
                '-01 00:00:01';
            this.endTime =
                startTime.getFullYear() +
                '-' +
                uni.format(startTime.getMonth() + 1) +
                '-' +
                uni.format(startTime.getDate()) +
                ' 23:59:59';
            this.getWarningDates();
        },
        getProjectList() {
            uni.request({
                url: '/api/ss/construction-project/find-all',
                success: (res) => {
                    this.listData = res.data;
                    this.listData.forEach((project) => {
                        project.unchecked = true;
                        project.unhandled = 0;
                    });
                    this.getWarningDates();
                    this.statisticByDay(
                        this.selectedDate + ' 00:00:01',
                        this.selectedDate + ' 23:59:59'
                    );
                }
            });
        },
        getWarningDates() {
            uni.request({
                url: '/api/ss/safety-check/find-all-unchecked-or-unhandled-dates',
                data: {
                    'project.id': this.listData
                        .map((project) => project.id)
                        .join(','),
                    startTime: this.startTime,
                    endTime: this.endTime
                },
                success: (res) => {
                    this.selected = res.data;
                }
            });
        },
        statisticByDay(startTime, endTime) {
            uni.request({
                url: '/api/ss/safety-check/statistic-by-day',
                data: {
                    'project.id': this.listData
                        .map((project) => project.id)
                        .join(','),
                    startTime,
                    endTime
                },
                success: (res) => {
                    this.listData.forEach((project) => {
                        let modified = false;
                        res.data.forEach((data) => {
                            if (project.id === data.project) {
                                project.unchecked = false;
                                project.unhandled = data.unhandled;
                                modified = true;
                            }
                        });
                        if (!modified) {
                            project.unchecked = true;
                            project.unhandled = 0;
                        }
                    });
                    this.d = new Date().getTime();
                }
            });
        }
    }
};
</script>

<style lang="scss" scoped>
.project-head {
    display: flex;
    padding: 10px 15px;
    font-size: 14px;
    border-bottom: 0.5px solid #ddd;
    .name {
        flex: 1;
    }
    .checked {
        width: 75px;
        text-align: center;
    }
    .handled {
        width: 80px;
        text-align: center;
    }
    .manager {
        width: 70px;
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
    .checked {
        width: 75px;
        text-align: center;
    }
    .handled {
        width: 80px;
        text-align: center;
    }
    .manager {
        width: 50px;
        text-align: center;
    }
    .phone {
        position: relative;
        top: 3px;
    }
}
</style>
