<template>
	<view>
		<view class="tabs">
			<view v-for="(tab,index) in tabs" :key="index" class="tab" :class="{active: tab.active}"
				@click="active(tab)">{{tab.name}}</view>
		</view>
		<view class="w-list-wrap" style="margin-top: 54px;">
			<view v-for="(item, index) in listData" :key="index" class="w-list-item cp-item">
				<view class="cp-title">
					<view class="cp-name" style="margin-right: 0;">
						<view class="ellipsis-2">
							{{ item.name }}
						</view>
					</view>
					<view class="cp-count" @click="toSafetyCheckList('', '')">
						<view class="cp-count-title">
							已检查
						</view>
						<view class="cp-count-num">
							{{item.check.count}}
							<view class="cp-count-unit">
								天
							</view>
						</view>

					</view>
				</view>
				<view class="cp-body">
					<view class="cp-check">
						<view class="cp-check-type">
							质量检查
						</view>
						<view class="cp-check-content">
							<view class="cp-check-num" @click="toSafetyCheckList('quality', 'safe')">
								安全
								<view class="safe">
									{{item.check.quality.safe}}
								</view>
							</view>
							<view class="cp-check-num" @click="toSafetyCheckList('quality', 'risk')">
								隐患
								<view class="risk">
									{{item.check.quality.risk}}
								</view>
							</view>
						</view>
					</view>

					<view class="cp-check">
						<view class="cp-check-type">
							安全检查
						</view>
						<view class="cp-check-content">
							<view class="cp-check-num" @click="toSafetyCheckList('safety', 'safe')">
								 安全
								 <view class="safe">
									{{item.check.safety.safe}}
								 </view>
							</view>
							<view class="cp-check-num" @click="toSafetyCheckList('safety', 'risk')">
								隐患
								<view class="risk">
									{{item.check.safety.risk}}
								</view>
							</view>
						</view>
					</view>

				</view>
			</view>
		</view>
		<uni-load-more :status="status" :icon-size="16" :content-text="contentText" />
	</view>
</template>

<script>
	export default {
		data() {
			const year = new Date();

			const startMonth = new Date();
			const endMonth = new Date();
			endMonth.setMonth(endMonth.getMonth() + 1);

			const startDay = new Date();
			const endDay = new Date();
			endDay.setDate(endDay.getDate() + 1);
			return {
				tabs: [{
					name: '年',
					startTime: year.getFullYear() + '-01-01 00:00:01',
					endTime: year.getFullYear() + '-12-31 00:00:01',
					active: true
				}, {
					name: '月',
					startTime: startMonth.getFullYear() + '-' + this.format(startMonth.getMonth() + 1) +
						'-01 00:00:01',
					endTime: endMonth.getFullYear() + '-' + this.format(endMonth.getMonth() + 1) + '-01 00:00:01',
					active: false
				}, {
					name: '日',
					startTime: startDay.getFullYear() + '-' + this.format(startDay.getMonth() + 1) + '-' + this
						.format(startDay.getDate() + 1) + ' 00:00:01',
					endTime: endDay.getFullYear() + '-' + this.format(endDay.getMonth() + 1) + '-' + this.format(
						endDay.getDate() + 1) + ' 00:00:01',
					active: false
				}],
				...JSON.parse(JSON.stringify(uni.listModel))
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
			active(tab) {
				this.tabs.forEach(t => t.active = false);
				tab.active = true;
				if (tab.status) {
					this.filterData['status.code'] = tab.status;
				} else {
					delete this.filterData['status.code'];
				}
				this.getList();
			},
			getList() {
				this.status = 'more';
				if (this.pageData.page !== 0) {
					this.status = 'loading';
				}
				uni.request({
					url: '/api/ss/construction-project/find-page',
					data: {
						page: this.pageData.page,
						size: this.pageData.size,
						...this.filterData
					},
					success: (res) => {
						uni.stopPullDownRefresh();
						this.pageData.total = res.data.totalElements;
						if (res.data.last) {
							this.status = 'noMore';
						}
						const content = res.data.content.map(project => Object.assign(project, {
							check: {
								count: 0,
								safety: {
									safe: 0,
									risk: 0
								},
								quality: {
									safe: 0,
									risk: 0
								}
							}
						}));
						const projectIds = content.map(project => project.id);
						this.listData = this.pageData.page === 0 ? content : this.listData.concat(content);
						const tab = this.tabs.find(tab => tab.active);
						this.getCheckDays(projectIds, tab.startTime, tab.endTime);
						this.statistic(projectIds, tab.startTime, tab.endTime);
					}
				});
			},
			getCheckDays(projectIds, startTime, endTime) {
				let url = '/api/ss/safety-check/get-days?';
				projectIds.forEach(id => url += 'project.id=' + id + '&');
				uni.request({
					url,
					data: {
						startTime,
						endTime
					},
					success: (res) => {
						this.listData.forEach(project => res.data.forEach(data => {
							if (project.id === data.project) {
								project.check.count = data.count;
							}
						}));
					}
				});
			},
			statistic(projectIds, startTime, endTime) {
				let url = '/api/ss/safety-check/statistic?';
				projectIds.forEach(id => url += 'project.id=' + id + '&');
				uni.request({
					url,
					data: {
						startTime,
						endTime
					},
					success: (res) => {
						this.listData.forEach(project => res.data.forEach(data => {
							if (project.id === data.project) {
								if (data.type === 'safety' && data.status === 'safe') {
									project.check.safety.safe = data.count;
								}
								if (data.type === 'safety' && data.status === 'risk') {
									project.check.safety.risk = data.count;
								}
								if (data.type === 'quality' && data.status === 'safe') {
									project.check.quality.safe = data.count;
								}
								if (data.type === 'quality' && data.status === 'risk') {
									project.check.quality.risk = data.count;
								}
							}
						}));
					}
				});
			},
			toSafetyCheckList(type, status) {
				const tab = this.tabs.find(tab => tab.active);
				uni.navigateTo({
					url: `/pages/modules/ss/safety-check/list/list?type=${type}&status=${status}&startTime=${tab.startTime}&endTime=${tab.endTime}`
				})
			},
			format(number) {
				if (number < 10) {
					return '0' + number;
				} else {
					return number;
				}
			}
		}
	}
</script>

<style>
	.tabs {
		position: fixed;
		width: 100%;
		display: flex;
		top: 0;
		z-index: 99;
		background-color: #FFFFFF;
	}

	.tabs>.tab {
		flex-grow: 1;
		text-align: center;
		color: #3C9CFF;
		border: 1px solid #3C9CFF;
		border-right: 0;
		height: 40px;
		line-height: 40px;
	}

	.tabs>.tab :first {
		border-left: 0;
	}

	.tabs>.active {
		background-color: #3C9CFF;
		color: #FFFFFF !important;
	}

	.statistics {
		font-size: 14px;
		line-height: 30px;
	}

	.statistics>view {
		display: flex;
		justify-content: center;
	}

	.statistics>view>view {
		display: flex;
		flex-grow: 1;
		justify-content: center;
	}

	.statistics>view>view>view {
		flex-grow: 1;
		justify-content: center;
	}

	.safe {
		color: #4cd964
	}

	.risk {
		color: #dd524d;
	}
</style>
