<template>
	<view>
		<view class="tabs">
			<view v-for="(tab,index) in tabs" :key="index" class="tab" :class="{active: tab.active}"
				@click="active(tab)">{{tab.name}}</view>
		</view>
		<view class="w-list-wrap" style="margin-top: 54px;">
			<view v-for="(item, index) in listData" :key="index" class="w-list-item" @click="edit(item.id)">
				<view class="w-list-item-title ellipsis-2">{{ item.code }} - {{ item.checker.person.name }}</view>
				<view class="w-list-item-body">
					<view>{{ item.project.name }}</view>
					<view style="margin-top: 5px;">于 <text class="time">{{ item.submittedAt }}</text> 提交</view>
					<view v-if="item.status.code === 'risk'">
						<text v-if="item.handledAt">
							于 <text class="time">{{ item.handledAt }}</text> 整改
						</text>
						<text v-else>尚未整改</text>
					</view>
					<view v-else>无需整改</view>
				</view>
				<view class="w-list-item-status" :class="item.status.code ==='safe' ? 'success' : 'warning'">
					{{item.status.name}}
				</view>
				<view class="w-list-item-angle" v-if="item.handledAt">已整改</view>
			</view>
		</view>
		<uni-load-more :status="status" :icon-size="16" :content-text="contentText" />
		<button v-if="isCreateVisible()" class="w-fab-btn" @click="edit('', 'create')">
			<u-icon color="#fff" name="plus"></u-icon>
		</button>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				tabs: [{
					name: '全部',
					active: true
				}, {
					name: '安全',
					status: 'safe',
					active: false
				}, {
					name: '隐患',
					status: 'risk',
					active: false
				}],
				handled: undefined,
				...JSON.parse(JSON.stringify(uni.listModel))
			};
		},
		onLoad(option) {
			const project = option.project;
			if (project) {
				this.filterData['project.id'] = project;
			}
			const status = option.status;
			if (status) {
				this.filterData['status.code'] = status;
				this.tabs.forEach(t => t.active = t.status === status);
			}
			const handled = option.handled;
			if (handled) {
				this.handled = handled;
				if (status === 'risk') {
					this.filterData['handled'] = handled;
				}
			}
			const startTime = option.startTime;
			if (startTime) {
				this.filterData['startTime'] = startTime;
			}
			const endTime = option.endTime;
			if (endTime) {
				this.filterData['endTime'] = endTime;
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
			isCreateVisible() {
				return uni.hasAnyAuthority('ss::quality_check::save');
			},
			active(tab) {
				this.tabs.forEach(t => t.active = false);
				tab.active = true;
				if (tab.status) {
					this.filterData['status.code'] = tab.status;
					if (tab.status === 'risk' && this.handled !== undefined) {
						this.filterData['handled'] = this.handled;
					} else {
						delete this.filterData['handled'];
					}
				} else {
					delete this.filterData['status.code'];
					delete this.filterData['handled'];
				}
				this.pageData.page = 0;
				this.getList();
			},
			getList() {
				this.status = 'more';
				if (this.pageData.page !== 0) {
					this.status = 'loading';
				}
				uni.request({
					url: '/api/ss/quality-check/find-page',
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
	.tabs {
		position: fixed;
		width: 100%;
		display: flex;
		top: 0;
		z-index: 99;
		background-color: #FFFFFF;
	}

	.tabs>.tab {
		flex-grow: 1;
		text-align: center;
		color: #3C9CFF;
		border: 1px solid #3C9CFF;
		border-right: 0;
		height: 40px;
		line-height: 40px;
	}

	.tabs>.tab :first {
		border-left: 0;
	}

	.tabs>.active {
		background-color: #3C9CFF;
		color: #FFFFFF !important;
	}

	.time {
		font-family: Courier, monospace;
		font-size: 14px;
		margin: 0 2px;
	}
</style>
