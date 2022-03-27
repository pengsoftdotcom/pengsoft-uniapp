<template>
	<view>
		<view class="uni-list">
			<block v-for="(value, index) in listData" :key="index">
				<view class="uni-list-cell" hover-class="uni-list-cell-hover">
					<view class="uni-media-list">
						<view class="uni-media-list-body">
							<view class="uni-media-list-text-top">{{ value.name }}</view>
							<view class="uni-media-list-text-bottom">
								<text>{{ value.addr }}</text>
								<text>{{ value.time }}</text>
							</view>
						</view>
					</view>
				</view>
			</block>
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
				status: 'loading',
				pageData: {
					page: 0,
					size: 20
				},
				listData: [],
				filterData: {

				}
			}
		},
		onLoad() {
			this.getList();
		},
		onPullDownRefresh() {
			console.log('pull')
			this.pageData.page = 0;
			this.getList();
		},
		onReachBottom() {
			this.status = 'more';
			this.pageData.page += 1;
			this.getList();
		},
		methods: {
			getList() {
				if (this.pageData.page !== 0) {
					//说明已有数据，目前处于上拉加载
					this.status = 'loading';
				}

				let data = Array.from({
					length: 10
				}).map((item, index) => ({
					name: `建筑工地${this.pageData.page} ${index}`,
					addr: '培训地点',
					time: '2022/02/02'
				}));

				setTimeout(() => {
					this.listData = this.pageData.page === 0 ? data : this.listData.concat(data);
				}, 500);

				return

				uni.request({
					url: '/api/oa/contract/find-page',
					data: {
						...{
							page: this.pageData.page,
							size: this.pageData.size
						},
						...this.filterData
					},
					success: res => {
						if (res.statusCode == 200) {
							this.listData = this.pageData.page === 0 ? res.content : this.listData.concat(res.content);
							this.pageData.total = res.totalElements;
							// 是否首页
							this.pageData.first = res.first;
							// 是否末页
							this.pageData.last = res.last;
						}
					},
					fail: (data, code) => {
						console.log('fail' + JSON.stringify(data));
					}
				});

			}
		},
	}
</script>

<style>

</style>
