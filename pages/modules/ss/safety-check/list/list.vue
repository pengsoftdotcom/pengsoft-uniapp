<template>
	<view>
		
	</view>
</template>

<script>
	export default {
		data() {
			return {
				pageData: {
					page: 0,
					size: 20
				},
				listData: [],
				filterData: {
					
				}
			}
		},
		methods: {
			findPage() {
				const me = this;
				uni.request({
					url: '/api/ss/safety-check/find-page',
					data: Object.assign({
						page: this.pageData.page,
						size: this.pageData.size
					}, this.filterData),
					success(res) {
						me.pageData.total = res.totalElements;
						// 是否首页
						me.pageData.first = res.first;
						// 是否末页
						me.pageData.last = res.last;
						me.listData = res.content
					}
				})
			}
		},
		onShow() {
			this.findPage();
		}
	}
</script>

<style>

</style>
