<template>
	<view class="w-form-wrap">
		<u--form :labelWidth="65" :model="formModel" ref="form">
			<u-form-item label="请假理由" prop="reason" borderBottom required>
				<u--textarea v-model="formModel.reason"></u--textarea>
			</u-form-item>
		</u--form>
		<view class="w-form-btn-content">
			<u-button type="success" text="参与" @click="join">
			</u-button>
			<u-button type="warning" text="请假" @click="leave">
			</u-button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				formModel: {
					reason: '',
				},
			}
		},
		methods: {
			join() {},
			leave() {},
		}
	}
</script>

<style lang="scss">
	page {
		background: #fff;
	}
</style>
