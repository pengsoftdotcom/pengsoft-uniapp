<template>
	<view class="w-list-wrap">
		<u-tabs :list="list" @click="query()" :scrollable="false" :activeStyle="activeStyle"
			:inactiveStyle="inactiveStyle">
		</u-tabs>

		<view class="w-list-wrap">
			<view v-for="(item, index) in listData" :key="index" class="w-list-item" @click="edit(item.id)">
				<view class="w-list-item-title ellipsis-2">{{item.shortName}} 【{{item.code}}】</view>
				<view class="w-list-item-status" :class="item.status.code === 'building' ? 'info' : 'success'">
					<view>{{item.status.name}}</view>
				</view>
				<view class="w-list-item-body">
					<view>
						<view>开工时间：{{item.startedAt}}</view>
					</view>
					<view>
						<view>完工时间：{{item.completedAt}}</view>
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
			return {
				activeStyle: {
					color: '#303133',
					fontWeight: 'bold',
					transform: 'scale(1.05)'
				},
				inactiveStyle: {
					color: '#606266',
					transform: 'scale(1)'
				},
				total: 0,
				building: 0,
				complete: 0,
				...JSON.parse(JSON.stringify(uni.listModel))
			}
		},
		computed: {
			list() {
				return [{
						name: '项目总数',
						code: '',
						badge: {
							value: this.total
						}
					},
					{
						name: '在建项目',
						code: 'building',
						badge: {
							value: this.building
						}
					},
					{
						name: '建成项目',
						code: 'complete',
						badge: {
							value: this.complete
						}
					},
				]
			}
		},
		onShow() {
			this.statisticByStatus();
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
			statisticByStatus() {
				uni.request({
					url: '/api/ss/construction-project/statistic-by-status',
					success: res => {
						res.data.forEach(data => this[data.code] = data.count);
						this.total = this.building + this.complete;
					}
				})
			},
			query(item) {
				this.filterData['status.code'] = item.code;
				this.getList();
			},
			getList() {
				this.status = 'more';
				if (this.pageData.page !== 0) {
					this.status = 'loading';
				}
				uni.request({
					url: '/api/ss/construction-project/find-page',
					data: {
						page: this.pageData.page,
						size: this.pageData.size,
						...this.filterData
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
			edit(id) {
				uni.navigateTo({
					url: `../edit/edit?id=${id}`
				})
			}
		}
	}
</script>

<style lang="scss">
	.cell {
		border-radius: 4px;
		background-color: #EFEFEF;
		text-align: center;
	}
</style>
