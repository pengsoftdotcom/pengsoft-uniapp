<template>
	<view class="w-form-wrap">
		<u--form :labelWidth="65" :model="formModel" :rules="rules" ref="form">
			<u-form-item label="请假理由" prop="reason" borderBottom required>
				<u--textarea v-if="!isDisabled()" v-model="formModel.reason"></u--textarea>
				{{isDisabled() ? formModel.reason ? formModel.reason : '' : ''}}
			</u-form-item>
		</u--form>
		<view class="w-form-btn-content">
			<u-button :disabled="isDisabled()" type="success" text="参与" @click="participate">
			</u-button>
			<u-button :disabled="isDisabled()" type="warning" text="请假" @click="leave">
			</u-button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				titleObj: {
					create: '新增参与人',
					update: '编辑参与人',
					detail: '参与人详情',
				},
				type: '',
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
			this.type = option.type;
			this.formModel.id = option.id;
			this.findOne();
		},
		onReady() {
			uni.setNavigationBarTitle({
				title: this.titleObj[this.type]
			});
		},
		methods: {
			isDisabled() {
				return this.type === 'detail' || this.formModel.confirmedAt || (this.formModel.training && this.formModel.training.endedAt);
			},
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
				uni.clearFormModel(this.formModel);
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
			},
			findOne() {
				uni.request({
					url: '/api/ss/safety-training-participant/find-one',
					data: {
						id: this.formModel.id
					},
					success: res => {
						this.formModel = res.data;
						this.type = 'detail';
						if (uni.hasAnyRole('worker') && !this.formModel.training.endedAt) {
							this.type = 'update';
						}
					}
				})
			}
		}
	}
</script>

<style lang="scss">
	page {
		background: #fff;
	}
</style>
