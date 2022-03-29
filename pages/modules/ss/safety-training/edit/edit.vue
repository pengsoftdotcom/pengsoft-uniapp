<template>
	<view class="w-form-wrap">
		<u--form :labelWidth="95" :model="formModel" :rules="rules" ref="form">
			<u-form-item label="工程项目" prop="project.name" borderBottom ref="item1">
				{{formModel.project.name}}
			</u-form-item>
			<u-form-item label="编码" prop="code" borderBottom>
				{{formModel.code}}
			</u-form-item>
			<u-form-item label="培训主题" prop="subject" borderBottom required>
				<u--input v-model="formModel.subject" border="surround"></u--input>
			</u-form-item>
			<u-form-item label="培训人" prop="trainer.person.name" borderBottom>
				{{formModel.trainer.person.name}}
			</u-form-item>
			<u-form-item label="全员参加" prop="allWorkers" borderBottom>
				<u-switch v-model="formModel.allWorkers"></u-switch>
			</u-form-item>
			<u-form-item label="预计开始时间" prop="estimatedStartTime" borderBottom @click="estShow = true">
				<u--input v-model="formModel.estimatedStartTime" disabled disabledColor="#ffffff" placeholder="请选择"
					border="none"></u--input>
			</u-form-item>
			<u-form-item label="预计结束时间" prop="estimatedEndTime" borderBottom @click="eetShow = true">
				<u--input v-model="formModel.estimatedEndTime" disabled disabledColor="#ffffff" placeholder="请选择"
					border="none"></u--input>
			</u-form-item>
			<u-form-item label="培训地址" prop="address" borderBottom>
				<u--textarea v-model="formModel.address"></u--textarea>
			</u-form-item>
			<u-form-item v-if="formModel.startedAt" label="过程图片" prop="files" borderBottom required>
				<u-upload :capture="['camera']" :fileList="files" @afterRead="afterReadPicture()"
					@delete="deletePicture" :maxCount="6" :deletable="!formModel.endedAt" :disabled="formModel.endedAt">
				</u-upload>
			</u-form-item>
		</u--form>

		<u-datetime-picker closeOnClickOverlay :show="estShow" mode="datetime" @cancel="estShow=false" v-model="estTime"
			@close="estShow=false" @confirm="handleStartTimeConfirm">
		</u-datetime-picker>
		<u-datetime-picker closeOnClickOverlay :show="eetShow" mode="datetime" @cancel="eetShow=false" v-model="eetTime"
			@close="eetShow=false" @confirm="handleEndTimeConfirm">
		</u-datetime-picker>

		<view class="w-form-btn-content">
			<u-button size="small" v-if="isButtonVisible('save')" :disabled="isSaveDisabled()" type="primary" text="保存"
				@click="save">
			</u-button>
			<u-button size="small" v-if="isButtonVisible('save_and_submit')" :disabled="isSubmitDisabled()" type="primary" text="提交"
				@click="saveAndSubmit">
			</u-button>
			<u-button size="small" v-if="isButtonVisible('submit')" :disabled="isSubmitAndSaveDisabled()" type="primary" text="保存并提交"
				@click="saveAndSubmit">
			</u-button>
			<u-button size="small" v-if="isButtonVisible('start')" :disabled="isStartDisabled()" type="success" text="开始"
				@click="start">
			</u-button>
			<u-button size="small" v-if="isButtonVisible('end')" :disabled="isEndDisabled()" type="error" text="结束" @click="end">
			</u-button>
			<u-button size="small" v-if="isButtonVisible('confirm')" :disabled="isConfirmDisabled()" type="primary" text="确认"
				@click="confirm">
			</u-button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				titleObj: {
					create: '新增安全培训',
					update: '编辑安全培训',
					detail: '安全检查培训',
				},
				type: '',
				formModel: {
					id: '',
					project: null,
					code: '',
					subject: '',
					trainer: null,
					allWorkers: true,
					estimatedStartTime: '',
					estimatedEndTime: '',
					address: '',
					files: []
				},
				estShow: false,
				eetShow: false,
				estTime: Number(new Date()),
				eetTime: Number(new Date()),
				files: [],
				rules: {

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
		},
		methods: {
			findOne() {
				uni.request({
					url: '/api/ss/safety-training/find-one-with-files',
					data: {
						id: this.formModel.id
					},
					success: res => {
						this.formModel = res.data;
						if (this.formModel.files) {
							this.files = this.formModel.files.map(file => uni.convertToFile(file));
							this.formModel.files;
						}
					}
				})
			},
			save() {
				this.$refs.form.validate().then(res => {}).catch(errors => {
					console.log(errors);
				})
			},
			saveAndSubmit() {
				this.$refs.form.validate().then(res => {}).catch(errors => {
					console.log(errors);
				})
			},
			submit() {
				this.$refs.form.validate().then(res => {}).catch(errors => {
					console.log(errors);
				})
			},
			start() {
				this.$refs.form.validate().then(res => {}).catch(errors => {
					console.log(errors);
				})
			},
			end() {
				this.$refs.form.validate().then(res => {}).catch(errors => {
					console.log(errors);
				})
			},
			confirm() {
				this.$refs.form.validate().then(res => {}).catch(errors => {
					console.log(errors);
				})
			},
			isButtonVisible(operation) {
				return uni.hasAnyAuthority(`ss::safety_training::${operation}`);
			},
			isSaveDisabled() {
				return this.formModel.allWorkers || this.formModel.id;
			},
			isSubmitDisabled() {
				return !this.formModel.id || this.formModel.submittedAt;
			},
			isSubmitAndSaveDisabled() {
				return !this.formModel.allWorkers || this.formModel.submittedAt;
			},
			isStartDisabled() {
				return !this.formModel.submittedAt || this.formModel.startedAt;
			},
			isEndDisabled() {
				return !this.formModel.startedAt || this.formModel.endedAt;
			},
			isConfirmDisabled() {
				return !this.formModel.submittedAt || this.formModel.confirmedAt;
			},
			async afterReadPicture(event) {
				const file = JSON.parse(await uni.upload(event.file, false))[0];
				if (!this.formModel.files) {
					this.formModel.files = [];
				}
				this.formModel.files.push(file);
				this.files.push(uni.convertToFile(file));
			},
			deletePicture(event) {
				return new Promise(resolve => {
					uni.request({
						url: '/api/ss/safety-training/delete-file-by-asset',
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

			},
			handleStartTimeConfirm(e) {
				console.log(e)
				this.estShow = false;
				this.formModel.estimatedStartTime = uni.$u.timeFormat(e.value, 'yyyy-mm-dd hh:MM:ss')
			},
			handleEndTimeConfirm(e) {
				this.eetShow = false;
				this.formModel.estimatedEndTime = uni.$u.timeFormat(e.value, 'yyyy-mm-dd hh:MM:ss')
			},
		},
	}
</script>

<style>
	.toolbar {
		display: flex;
	}

	.toolbar button {
		margin-right: 8rpx;
	}

	.toolbar :last-child {
		margin-right: 0;
	}
</style>
