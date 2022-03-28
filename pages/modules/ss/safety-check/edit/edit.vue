<template>
	<view class="w-form-wrap">
		<u--form labelPosition="left" :model="formModel" ref="form1">
			<u-form-item label="工程项目" labelWidth="80" prop="project.name" borderBottom ref="item1">
				{{formModel.project.name}}
			</u-form-item>
			<u-form-item label="编码" prop="code" borderBottom ref="item2">
				{{formModel.code}}
			</u-form-item>
			<u-form-item label="检查主题" labelWidth="80" prop="subject" borderBottom ref="item3">
				<u--input v-model="formModel.subject" border="none" placeholder=""></u--input>
			</u-form-item>
			<u-form-item label="检查人" labelWidth="80" prop="checker.person.name" borderBottom ref="item4">
				{{formModel.checker.person.name}}
			</u-form-item>
			<u-form-item label="状态" labelWidth="80" prop="status.id" borderBottom ref="item5">
				<u-radio-group v-model="formModel.status.id">
					<u-radio :customStyle="{marginRight: '16px'}" v-for="(item, index) in statusArr" :key="index"
						:label="item.name" :name="item.id">
					</u-radio>
				</u-radio-group>
			</u-form-item>

			<u-form-item label="检查图片" labelWidth="80" prop="submitFiles" borderBottom ref="item10">
				<u-upload :fileList="formModel.submitFiles" @afterRead="afterRead" @delete="deletePic" name="1"
					:maxCount="6">
				</u-upload>
			</u-form-item>
			
			<u-form-item label="检查描述" labelWidth="80" prop="reason" borderBottom ref="item4">
				{{formModel.reason}}
			</u-form-item>
			
		</u--form>
		<u-button type="primary" text="提交" customStyle="margin-top: 50px" @click="submit"></u-button>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				titleObj: {
					add: '新增安全检查',
					edit: '编辑安全检查',
					detail: '安全检查详情',
				},
				type: '',
				formModel: {
					id: null,
					project: null, // 工程项目
					code: null, // 编码
					subject: null, // 检查主题
					checker: null, // 检查人
					status: null, // 状态
					submitFiles: null, // 检查图片
					reason: null, // 检查描述
					submittedAt: null, // 提交时间
					handleFiles: null, // 处理图片
					result: null, // 处理结果
					handledAt: null // 处理时间
				},
				statusArr: [{
						id: '35fbaa85-8f54-4b56-a016-df34a1bdfae5',
						name: '安全'
					},
					{
						id: 'db3d6d48-b1e1-4c20-8e34-d237989d66f0',
						name: '隐患'
					},
				],
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
				uni.request({
					url: '/api/ss/safety-check/find-one-with-files',
					data: {
						id: this.formModel.id
					},
					success: res => {
						this.formModel = res.data;
					}
				})
			},
			submit() {
				let url = '/api/ss/safety-check/submit?';
				const form = {
					...this.form
				};
				if (form.submitFiles) {
					form.submitFiles.forEach(file => url += 'asset.id=' + file.id + '&');
					url = url.substring(0, url.length - 1);
					delete form.submitFiles;
				}
				uni.request({
					url,
					method: 'POST',
					header: {
						'Content-Type': 'application/json'
					},
					data: form,
					success: res => {
						console.log(res);
					}
				})
			},
			handle() {
				let url = '/api/ss/safety-check/handle?id=' + this.formModel.id;
				if (this.form.handleFiles) {
					this.form.handleFiles.forEach(file => url += '&asset.id=' + file.id);
				}
				console.log(url);
				uni.request({
					url,
					method: 'PUT',
					success: res => {
						console.log(res);
					}
				})
			}
		},

	}
</script>

<style>

</style>
