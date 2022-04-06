<template>
	<view>
		<view class="w-list-wrap">
			<view v-for="(item, index) in listData" :key="index" class="w-list-item" @click="edit(item.id, 'detail')">
				<view class="w-list-item-title ellipsis-2">{{ item.code }} - {{ item.subject }}</view>
				<view class="w-list-item-body">
					<view style="display: flex;">
						<text style="flex:auto">{{ item.trainer.person.name }}</text>
						<text style="flex:none">{{ item.submittedAt }}</text>
					</view>
					<view v-if="item.startedAt" class="w-list-item-status"
						:class="item.endedAt ? 'info' : item.startedAt ? 'success' : 'warning'">
						{{getStatusName(item)}}
					</view>
					<view class="ellipsis-1">
						<uni-icons type="location" color="#007aff" size="12" /> {{ item.address }}
					</view>
				</view>
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
			isCreateVisible() {
				return uni.hasAnyRole(['security_officer', 'supervision_engineer']);
			},
			getStatusCode(item) {
				if (item.endedAt) {
					return 'info';
				} else if (item.startedAt) {
					return 'success';
				} else {
					return null;
				}
			},
			getStatusName(item) {
				if (item.endedAt) {
					return '已结束';
				} else if (item.startedAt) {
					return '进行中';
				} else {
					return null;
				}
			},
			getList() {
				this.status = 'more';
				if (this.pageData.page !== 0) {
					this.status = 'loading';
				}
				uni.request({
					url: '/api/ss/safety-training/find-page',
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
