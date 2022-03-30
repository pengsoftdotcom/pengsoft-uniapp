<template>
	<view>
		<view class="w-list-wrap">
				<view v-for="(item, index) in listData" :key="index" class="w-list-item"
					@click="edit(item.id, 'detail')">
					<view class="w-list-item-title uni-ellipsis-2" style="display: flex;">
						<view style="flex-grow: 1;">
							{{ item.staff.person.name }}
						</view>
						<view>
							{{ item.status.name ? item.status.name : '未确认'}}
						</view>
					</view>
					<view class="w-list-item-body">
						{{item.reason ? item.reason : ''}}
					</view>
				</view>
		</view>
		<uni-load-more :status="status" :icon-size="16" :content-text="contentText" />
		<button class="w-fab-btn" @click="edit('', 'create')">
			<u-icon color="#fff" name="plus"></u-icon>
		</button>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				formModel: {},
				...uni.listModel
			}
		},
		onLoad(option) {
			this.filterData['training.id'] = option['training.id'];
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
				uni.request({
					url: '/api/ss/safety-training-participant/find-page',
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
			edit(id, type) {
				uni.navigateTo({
					url: `../edit/edit?id=${id}&type=${type}`
				})
			},
			submit() {
				console.log(this.formModel);
			}
		}
	}
</script>

<style>

</style>
