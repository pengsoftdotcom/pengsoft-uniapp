<template>
	<view>
		<view class="w-list-wrap">
			<view v-for="(item, index) in listData" :key="index" :class="itemClass[item.priority.code]" class="w-list-item" @click="forward(item)">
				<view class="w-list-item-title uni-ellipsis-2">{{ item.name }}</view>
				<view class="w-list-item-body">
					<view>{{ item.content }}</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				itemClass: {
					'low': 'border-info',
					'medium': 'border-warning',
					'high': 'border-danger',
				},
				...uni.listModel,
			}
		},
		onShow() {
			this.getList();
		},
		methods: {
			getList() {
				uni.request({
					url: '/api/task/task/find-all',
					data: {
						'status.code': 'created'
					},
					success: (res) => {
						this.listData = res.data;
					}
				})
			},
			edit(id, type) {
				uni.navigateTo({
					url: `../edit/edit?id=${id}&type=${type}`
				})
			},
			forward(item) {
				uni.navigateTo({
					url: `../../modules${item.targetPath}/edit/edit?id=${item.targetId}`
				})
			}
		}
	}
</script>

<style>

</style>
