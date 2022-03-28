<template>
	<view class="w-form-wrap">
		<u--form labelPosition="left" :model="formModel" ref="form1">
			<u-form-item label="姓名" prop="name" borderBottom ref="item1">
				<u--input v-model="formModel.name" border="none" placeholder="姓名,只能为中文"></u--input>
			</u-form-item>
			<u-form-item label="姓名" prop="userInfo.name" borderBottom ref="item1">
				<u-upload :fileList="formModel.fileList1" @afterRead="afterRead" @delete="deletePic" name="1"
					:maxCount="6">
				</u-upload>
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
					add: '新增安全培训',
					edit: '编辑安全培训',
					detail: '安全培训详情',
				},
				type: '',
				id: '',
				formModel: {
					name: '',
					fileList1: [],
				},
			}
		},
		onLoad(opt) {
			console.log(opt)
			this.type = opt.type;
		},
		onReady() {
			uni.setNavigationBarTitle({
				title: this.titleObj[this.type]
			})
		},
		methods: {
			submit(){
				console.log(this.formModel)
			},
			// 删除图片
			deletePic(event) {
				this[`fileList${event.name}`].splice(event.index, 1)
			},
			// 新增图片
			async afterRead(event) {
				// 当设置 mutiple 为 true 时, file 为数组格式，否则为对象格式
				let lists = [].concat(event.file)
				let fileListLen = this[`fileList${event.name}`].length
				lists.map((item) => {
					this[`fileList${event.name}`].push({
						...item,
						status: 'uploading',
						message: '上传中'
					})
				})
				for (let i = 0; i < lists.length; i++) {
					const result = await this.uploadFilePromise(lists[i].url)
					let item = this[`fileList${event.name}`][fileListLen]
					this[`fileList${event.name}`].splice(fileListLen, 1, Object.assign(item, {
						status: 'success',
						message: '',
						url: result
					}))
					fileListLen++
				}
			},
			uploadFilePromise(url) {
				return new Promise((resolve, reject) => {
					let a = uni.uploadFile({
						header: {
							'Authorization': 'Bearer ' + uni.getAccessToken()
						},
						url: 'https://api.pengsoft.com/api/system/asset/upload',
						filePath: url,
						name: 'file',
						formData: {
							user: 'test'
						},
						success: (res) => {
							setTimeout(() => {
								resolve(res.data.data)
							}, 1000)
						}
					});
				})
			},
		},
	}
</script>

<style>

</style>
