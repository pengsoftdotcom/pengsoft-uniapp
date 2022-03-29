<template>
	<view>
		<view class="w-list-wrap">
			<view v-for="(item, index) in listData" :key="index" :class="itemClass[item.level]" class="w-list-item" @click="clickItem(item)">
				<view class="w-list-item-title uni-ellipsis-2">{{ item.title }}</view>
				<view class="w-list-item-body">
					<view>{{ item.content }}</view>
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
				itemClass: {
					'1': 'border-info',
					'2': 'border-warning',
					'3': 'border-danger',
				},
				...uni.listModel,
			}
		},
		methods: {
		},
		onReady() {
			this.listData = [{
					title: 'title',
					content: 'content',
					level: '1'
				},
				{
					title: 'title',
					content: 'content',
					level: '2'
				},
				{
					title: 'title',
					content: 'content',
					level: '3'
				},
			]
			console.log(this)
		}
	}
</script>

<style>

</style>
