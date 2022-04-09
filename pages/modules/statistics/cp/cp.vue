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
				</view>
				<view class="cp-managers-content">
					<view class="cp-manager">
						<view class="cp-manager-label">监管单位</view>
						<view class="cp-manager-name">
							<text>{{item.ruManager.person.name}}</text>
							<u-icon size="20" color="#2979ff" name="phone-fill"
								@click="makePhoneCall(item.ruManager.person.mobile)"></u-icon>
						</view>
					</view>
					<view class="cp-manager">
						<view class="cp-manager-label">建设单位</view>
						<view class="cp-manager-name">
							<text>{{item.ownerManager.person.name}}</text>
							<u-icon size="20" color="#2979ff" name="phone-fill"
								@click="makePhoneCall(item.ownerManager.person.mobile)"></u-icon>
						</view>
					</view>
					<view class="cp-manager">
						<view class="cp-manager-label">监理单位</view>
						<view class="cp-manager-name">
							<text>{{item.suManager.person.name}}</text>
							<u-icon size="20" color="#2979ff" name="phone-fill"
								@click="makePhoneCall(item.suManager.person.mobile)"></u-icon>
						</view>
					</view>
					<view class="cp-manager">
						<view class="cp-manager-label">施工单位</view>
						<view class="cp-manager-name">
							<text>{{item.buManager.person.name}}</text>
							<u-icon size="20" color="#2979ff" name="phone-fill"
								@click="makePhoneCall(item.buManager.person.mobile)"></u-icon>
						</view>
					</view>
				</view>
				<view class="cp-body">

					<view class="cp-body-label" @click="toSafetyCheckList('', '')">
						<view class="item-title">
							安全已检查
						</view>
						<view class="item-content info">
							{{item.check.count}}
							<view class="item-unit">
								天
							</view>
						</view>
					</view>

					<view class="cp-body-item">
						<view class="item-title">
							安全
						</view>
						<view class="item-container">
							<view class="item-content" @click="toSafetyCheckList('safe')">
								<view class="success">
									{{item.check.safe}}
								</view>
							</view>
						</view>
					</view>

					<view class="cp-body-item">
						<view class="item-title">
							隐患
						</view>
						<view class="item-container">
							<view class="item-content" @click="toSafetyCheckList('risk', true)">
								<view class="success">
									{{item.check.risk.handled}}
								</view>
								<view class="item-unit">
									已处理
								</view>
							</view>
							<view class="item-content" @click="toSafetyCheckList('risk', false)">
								<view class="danger">
									{{item.check.risk.unhandled}}
								</view>
								<view class="item-unit">
									未处理
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
					name: '日',
					startTime: startDay.getFullYear() + '-' + this.format(startDay.getMonth() + 1) + '-' + this
						.format(startDay.getDate()) + ' 00:00:01',
					endTime: endDay.getFullYear() + '-' + this.format(endDay.getMonth() + 1) + '-' + this.format(
						endDay.getDate()) + ' 00:00:01',
					active: false
				}, {
					name: '月',
					startTime: startMonth.getFullYear() + '-' + this.format(startMonth.getMonth() + 1) +
						'-01 00:00:01',
					endTime: endMonth.getFullYear() + '-' + this.format(endMonth.getMonth() + 1) + '-01 00:00:01',
					active: false
				}, {
					name: '年',
					startTime: year.getFullYear() + '-01-01 00:00:01',
					endTime: (year.getFullYear() + 1) + '-01-01 00:00:01',
					active: true
				}],
				...JSON.parse(JSON.stringify(uni.listModel))
			}
		},
		onShow() {
			this.active(this.tabs[0]);
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
			change(unit) {
				const project = this.listData.find(project => project.id === unit.project);
				project.manager = project[unit.manager];
			},
			makePhoneCall(phoneNumber) {
				if (phoneNumber) {
					uni.makePhoneCall({
						phoneNumber,
						success() {
							alert(1);
						}
					});
				}
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
								safe: 0,
								risk: {
									handled: 0,
									unhandled: 0
								}
							}
						}));
						const projectIds = content.map(project => project.id);
						this.listData = this.pageData.page === 0 ? content : this.listData.concat(content);
						const tab = this.tabs.find(t => t.active);
						if (projectIds && projectIds.length > 0) {
							this.getCheckDays(projectIds, tab.startTime, tab.endTime);
							this.statistic(projectIds, tab.startTime, tab.endTime);
						}
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
								if (data.status === 'safe') {
									project.check.safe = data.count;
								}
								if (data.status === 'risk') {
									if (data.handled) {
										project.check.risk.handled = data.count;
									} else {
										project.check.risk.unhandled = data.count;
									}
								}
							}
						}));
					}
				});
			},
			toSafetyCheckList(status, handled) {
				const tab = this.tabs.find(t => t.active);
				uni.navigateTo({
					url: `/pages/modules/ss/safety-check/list/list?status=${status}&handled=${handled}&startTime=${tab.startTime}&endTime=${tab.endTime}`
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
