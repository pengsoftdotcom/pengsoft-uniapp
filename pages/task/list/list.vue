<template>
	<view>
		<view class="w-list-wrap">
			<view v-for="(item, index) in listData" :key="index" :class="itemClass[item.priority.code]" class="w-list-item" @click="edit(item.id, 'detail')">
				<view class="w-list-item-title uni-ellipsis-2">{{ item.name }}</view>
				<view class="w-list-item-body">
					<view>{{ item.content }}</view>
				</view>
			</view>
		</view>
		<uni-load-more :status="status" :icon-size="16" :content-text="contentText" />
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
		onPullDownRefresh() {
			this.pageData.page = 0;
			this.getList();
		},
		onReachBottom() {
			if (this.status !== 'noMore') {
				this.pageData.page += 1;
				this.getList();
			}
		},
		methods: {
			getList() {
				this.status = 'more';
				if (this.pageData.page !== 0) {
					this.status = 'loading';
				}
				uni.request({
					url: '/api/task/task/find-page',
					data: {
						page: this.pageData.page,
						size: this.pageData.size,
						'status.code': 'created'
					},
					success: (res) => {
						uni.stopPullDownRefresh();
						this.pageData.total = res.data.totalElements;
						if (res.data.last) {
							this.status = 'noMore';
						}
						this.listData = this.pageData.page === 0 ? res.data.content :
							this.listData.concat(res.data.content)
					}
				})
			},
			edit(id, type) {
				uni.navigateTo({
					url: `../edit/edit?id=${id}&type=${type}`
				})
			}
		}
	}
</script>

<style>

</style>
