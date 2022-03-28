<template>
	<view>
		
	</view>
</template>

<script>
	export default {
		data() {
			return {
				...{
				contentText: {
					contentdown: '上拉加载更多',
					contentrefresh: '加载中',
					contentnomore: '没有更多'
				},
				status: 'loading',
			}, ...uni.page}
		},
		onLoad() {
			this.findPage();
		},
		onPullDownRefresh() {
			console.log('pull')
			this.pageData.page = 0;
			this.findPage();
		},
		onReachBottom() {
			this.status = 'more';
			this.pageData.page += 1;
			this.findPage();
		},
		methods: {
			findPage() {
				uni.request({
					url: '/api/oa/payroll-record/find-page',
					data: {
						...{
							page: this.pageData.page,
							size: this.pageData.size
						},
						...this.filterData
					},
					success: res => {
						this.listData = this.listData.concat(res.content);
						this.pageData.total = res.totalElements;
						// 是否首页
						this.pageData.first = res.first;
						// 是否末页
						this.pageData.last = res.last;
					}
				});
		
			}
		},
		onShow() {
			this.findPage();
		}
	}
</script>

<style>

</style>
