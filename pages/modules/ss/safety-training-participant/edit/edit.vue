<template>
	<view class="w-form-wrap">
		<u--form :labelWidth="65" :model="formModel" :rules="rules" ref="form">
			<u-form-item label="请假理由" prop="reason" borderBottom required>
				<u--textarea v-model="formModel.reason"></u--textarea>
			</u-form-item>
		</u--form>
		<view class="w-form-btn-content">
			<u-button type="success" text="参与" @click="participate">
			</u-button>
			<u-button type="warning" text="请假" @click="leave">
			</u-button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				formModel: {
					id: '',
					reason: ''
				},
				rules: {
					reason: {
						type: 'string',
						required: true,
						message: '请填写请假理由'
					},
				},
				statusArr: []
			}
		},
		onLoad(option) {
			uni.getDictionaryItem('safety_training_participant_status', data => this.statusArr = data);
			this.formModel.id = option.id;
		},
		methods: {
			participate() {
				this.formModel['status.id'] = this.statusArr.find(status => status.code === 'participate').id;
				this.confirm();
			},
			leave() {
				this.$refs.form.validate().then(res => {
					this.formModel['status.id'] = this.statusArr.find(status => status.code === 'leave').id;
					this.confirm();
				}).catch(errors => {
					console.log(errors);
				});
			},
			confirm() {
				uni.request({
					url: '/api/ss/safety-training-participant/confirm',
					method: 'PUT',
					data: this.formModel,
					success: () => uni.showModal({
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

<style lang="scss">
	page {
		background: #fff;
	}
</style>
