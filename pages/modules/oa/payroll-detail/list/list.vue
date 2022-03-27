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
				uni.request({
					url: '/api/oa/contract/find-page',
					data: Object.assign({
						page: this.pageData.page,
						size: this.pageData.size
					}, this.filterData),
					success(res) {
						this.pageData.total = res.totalElements;
						// 是否首页
						this.pageData.first = res.first;
						// 是否末页
						this.pageData.last = res.last;
						this.listData = res.content
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
