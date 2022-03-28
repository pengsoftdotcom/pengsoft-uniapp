<template>
	<view>
		<view class="w-list-wrap">
			<view v-for="(item, index) in listData" :key="index" class="w-list-item" @click="edit(item.id)">
				<view class="w-list-item-title uni-ellipsis-2">{{ item.subject }}</view>
				<view class="w-list-item-body">
					<view>{{ item.checker.person.name }}</view>
					<view>{{ item.submittedAt }}</view>
					<view>{{ item.project.name }}</view>
				</view>
				<view class="w-list-item-status" :class="item.status.code ==='safe' ? 'success' : 'warning'">
					{{item.status.name}}
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
				contentText: {
					contentdown: '上拉加载更多',
					contentrefresh: '加载中',
					contentnomore: '没有更多'
				},
				status: 'more',
				pageData: {
					page: 0,
					size: 10
				},
				listData: [],
			}
		},
		onLoad() {
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
					url: '/api/ss/safety-check/find-page',
					data: {
						page: this.pageData.page,
						size: this.pageData.size,
					},
					success: (res) => {
						uni.stopPullDownRefresh();
						this.pageData.total = res.data.totalElements;
						if (res.data.last) {
							this.status = 'noMore';
						}
						this.listData = this.pageData.page === 0 ? res.data.content :
							this.listData.concat(res.data.content)
					},
					fail: (data, code) => {
						console.log('fail' + JSON.stringify(data));
					}
				})
			},
			edit(id) {
				uni.navigateTo({
					url: '../edit/edit?id=' + id
				})
			}
		},
	}
</script>

<style>

</style>
