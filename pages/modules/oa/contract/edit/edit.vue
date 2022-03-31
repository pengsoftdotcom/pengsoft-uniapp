<template>
	<view>
		<view class="w-form-wrap">
			<u--form :labelWidth="80" :model="formModel" ref="form">
				<u-form-item label="乙方" prop="partyB" borderBottom>
					{{formModel.partyB.name ? formModel.partyB.name : ''}}
				</u-form-item>
				<u-form-item label="合同图片" prop="pictures" borderBottom>
					<u-upload :capture="['camera']" :fileList="pictures" @afterRead="afterReadPicture()"
						@delete="deletePicture" :maxCount="6" :deletable="!isDisabled()" :disabled="isDisabled()">
					</u-upload>
				</u-form-item>
				<u-form-item label="确认时间" prop="finishedAt" borderBottom>
					{{formModel.confirmedAt ? formModel.confirmedAt : ''}}
				</u-form-item>
			</u--form>
			<view class="w-form-btn-content">
				<u-button v-if="isSaveVisible()" :disabled="isSaveDisabled()" type="primary" text="保存"
					@click="save">
				</u-button>
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
					create: '新增合同',
					update: '编辑合同',
					detail: '合同详情',
				},
				type: '',
				formModel: {
					id: ''
				},
				typeArr: [],
				statusArray: [],
				pictures: [],
				rules: {
					pictures: {
						type: 'array',
						required: true,
						message: '请上传合同图片'
					}
				}
			}
		},
		onLoad(option) {
			uni.getDictionaryItem('contract_party_type', data => this.typeArr = data);
			uni.getDictionaryItem('contract_status', data => this.statusArr = data);
			this.formModel.id = option.id;
			this.type = option.type;
			this.findOne();
		},
		onReady() {
			uni.setNavigationBarTitle({
				title: this.titleObj[this.type]
			})
			this.$refs.form.setRules(this.rules);
		},
		methods: {
			isDisabled() {
				return  uni.hasAnyRole('worker') || this.formModel.confirmedAt;
			},
			findOne() {
				let operation = 'find-one-with-party';
				if (uni.hasAnyRole('worker')) {
					operation = 'find-one-of-mine';
				}
				console.log(operation);
				uni.request({
					url: `/api/oa/contract/${operation}`,
					data: {
						id: this.formModel.id
					},
					success: res => {
						this.formModel = res.data;
						if (this.formModel.pictures) {
							this.pictures = this.formModel.pictures.map(file => uni.convertToFile(file));
						}
					}
				})
			},
			isSaveVisible() {
				return uni.hasAnyAuthority('oa::contract::save');
			},
			isSaveDisabled() {
				return this.formModel.confirmedAt;
			},
			save() {
				this.$refs.form.validate().then(res => {
					let url = '/api/oa/contract/save-with-pictures?';
					if (this.pictures) {
						this.pictures.forEach(file => url += 'picture.id=' + file.id + '&');
						url = url.substring(0, url.length - 1);
					}
					uni.request({
						url,
						method: 'POST',
						header: {
							'Content-Type': 'application/json'
						},
						data: this.formModel,
						success: res =>
							uni.showModal({
								title: '保存成功',
								success: () => {
									uni.navigateBack();
								}
							})
					})
				}).catch(errors => uni.showToast({
					title: '请完成填写后提交',
					icon: 'none'
				}));
			},
			isConfirmVisible() {
				return uni.hasAnyRole('worker');
			},
			isConfirmDisabled() {
				return this.pictures.length < 1 || this.formModel.confirmedAt;
			},
			confirm() {
				let operation = 'confirm';
				if (uni.hasAnyRole('worker')) {
					operation = 'confirm-mine';
				}
				this.$refs.form.validate().then(res => {
					let url = `/api/oa/contract/${operation}?id=${this.formModel.id}`;
					uni.request({
						url,
						method: 'PUT',
						success: res => uni.showModal({
							title: '确认成功',
							success: () => {
								uni.navigateBack();
							}
						})
					})
				}).catch(errors => uni.showToast({
					title: '请完成填写后提交',
					icon: 'none'
				}));
			},
			async afterReadPicture(event) {
				const file = JSON.parse(await uni.upload(event.file, true))[0];
				if (!this.formModel.pictures) {
					this.formModel.pictures = [];
				}
				this.formModel.pictures.push(file);
				if (file.locked) {
					file.accessPath = await uni.download(file);
				}
				this.pictures.push(uni.convertToFile(file));
			},
			deletePicture(event) {
				return new Promise(resolve => {
					uni.request({
						url: '/api/oa/contract/delete-picture-by-asset',
						method: 'DELETE',
						data: {
							id: this.formModel.id,
							'asset.id': event.file.id
						},
						success: res => {
							this.pictures.splice(event.index, 1);
							resolve();
						}
					});
				});

			}
		}
	}
</script>

<style>

</style>
