<template>
	<view>
		
	</view>
</template>

<script>
	export default {
		data() {
			return {
				form: {
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
				}
			}
		},
		methods: {
			findOne() {
				uni.request({
					url: '/api/ss/safety-check/find-one-with-files',
					data: {
						id: this.form.id
					},
					success: res => {
						this.form = res.data;
					}
				})
			},
			submit() {
				let url = '/api/ss/safety-check/submit?';
				const form = {...this.form};
				if (form.submitFiles) {
					form.submitFiles.forEach(file => url += 'asset.id=' + file.id + '&');
					url = url.substring(0, url.length - 1);
					delete form.submitFiles;
				}
				uni.request({
					url,
					method: 'POST',
					header: {'Content-Type': 'application/json'},
					data: form,
					success: res => {
						console.log(res);
					}
				})
			},
			handle() {
				let url = '/api/ss/safety-check/handle?id=' + this.form.id;
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
		onLoad(option) {
			this.form.id = option.id;
			this.findOne();
		}
	}
</script>

<style>

</style>
