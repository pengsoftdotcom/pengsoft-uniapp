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
			<u-tabs :list="tabs" @change="tabChange"></u-tabs>
			<view v-if="showUnit">
				<u-row>
					<u-col span="3">单位名称</u-col>
					<u-col span="9">{{formModel[unit].name}}</u-col>
				</u-row>
				<u-row>
					<u-col span="3">{{formModel[manager].job.name}}</u-col>
					<u-col span="8">{{formModel[manager].person.name}}</u-col>
					<u-col span="1">
						<u-icon size="20" color="#2979ff" name="phone-fill"
							@click="makePhoneCall(formModel[manager].person.mobile)"></u-icon>
					</u-col>
				</u-row>
				<view v-if="isDutyPerformanceVisible()">
					<u-subsection mode="subsection" :list="durations" :current="current" @change="sectionChange">
					</u-subsection>
					<u-row v-for="staff in staffs" :key="staff.id">
						<u-col span="3">{{staff.job.name}}</u-col>
						<u-col span="2">{{staff.person.name}}</u-col>
						<u-col :span="manager === 'buManager' ? 3 : 6">已检查
							{{staff.checkingDays ? staff.checkingDays : 0}} 天</u-col>
						<u-col span="3" v-if="manager === 'buManager'">已培训
							{{staff.trainingDays ? staff.trainingDays : 0}} 天</u-col>
						<u-col span="1">
							<u-icon size="20" color="#2979ff" name="phone-fill"
								@click="makePhoneCall(staff.person.mobile)"></u-icon>
						</u-col>
					</u-row>
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
				durations: ['月', '年'],
				current: 0,
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
				let startTime = '';
				let endTime = '';
				switch (this.durations[this.current]) {
					case '月':
						startTime = uni.atStartOfCurrentMonth();
						endTime = uni.atStartOfNextMonth();
						break;
					default:
						startTime = uni.atStartOfCurrentYear();
						endTime = uni.atStartOfNextYear();
						break;
				}
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

<style>

</style>
