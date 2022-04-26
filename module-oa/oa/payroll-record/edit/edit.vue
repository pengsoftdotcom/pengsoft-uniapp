<template>
	<view>
		<view class="w-form-wrap">
			<u--form :labelWidth="80" :model="formModel" ref="form">
				<u-form-item label="年" prop="year" borderBottom>
					{{formModel.year}}
				</u-form-item>
				<u-form-item label="月" prop="month" borderBottom>
					{{formModel.month}}
				</u-form-item>
				<u-form-item label="支付人数" prop="paidCount" borderBottom>
					{{formModel.paidCount}}
				</u-form-item>
				<u-form-item label="确认人数" prop="confirmedCount" borderBottom>
					{{formModel.confirmedCount}}
				</u-form-item>
			</u--form>
			<view class="w-form-btn-content">
				<u-button type="primary" text="发薪明细" @click="payrollDetail"></u-button>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				titleObj: {
					create: '新增发薪记录',
					update: '编辑发薪记录',
					detail: '发薪记录详情',
				},
				type: '',
				project: '',
				formModel: {
					id: ''
				},
				sheet: [],
				signedSheet: []
			}
		},
		onLoad(option) {
			this.formModel.id = option.id;
			this.type = option.type;
			const project = option.project;
			if (project) {
				this.project = project;
			}
			this.findOne();
		},
		onReady() {
			uni.setNavigationBarTitle({
				title: this.titleObj[this.type]
			})
		},
		methods: {
			isDisabled() {
				return uni.hasAnyRole('worker') || this.formModel.confirmedAt;
			},
			findOne() {
				let operation = 'find-one';
				if (uni.hasAnyRole('worker')) {
					operation = 'find-one-of-mine';
				}
				uni.request({
					url: `/api/oa/payroll-record/${operation}`,
					data: {
						id: this.formModel.id,
						'project.id': this.project
					},
					success: res => this.formModel = res.data
				})
			},
			payrollDetail() {
				uni.navigateTo({
					url: `../../payroll-detail/list/list?project=${this.project}&payroll.id=${this.formModel.id}`
				})
			}
		}
	}
</script>

<style>

</style>
