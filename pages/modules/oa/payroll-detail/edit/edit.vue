<template>
	<view>
		<view class="w-form-wrap">
			<u--form :labelWidth="65" :model="formModel" ref="form">
				<u-form-item label="姓名" prop="staff.person.name" borderBottom>
					{{formModel.staff.person.name ? formModel.staff.person.name : ''}}
				</u-form-item>
				<u-form-item label="总收入" prop="grossPay" borderBottom>
					{{formModel.grossPay ? formModel.grossPay : 0}}
				</u-form-item>
				<u-form-item label="净收入" prop="netPay" borderBottom>
					{{formModel.netPay ? formModel.netPay : 0}}
				</u-form-item>
				<u-form-item label="确认时间" prop="finishedAt" borderBottom>
					{{formModel.confirmedAt ? formModel.confirmedAt : ''}}
				</u-form-item>
			</u--form>
			<view class="w-form-btn-content">
				<u-button v-if="isConfirmVisible()" :disabled="isConfirmDisabled()" type="primary" text="确认"
					@click="confirm()">
				</u-button>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				titleObj: {
					detail: '发薪明细',
				},
				type: '',
				formModel: {
					id: ''
				},
			}
		},
		onLoad(option) {
			this.formModel.id = option.id;
			this.type = option.type;
			this.findOne();
		},
		onReady() {
			uni.setNavigationBarTitle({
				title: this.titleObj[this.type]
			})
		},
		methods: {
			findOne() {
				let operation = 'find-one';
				if (uni.hasAnyRole('worker')) {
					operation = 'find-one-of-mine';
				}
				console.log(operation);
				uni.request({
					url: `/api/oa/payroll-detail/${operation}`,
					data: {
						id: this.formModel.id
					},
					success: res => this.formModel = res.data
				})
			},
			isConfirmVisible() {
				return uni.hasAnyRole('worker');
			},
			isConfirmDisabled() {
				return this.formModel.confirmedAt;
			},
			confirm() {
				let operation = 'confirm';
				if (uni.hasAnyRole('worker')) {
					operation = 'confirm-mine';
				}
				let url = `/api/oa/payroll-detail/${operation}?id=${this.formModel.id}`;
				uni.request({
					url,
					method: 'PUT',
					success: res => uni.showModal({
						title: '确认成功',
						success: () => {
							uni.navigateBack();
						}
					})
				});
			}
		}
	}
</script>

<style>

</style>
