<template>
	<view>
		<view class="w-form-wrap">
			<u--form v-if="!loading" :model="formModel" :labelWidth="80">
				<u-form-item label="项目编码" prop="code" borderBottom>
					{{formModel.code}}
				</u-form-item>
				<u-form-item label="项目名称" prop="code" borderBottom>
					{{formModel.name}}
				</u-form-item>
				<u-form-item label="项目简称" prop="code" borderBottom>
					{{formModel.shortName}}
				</u-form-item>
			</u--form>
			<view class="corp-tabs">
				<u-tabs :list="tabs" @change="tabChange"></u-tabs>
			</view>
			<view v-if="showUnit" class="corp-card">
				<view class="corp-name">
					{{formModel[unit].name}}
				</view>

				<view class="staff-content" @click="makePhoneCall(formModel[manager].person.mobile)">
					<view class="staff-job">
						{{formModel[manager].job.name}}
					</view>
					<view class="staff-main">
						<view class="staff-name">
							{{formModel[manager].person.name}}

						</view>
					</view>
					<u-icon size="20" color="#2979ff" name="phone-fill"></u-icon>
				</view>

				<view v-if="isDutyPerformanceVisible()">
					<view v-for="staff in staffs" :key="staff.id" class="staff-content"
						@click="makePhoneCall(formModel[manager].person.mobile)">
						<view class="staff-job">
							{{staff.job.name}}
						</view>
						<view class="staff-main">
							<view class="staff-name">
								{{staff.person.name}}
							</view>
							<text class="staff-work">
								应检 <text class="info">28</text> 天，已检<text class="success">{{staff.checkingDays ? staff.checkingDays : 0}}</text>天
								<text v-if="manager === 'buManager'">
									，已培训<text class="success">{{staff.trainingDays ? staff.trainingDays : 0}}</text>天
								</text>
							</text>
						</view>
						<u-icon size="20" color="#2979ff" name="phone-fill"></u-icon>

					</view>
				</view>

			</view>
			<view v-if="showStatistics">

			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				loading: true,
				showUnit: false,
				showStatistics: true,
				tabs: [
					/* {
										name: '统计分析',
										code: 'statistics'
									}, */
					{
						unit: 'buildingUnit',
						name: '施工单位',
						manager: 'buManager'
					}, {
						unit: 'supervisionUnit',
						name: '监理单位',
						manager: 'suManager'
					}, {
						unit: 'owner',
						name: '建设单位',
						manager: 'ownerManager'
					}, {
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
			}
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
			tabChange(tab) {
				this.showStatistics = !!tab.code;
				if (this.showStatistics) {

				}

				this.showUnit = !this.showStatistics;
				if (this.showUnit) {
					this.unit = tab.unit;
					this.manager = tab.manager;
					if (this.isDutyPerformanceVisible()) {
						const departmentId = this.formModel[this.manager].department.id;
						const roleCode = this.manager === 'suManager' ? 'supervision_engineer' : 'security_officer';
						this.findAllStaffs(departmentId, roleCode);
					}
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
			isDutyPerformanceVisible() {
				return this.manager === 'suManager' || this.manager === 'buManager'
			},
			findOne() {
				uni.request({
					url: `/api/ss/construction-project/find-one`,
					data: {
						id: this.formModel.id
					},
					success: res => {
						this.loading = false;
						this.formModel = res.data;
						this.tabChange(this.tabs.find(tab => tab.manager === 'buManager'));
					}
				})
			},
			findAllStaffs(departmentId, roleCode) {
				this.staffs = [];
				uni.request({
					url: '/api/basedata/staff/find-all-by-department-and-role-codes',
					data: {
						'department.id': departmentId,
						'role.code': roleCode
					},
					success: res => {
						this.staffs = res.data;
						this.getDutyPerformance();
					}
				})
			},
			getDutyPerformance() {
				const startTime = uni.atStartOfCurrentMonth();
				const endTime = uni.atStartOfNextMonth();
				uni.request({
					url: '/api/ss/safety-check/statistic-by-checker',
					data: {
						'project.id': this.formModel.id,
						'checker.id': this.staffs.map(staff => staff.id).join(','),
						startTime,
						endTime
					},
					success: res => {
						this.staffs.forEach(staff => {
							const data = res.data.find(item => staff.id === item.checker);
							if (data) {
								staff.checkingDays = data.count;
							} else {
								staff.checkingDays = 0;
							}
						});
						this.timestamp = new Date().getTime();
					}
				});
				uni.request({
					url: '/api/ss/safety-training/statistic-by-trainer',
					data: {
						'project.id': this.formModel.id,
						'trainer.id': this.staffs.map(staff => staff.id).join(','),
						startTime,
						endTime
					},
					success: res => {
						this.staffs.forEach(staff => {
							const data = res.data.find(item => staff.id === item.trainer);
							if (data) {
								staff.trainingDays = data.count;
							} else {
								staff.trainingDays = 0;
							}
						});
						this.timestamp = new Date().getTime();
					}
				});

			},
			statistics() {

			}
		}
	}
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
				width: 50px;
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
