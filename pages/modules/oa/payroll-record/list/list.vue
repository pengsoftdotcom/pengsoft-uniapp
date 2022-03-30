<template>
	<view>
		<view class="w-list-wrap">
			<view v-for="(item, index) in listData" :key="index" class="w-list-item" @click="edit(item.id, 'detail')">
				<view class="w-list-item-title ellipsis-2">{{ item.code }}</view>
				<view class="w-list-item-body">
					<view style="display: flex;">
						<text style="flex:auto">支付人数: {{ item.paidCount }}</text>
						<text style="flex:none">确认人数: {{ item.confirmedCount }}</text>
					</view>
				</view>
			</view>
		</view>
		<uni-load-more :status="status" :icon-size="16" :content-text="contentText" />
	</view>
</template>

<script>
	export default {
		data() {
			return JSON.parse(JSON.stringify(uni.listModel));
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
				let operation = 'find-page';
				if (uni.hasAnyRole('worker')) {
					operation = 'find-page-of-mine';
				}
				uni.request({
					url: `/api/oa/payroll-record/${operation}`,
					data: {
						page: this.pageData.page,
						size: this.pageData.size
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
