<template>
	<view>
		<view class="tabs">
			<view v-for="(tab, index) in tabs" :key="index" class="tab" :class="{ active: tab.active }"
				@click="active(tab)">{{ tab.name }}</view>
		</view>
		<view class="w-list-wrap" style="margin-top: 54px">
			<view v-for="(item, index) in listData" :key="index" class="w-list-item cp-item">
				<view class="cp-title">
					<view class="cp-name" style="margin-right: 0">
						<view class="ellipsis-2">
							{{ item.name }}
						</view>
					</view>
				</view>
				<view class="cp-managers-content">
					<view class="cp-manager">
						<view class="cp-manager-label">监管单位</view>
						<view class="cp-manager-name">
							<text>{{ item.ruManager.person.name }}</text>
							<u-icon size="20" color="#2979ff" name="phone-fill"
								@click="makePhoneCall(item.ruManager ? item.ruManager.person.mobile : '')"></u-icon>
						</view>
					</view>
					<view class="cp-manager">
						<view class="cp-manager-label">建设单位</view>
						<view class="cp-manager-name">
							<text>{{ item.ownerManager.person.name }}</text>
							<u-icon size="20" color="#2979ff" name="phone-fill"
								@click="makePhoneCall(item.ownerManager ? item.ownerManager.person.mobile : '')"></u-icon>
						</view>
					</view>
					<view class="cp-manager">
						<view class="cp-manager-label">监理单位</view>
						<view class="cp-manager-name">
							<text>{{ item.suManager.person.name }}</text>
							<u-icon size="20" color="#2979ff" name="phone-fill"
								@click="makePhoneCall(item.suManager ? item.suManager.person.mobile : '')"></u-icon>
						</view>
					</view>
					<view class="cp-manager">
						<view class="cp-manager-label">施工单位</view>
						<view class="cp-manager-name">
							<text>{{ item.buManager.person.name }}</text>
							<u-icon size="20" color="#2979ff" name="phone-fill"
								@click="makePhoneCall(item.buManager ? item.buManager.person.mobile : '')"></u-icon>
						</view>
					</view>
				</view>
				<view class="cp-body">
					<view class="cp-body-label" @click="toSafetyCheckList(item.id, '', '')">
						<view class="item-title"> 安全质量检查 </view>
						<view class="item-content info">
							{{ item.safetyCheck.days }}
							<view class="item-unit"> 天 </view>
						</view>
					</view>
					<view class="cp-body-item" @click="toSafetyCheckList(item.id, 'safe', '')">
						<view class="item-title"> 安全 </view>
						<view class="item-container">
							<view class="item-content">
								<view class="success">
									{{ item.safetyCheck.safe }}
								</view>
							</view>
						</view>
					</view>
					<view class="cp-body-item" style="width: 50%;">
						<view class="item-title"> 隐患 </view>
						<view class="item-container">
							<view class="item-content" @click="toSafetyCheckList(item.id, 'risk', true)">
								<view class="success">
									{{ item.safetyCheck.risk.handled }}
								</view>
								<view class="item-unit"> 已整改 </view>
							</view>
							<view class="item-content" @click="toSafetyCheckList(item.id, 'risk', false)">
								<view class="danger">
									{{ item.safetyCheck.risk.unhandled }}
								</view>
								<view class="item-unit"> 未整改 </view>
							</view>
						</view>
					</view>
				</view>
				<!-- <view class="cp-body">
					<view class="cp-body-label" @click="toQualityCheckList(item.id, '', '')">
						<view class="item-title"> 质量检查 </view>
						<view class="item-content info">
							{{ item.qualityCheck.days }}
							<view class="item-unit"> 天 </view>
						</view>
					</view>
					<view class="cp-body-item" @click="toQualityCheckList(item.id, 'safe', '')">
						<view class="item-title"> 安全 </view>
						<view class="item-container">
							<view class="item-content">
								<view class="success">
									{{ item.qualityCheck.safe }}
								</view>
							</view>
						</view>
					</view>
					<view class="cp-body-item" style="width: 50%;">
						<view class="item-title"> 隐患 </view>
						<view class="item-container">
							<view class="item-content" @click="toQualityCheckList(item.id, 'risk', true)">
								<view class="success">
									{{ item.qualityCheck.risk.handled }}
								</view>
								<view class="item-unit"> 已整改 </view>
							</view>
							<view class="item-content" @click="toQualityCheckList(item.id, 'risk', false)">
								<view class="danger">
									{{ item.qualityCheck.risk.unhandled }}
								</view>
								<view class="item-unit"> 未整改 </view>
							</view>
						</view>
					</view>
				</view> -->
				<view v-if="hasAuthority" class="cp-body">
					<view class="cp-body-label" @click="toSafetyTrainingList(item.id)">
						<view class="item-title"> 安全教育培训 </view>
						<view class="item-content info">
							{{ item.safetyTraining.days }}
							<view class="item-unit"> 天 </view>
						</view>
					</view>
					<view class="cp-body-item" @click="toSafetyTrainingList(item.id)">
						<view class="item-title"> 总场次 </view>
						<view class="item-container">
							<view class="item-content">
								<view class="success">
									{{ item.safetyTraining.total }}
								</view>
							</view>
						</view>
					</view>
					<view class="cp-body-item" @click="toSafetyTrainingList(item.id)">
						<view class="item-title"> 已参加 </view>
						<view class="item-container">
							<view class="item-content">
								<view class="success">
									{{ item.safetyTraining.participate }}
								</view>
								<view class="item-unit"> 人次 </view>
							</view>
						</view>
					</view>
					<view class="cp-body-item" @click="toSafetyTrainingList(item.id)">
						<view class="item-title"> 未参加 </view>
						<view class="item-container">
							<view class="item-content">
								<view class="warning">
									{{ item.safetyTraining.leave }}
								</view>
								<view class="item-unit"> 人次 </view>
							</view>
						</view>
					</view>
				</view>
				<view v-if="hasAuthority" class="cp-body">
					<view class="cp-body-label" @click="toContractList(item.id, '')">
						<view class="item-title"> 合同汇总 </view>
						<view class="item-content info">
							{{ item.contract.total }}
							<view class="item-unit"> 份 </view>
						</view>
					</view>
					<view class="cp-body-item" @click="toContractList(item.id, 'not_uploaded')">
						<view class="item-title"> 未上传 </view>
						<view class="item-container">
							<view class="item-content">
								<view class="danger">
									{{ item.contract.not_uploaded }}
								</view>
								<view class="item-unit"> 份 </view>
							</view>
						</view>
					</view>
					<view class="cp-body-item" @click="toContractList(item.id, 'confirmed')">
						<view class="item-title"> 已确认 </view>
						<view class="item-container">
							<view class="item-content">
								<view class="success">
									{{ item.contract.confirmed }}
								</view>
								<view class="item-unit"> 份 </view>
							</view>
						</view>
					</view>
					<view class="cp-body-item" @click="toContractList(item.id, 'unconfirmed')">
						<view class="item-title"> 未确认 </view>
						<view class="item-container">
							<view class="item-content">
								<view class="warning">
									{{ item.contract.unconfirmed }}
								</view>
								<view class="item-unit"> 份 </view>
							</view>
						</view>
					</view>
				</view>
				<view v-if="hasAuthority && visible" class="cp-body">
					<view class="cp-body-label" @click="toPayrollRecordList(item.id, '')">
						<view class="item-title"> 薪资发放 </view>
						<view class="item-content">
							{{ item.salary.total }}
							<view class="item-unit"> 月 </view>
						</view>
					</view>
					<view class="cp-body-item">
						<view class="item-title"> 已发放 </view>
						<view class="item-container">
							<view class="item-content" @click="toPayrollRecordList(item.id, 'paid')">
								<view class="success">
									{{ item.salary.paid }}
								</view>
								<view class="item-unit"> 月 </view>
							</view>
						</view>
					</view>
					<view class="cp-body-item">
						<view class="item-title"> 未发放 </view>
						<view class="item-container">
							<view class="item-content" @click="toPayrollRecordList(item.id, 'unpaid')">
								<view class="warning">
									{{ item.salary.unpaid }}
								</view>
								<view class="item-unit"> 月 </view>
							</view>
						</view>
					</view>
					<view class="cp-body-item">
						<view class="item-title"> 已欠发 </view>
						<view class="item-container">
							<view class="item-content" @click="toPayrollRecordList(item.id, 'arrears')">
								<view class="danger">
									{{ item.salary.arrears }}
								</view>
								<view class="item-unit"> 月 </view>
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
			return {
				tabs: [{
						name: "日",
						startTime: uni.atStartOfCurrentDay(),
						endTime: uni.atStartOfNextDay(),
						active: false,
					},
					{
						name: "月",
						startTime: uni.atStartOfCurrentMonth(),
						endTime: uni.atStartOfNextMonth(),
						active: false,
					},
					{
						name: "年",
						startTime: uni.atStartOfCurrentYear(),
						endTime: uni.atStartOfNextYear(),
						active: true,
					},
				],
				hasAuthority: !uni.hasAnyRole('su_manager'),
				visible: false,
				...JSON.parse(JSON.stringify(uni.listModel)),
			};
		},
		onShow() {
			const tab = uni.getStorageSync("cp_active") || this.tabs[0];
			this.active(tab);
		},
		onPullDownRefresh() {
			this.pageData.page = 0;
			this.getList();
		},
		onReachBottom() {
			if (this.status !== "noMore") {
				this.pageData.page += 1;
				this.getList();
			}
		},
		methods: {
			active(tab) {
				this.tabs.forEach((t) => {
					if (t.name === tab.name) {
						t.active = true;
					} else {
						t.active = false;
					}
				});
				if (tab.status) {
					this.filterData["status.code"] = tab.status;
				} else {
					delete this.filterData["status.code"];
				}
				if (tab.name === "月" || tab.name === "年") {
					this.$set(this.$data, "visible", true);
				} else {
					this.$set(this.$data, "visible", false);
				}
				uni.setStorageSync("cp_active", tab);
				this.getList();
			},
			change(unit) {
				const project = this.listData.find(
					(project) => project.id === unit.project
				);
				project.manager = project[unit.manager];
			},
			makePhoneCall(phoneNumber) {
				if (phoneNumber) {
					uni.makePhoneCall({
						phoneNumber,
					});
				}
			},
			getList() {
				this.status = "more";
				if (this.pageData.page !== 0) {
					this.status = "loading";
				}
				uni.request({
					url: "/api/ss/construction-project/find-page",
					data: {
						page: this.pageData.page,
						size: this.pageData.size,
						...this.filterData,
					},
					success: (res) => {
						uni.stopPullDownRefresh();
						this.pageData.total = res.data.totalElements;
						if (res.data.last) {
							this.status = "noMore";
						}
						const projects = res.data.content.map((project) =>
							Object.assign(project, {
								safetyCheck: {
									total: 0,
									days: 0,
									safe: 0,
									risk: {
										handled: 0,
										unhandled: 0,
									},
								},
								qualityCheck: {
									total: 0,
									days: 0,
									safe: 0,
									risk: {
										handled: 0,
										unhandled: 0,
									},
								},
								safetyTraining: {
									total: 0,
									days: 0,
									participate: 0,
									leave: 0,
								},
								contract: {
									total: 0,
									not_uploaded: 0,
									unconfirmed: 0,
									confirmed: 0,
								},
								salary: {
									total: 0,
									paid: 0,
									unpaid: 0,
									arrears: 0,
								},
							})
						);
						this.listData =
							this.pageData.page === 0 ?
							projects :
							this.listData.concat(projects);
						const tab = this.tabs.find((t) => t.active);
						if (projects && projects.length > 0) {
							this.statisticSafetyCheck(projects, tab.startTime, tab.endTime);
							// this.statisticQualityCheck(projects, tab.startTime, tab.endTime);
							if (this.hasAuthority) {
								this.statisticSafetyTraining(projects, tab.startTime, tab.endTime);
								this.statisticContract(projects);
								if (this.visible) {
									this.statisticSalary(projects, tab.startTime, tab.endTime);
								}
							}
						}
					},
				});
			},
			statisticSafetyCheck(projects, startTime, endTime) {
				const projectIds = projects.map((project) => project.id).join(",");
				uni.request({
					url: "/api/ss/safety-check/get-checked-days",
					data: {
						"project.id": projectIds,
						startTime,
						endTime,
					},
					success: (res) => {
						this.listData.forEach((project) =>
							res.data.forEach((data) => {
								if (project.id === data.project) {
									project.safetyCheck.days = data.count;
								}
							})
						);
					},
				});
				uni.request({
					url: "/api/ss/safety-check/statistic",
					data: {
						"project.id": projectIds,
						startTime,
						endTime,
					},
					success: (res) => {
						this.listData.forEach((project) =>
							res.data.forEach((data) => {
								if (project.id === data.project) {
									if (data.status === "safe") {
										project.safetyCheck.safe = data.count;
									}
									if (data.status === "risk") {
										if (data.handled) {
											project.safetyCheck.risk.handled = data.count;
										} else {
											project.safetyCheck.risk.unhandled = data.count;
										}
									}
								}
							})
						);
					},
				});
			},
			toSafetyCheckList(project, status, handled) {
				const tab = this.tabs.find((t) => t.active);
				uni.navigateTo({
					url: `/pages/modules/ss/safety-check/list/list?project=${project}&status=${status}&handled=${handled}&startTime=${tab.startTime}&endTime=${tab.endTime}`,
				});
			},
			statisticQualityCheck(projects, startTime, endTime) {
				const projectIds = projects.map((project) => project.id).join(",");
				uni.request({
					url: "/api/ss/quality-check/get-checked-days",
					data: {
						"project.id": projectIds,
						startTime,
						endTime,
					},
					success: (res) => {
						this.listData.forEach((project) =>
							res.data.forEach((data) => {
								if (project.id === data.project) {
									project.qualityCheck.days = data.count;
								}
							})
						);
					},
				});
				uni.request({
					url: "/api/ss/quality-check/statistic",
					data: {
						"project.id": projectIds,
						startTime,
						endTime,
					},
					success: (res) => {
						this.listData.forEach((project) =>
							res.data.forEach((data) => {
								if (project.id === data.project) {
									if (data.status === "safe") {
										project.qualityCheck.safe = data.count;
									}
									if (data.status === "risk") {
										if (data.handled) {
											project.qualityCheck.risk.handled = data.count;
										} else {
											project.qualityCheck.risk.unhandled = data.count;
										}
									}
								}
							})
						);
					},
				});
			},
			toQualityCheckList(project, status, handled) {
				const tab = this.tabs.find((t) => t.active);
				uni.navigateTo({
					url: `/pages/modules/ss/quality-check/list/list?project=${project}&status=${status}&handled=${handled}&startTime=${tab.startTime}&endTime=${tab.endTime}`,
				});
			},
			statisticSafetyTraining(projects, startTime, endTime) {
				const projectIds = projects.map((project) => project.id).join(",");
				uni.request({
					url: "/api/ss/safety-training/get-trained-days",
					data: {
						"project.id": projectIds,
						startTime,
						endTime,
					},
					success: (res) => {
						this.listData.forEach((project) =>
							res.data.forEach((data) => {
								if (project.id === data.project) {
									project.safetyTraining.days = data.count;
								}
							})
						);
					},
				});
				uni.request({
					url: "/api/ss/safety-training/statistic",
					data: {
						"project.id": projectIds,
						startTime,
						endTime,
					},
					success: (res) => {
						this.listData.forEach((project) =>
							res.data.forEach((data) => {
								if (project.id === data.project) {
									project.safetyTraining.total = data.count;
								}
							})
						);
					},
				});
				uni.request({
					url: "/api/ss/safety-training-participant/statistic",
					data: {
						"project.id": projectIds,
						startTime,
						endTime,
					},
					success: (res) => {
						this.listData.forEach((project) =>
							res.data.forEach((data) => {
								if (project.id === data.project) {
									project.safetyTraining[data.status] = data.count;
								}
							})
						);
					},
				});
			},
			toSafetyTrainingList(project) {
				const tab = this.tabs.find((t) => t.active);
				uni.navigateTo({
					url: `/pages/modules/ss/safety-training/list/list?project=${project}&startTime=${tab.startTime}&endTime=${tab.endTime}`,
				});
			},
			statisticContract(projects) {
				let url = "/api/oa/contract/statistic-by-department?";
				projects.forEach(
					(project) =>
					(url += "department.id=" + project.buManager.job.department.id + "&")
				);
				uni.request({
					url,
					success: (res) =>
						this.listData.forEach((project) => {
							res.data.forEach((data) => {
								if (project.buManager.job.department.id === data.department) {
									project.contract[data.status] = data.count;
								}
							});
							project.contract.total =
								project.contract.not_uploaded +
								project.contract.unconfirmed +
								project.contract.confirmed;
						}),
				});
			},
			toContractList(project, status) {
				uni.navigateTo({
					url: `/pages/modules/oa/contract/list/list?project=${project}&status=${status}`,
				});
			},
			statisticSalary(projects, startTime, endTime) {
				const organizationIds = projects
					.map((project) => project.buildingUnit.id)
					.join(",");
				uni.request({
					url: "/api/oa/payroll-record/statistic",
					data: {
						"organization.id": organizationIds,
						startTime,
						endTime,
					},
					success: (res) => {
						this.listData.forEach((project) => {
							let total = 0;
							res.data.forEach(data => {
								if (project.buildingUnit.id === data.organization) {
									project.salary[data.status] = data.count;
									total += data.count;
								}
							});
							project.salary.total = total;
						});
					},
				});
			},
			toPayrollRecordList(project, status) {
				const tab = this.tabs.find((t) => t.active);
				uni.navigateTo({
					url: `/pages/modules/oa/payroll-record/list/list?project=${project}&status=${status}&startTime=${tab.startTime}&endTime=${tab.endTime}`,
				});
			},
		},
	};
</script>

<style>
	.tabs {
		position: fixed;
		width: 100%;
		display: flex;
		top: 0;
		z-index: 99;
		background-color: #ffffff;
	}

	.tabs>.tab {
		flex-grow: 1;
		text-align: center;
		color: #3c9cff;
		border: 1px solid #3c9cff;
		border-right: 0;
		height: 40px;
		line-height: 40px;
	}

	.tabs>.tab :first {
		border-left: 0;
	}

	.tabs>.active {
		background-color: #3c9cff;
		color: #ffffff !important;
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
		color: #4cd964;
	}

	.risk {
		color: #dd524d;
	}
</style>
