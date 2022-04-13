<template>
	<view class="w-list-wrap">
		<u-row justify="space-between" gutter="10">
			<u-col span="4">
				<view class="cell">
					<view>项目总数</view>
					<u-avatar :text="total" size="60" bgColor="#3c9cff" @click="query('')"></u-avatar>
				</view>
			</u-col>
			<u-col span="4">
				<view class="cell">
					<view>在建项目</view>
					<u-avatar :text="building" size="60" bgColor="#f9ae3d" @click="query('building')"></u-avatar>
				</view>
			</u-col>
			<u-col span="4">
				<view class="cell">
					<view>建成项目</view>
					<u-avatar :text="complete" size="60" bgColor="#5ac725" @click="query('complete')"></u-avatar>
				</view>
			</u-col>
		</u-row>
		<view class="w-list-wrap">
			<view v-for="(item, index) in listData" :key="index" class="w-list-item" @click="edit(item.id)">
				<view class="w-list-item-title ellipsis-2">{{item.shortName}} 【{{item.code}}】</view>
				<view class="w-list-item-body">
					<view>
						<view>项目状态：</view>
						<view>{{item.status.name}}</view>
					</view>
					<view>
						<view>开工时间：</view>
						<view>{{item.startedAt}}</view>
					</view>
					<view>
						<view>完工时间：</view>
						<view>{{item.completedAt}}</view>
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
				total: 0,
				building: 0,
				complete: 0,
				...JSON.parse(JSON.stringify(uni.listModel))
			}
		},
		onShow() {
			this.statisticByStatus();
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
			query(code) {
				this.filterData['status.code'] = code;
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

<style>
	.cell {
		border-radius: 4px;
		background-color: #EFEFEF;
		text-align: center;
	}
</style>
