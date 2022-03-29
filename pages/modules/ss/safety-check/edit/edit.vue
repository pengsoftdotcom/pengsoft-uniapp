<template>
	<view class="w-form-wrap">
		<u--form :labelWidth="65" :model="formModel" ref="form">
			<u-form-item label="工程项目" prop="project.name" borderBottom ref="item1">
				{{formModel.project.name}}
			</u-form-item>
			<u-form-item label="编码" prop="code" borderBottom>
				{{formModel.code}}
			</u-form-item>
			<u-form-item label="检查主题" prop="subject" borderBottom required>
				<u--input v-model="formModel.subject" border="surround"></u--input>
			</u-form-item>
			<u-form-item label="检查人" prop="checker.person.name" borderBottom>
				{{formModel.checker.person.name}}
			</u-form-item>
			<u-form-item label="状态" prop="status.id" borderBottom required>
				<u-radio-group v-model="formModel.status.id">
					<u-radio :customStyle="{marginRight: '16px'}" v-for="(item, index) in statusArr" :key="index"
						:label="item.name" :name="item.id">
					</u-radio>
				</u-radio-group>
			</u-form-item>
			<u-form-item label="检查图片" prop="submitFiles" borderBottom required>
				<u-upload :capture="['camera']" :fileList="submitFiles" @afterRead="afterReadSubmitPicture()"
					@delete="deletePicture" :maxCount="6" :deletable="isSubmitDisabled()"
					:disabled="isSubmitDisabled()">
				</u-upload>
			</u-form-item>
			<u-form-item label="描述" prop="reason" borderBottom required>
				<u--textarea v-model="formModel.reason"></u--textarea>
			</u-form-item>
			<u-form-item v-if="formModel.submittedAt && formModel.status.code === 'risk'" label="处理图片"
				prop="handleFiles" borderBottom required>
				<u-upload :capture="['camera']" :fileList="handleFiles" @afterRead="afterReadHandlePicture()"
					@delete="deletePicture" :maxCount="6" :deletable="isHandleDisabled()"
					:disabled="isHandleDisabled()">
				</u-upload>
			</u-form-item>
			<u-form-item v-if="formModel.submittedAt && formModel.status.code === 'risk'" label="处理结果" prop="result"
				borderBottom required>
				<u--textarea v-model="formModel.result"></u--textarea>
			</u-form-item>
		</u--form>
		<view class="w-form-btn-content">
			<u-button v-if="isSubmitVisible()" :disabled="isSubmitDisabled()" type="primary" text="提交" @click="submit">
			</u-button>
			<u-button v-if="isHandleVisible()" :disabled="isHandleDisabled()" type="success" text="处理" @click="handle">
			</u-button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				titleObj: {
					create: '新增安全检查',
					update: '编辑安全检查',
					detail: '安全检查详情',
				},
				type: '',
				formModel: {
					id: '',
					project: '', // 工程项目
					code: '', // 编码
					subject: '', // 检查主题
					checker: '', // 检查人
					status: '', // 状态
					submitFiles: [], // 检查图片
					reason: '', // 描述
					submittedAt: '', // 提交时间
					handleFiles: [], // 处理图片
					result: '', // 处理结果
					handledAt: '' // 处理时间
				},
				statusArr: [],
				submitFiles: [],
				handleFiles: [],
				rules: {
					subject: [{
						type: 'string',
						required: true,
						message: '请填写检查主题'
					}],
					submitFiles: {
						type: 'array',
						required: true,
						message: '请上传检查图片'
					},
					reason: {
						type: 'string',
						required: true,
						message: '请填写描述'
					},
					handleFiles: {
						type: 'array',
						message: '请上传处理图片',
						validator: (rule, value, callback) => {
							if (this.formModel.id && (!value || value.length === 0)) {
								return false;
							} else {
								return true;
							}
						}
					},
					result: {
						type: 'string',
						message: '请填写处理结果',
						validator: (rule, value, callback) => {
							if (this.formModel.id && !value) {
								return false;
							} else {
								return true;
							}
						}
					}
				}
			}
		},
		onLoad(option) {
			uni.getDictionaryItem('safety_check_status', data => this.statusArr = data);
			this.formModel.id = option.id;
			this.type = option.type;
			this.findOne();
		},
		onReady() {
			uni.setNavigationBarTitle({
				title: this.titleObj[this.type]
			})
			this.$refs.form.setRules(this.rules)
		},
		methods: {
			findOne() {
				uni.request({
					url: '/api/ss/safety-check/find-one-with-files',
					data: {
						id: this.formModel.id
					},
					success: res => {
						this.formModel = res.data;
						if (this.formModel.submitFiles) {
							this.submitFiles = this.formModel.submitFiles.map(file => uni.convertToFile(file));
							this.formModel.submitFiles;
						}
						if (this.formModel.handleFiles) {
							this.handleFiles = this.formModel.handleFiles.map(file => uni.convertToFile(file));
							this.formModel.handleFiles;
						}
					}
				})
			},
			isSubmitVisible() {
				return uni.hasAnyAuthority('ss::safety_check::submit');
			},
			isSubmitDisabled() {
				return this.formModel.submittedAt;
			},
			submit() {
				this.$refs.form.validate().then(res => {
					let url = '/api/ss/safety-check/submit?';
					if (this.submitFiles) {
						this.submitFiles.forEach(file => url += 'asset.id=' + file.id + '&');
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
								title: '提交成功',
								success: () => {
									uni.navigateBack();
								}
							})
					})
				}).catch(errors => {
					console.log(errors);
				})
			},
			isHandleVisible() {
				return uni.hasAnyAuthority('ss::safety_check::handle');
			},
			isHandleDisabled() {
				return !this.formModel.submittedAt || this.formModel.handledAt || this.formModel.status.code === 'safe';
			},
			handle() {
				this.$refs.form.validate().then(res => {
					let url = '/api/ss/safety-check/handle?id=' + this.formModel.id;
					if (this.handleFiles) {
						this.handleFiles.forEach(file => url += '&asset.id=' + file.id);
					}
					uni.request({
						url,
						method: 'PUT',
						data: {
							result: this.formModel.result
						},
						success: res => uni.showModal({
							title: '处理成功',
							success: () => {
								uni.navigateBack();
							}
						})
					})
				}).catch(errors => {
					console.log(errors);
				})
			},
			async afterReadSubmitPicture(event) {
				const file = JSON.parse(await uni.upload(event.file, false))[0];
				if (!this.formModel.submitFiles) {
					this.formModel.submitFiles = [];
				}
				this.formModel.submitFiles.push(file);
				this.submitFiles.push(uni.convertToFile(file));
			},
			async afterReadHandlePicture(event) {
				const file = JSON.parse(await uni.upload(event.file, false))[0];
				if (!this.formModel.handleFiles) {
					this.formModel.handleFiles = [];
				}
				this.formModel.handleFiles.push(file);
				this.handleFiles.push(uni.convertToFile(file));
			},
			deletePicture(event) {
				return new Promise(resolve => {
					uni.request({
						url: '/api/ss/safety-check/delete-file-by-asset',
						method: 'DELETE',
						data: {
							id: this.formModel.id,
							'asset.id': event.file.id
						},
						success: res => {
							this.submitFiles.splice(event.index, 1);
							resolve();
						}
					});
				});

			}
		},

	}
</script>

<style lang="scss">
	page {
		background:#fff;
	}
</style>
