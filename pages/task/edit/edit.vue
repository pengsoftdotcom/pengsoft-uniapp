<template>
	<view>
		<view class="w-form-wrap">
			<u--form :labelWidth="65" :model="formModel" ref="form">
				<u-form-item label="任务名称" prop="name" borderBottom>
					{{formModel.name}}
				</u-form-item>
				<u-form-item label="任务内容" prop="content" borderBottom>
					{{formModel.content}}
				</u-form-item>
				<u-form-item label="创建时间" prop="createdAt" borderBottom>
					{{formModel.createdAt}}
				</u-form-item>
				<u-form-item label="完成时间" prop="finishedAt" borderBottom>
					{{formModel.finishedAt ? formModel.finishedAt : ''}}
				</u-form-item>
			</u--form>
			<view class="w-form-btn-content">
				<u-button type="primary" text="前往处理" :disabled="formModel.finishedAt" @click="forward">
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
					create: '新增待办',
					update: '编辑待办',
					detail: '待办详情',
				},
				type: '',
				formModel: {
					id: ''
				}
			}
		},
		onLoad(option) {
			this.formModel.id = option.id;
			this.type = option.type;
		},
		onReady() {
			uni.setNavigationBarTitle({
				title: this.titleObj[this.type]
			})
		},
		onShow() {
			this.findOne()
		},
		methods: {
			findOne() {
				uni.request({
					url: '/api/task/task/find-one',
					data: {
						id: this.formModel.id
					},
					success: res => {
						this.formModel = res.data;
					}
				})
			},
			forward() {
				uni.navigateTo({
					url: `../../modules${this.formModel.targetPath}/edit/edit?id=${this.formModel.targetId}`
				})
			}
		}
	}
</script>

<style>

</style>
