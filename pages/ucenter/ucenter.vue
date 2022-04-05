<template>
	<view class="center">
		<view class="userInfo" @click.capture="toUserInfo">
			<image class="logo-img" :src="avatar"></image>
			<view class="logo-title">
				<text class="user-name">{{name}}</text>
				<text class="post-name">{{postName}}</text>
			</view>
			<view class="logo-title">
				<text class="organization-name">{{organizationName}}</text>
			</view>
		</view>
		<uni-list class="center-list" v-for="(submenus , index) in menus" :key="index">
			<uni-list-item v-for="(submenu,i) in submenus" :key="i" v-if="isMenuVisible(submenu)" :title="submenu.title"
				:link="!!submenu.url" :to="submenu.url" :show-extra-icon="!!submenu.icon"
				:extraIcon="{type:submenu.icon,color:'#999'}" :show-badge="!!submenu.badge" :badge-text="submenu.badge">
			</uni-list-item>
		</uni-list>
		<button class="unbind" type="warn" @click="unbind()">解除绑定</button>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				avatar: '../../static/uni-center/defaultAvatarUrl.png',
				name: '',
				postName: '',
				organizationName: '',
				menus: [
					[{
							title: '合同',
							icon: 'compose',
							url: '/pages/modules/oa/contract/list/list',
							badge: 0,
							roles: ['worker']
						},
						{
							title: '工资',
							icon: 'wallet',
							url: '/pages/modules/oa/payroll-detail/list/list',
							badge: 0,
							roles: ['worker']
						}
					]
				]
			}
		},
		methods: {
			isMenuVisible(menu) {
				return uni.hasAnyRole(menu.roles);
			},
			unbind() {
				uni.showModal({
					content: '确定要解除绑定吗？',
					success(res) {
						if (res.confirm) {
							uni.request({
								url: '/api/user-details/unbind',
								method: 'POST',
								data: {
									type: 'mpOpenid'
								},
								complete: () => {
									uni.clearStorageSync();
									uni.navigateTo({
										url: '../bind/bind'
									})
								}
							});
						}
					}
				})
			}
		},
		onShow() {
			const userDetails = uni.getUserDetails();
			if (userDetails.person) {
				if (userDetails.person.avatar) {
					this.avatar = userDetails.person.avatar.accessPath;
				}
				if (userDetails.person.name) {
					this.name = userDetails.person.name;
				}
			}
			if (userDetails.primaryOrganization) {
				this.organizationName = userDetails.primaryOrganization.name;
			}
			if (userDetails.primaryJob) {
				this.postName = userDetails.primaryJob.post.name;
			}
		}
	}
</script>

<style lang="scss" scoped>
	/* #ifndef APP-NVUE */
	view {
		display: flex;
		box-sizing: border-box;
		flex-direction: column;
	}

	page {
		background-color: #f8f8f8;
	}

	/* #endif*/

	.center {
		flex: 1;
		flex-direction: column;
		background-color: #f8f8f8;
	}

	.userInfo {
		width: 750rpx;
		padding: 20rpx;
		padding-top: 50px;
		background-image: url(../../static/uni-center/headers.png);
		flex-direction: column;
		align-items: center;
	}

	.logo-img {
		width: 150rpx;
		height: 150rpx;
		border-radius: 150rpx;
	}

	.logo-title {
		flex: 1;
		align-items: center;
		justify-content: space-between;
		flex-direction: row;
	}

	.user-name {
		height: 100rpx;
		line-height: 100rpx;
		font-size: 36rpx;
		color: #FFFFFF;
	}

	.post-name {
		margin-left: 20rpx;
		font-size: 30rpx;
		color: #FFFFFF;
	}

	.organization-name {
		font-size: 30rpx;
		color: #FFFFFF;
	}

	.center-list {
		margin-bottom: 30rpx;
		background-color: #f9f9f9;
	}

	.center-list-cell {
		width: 750rpx;
		background-color: #007AFF;
		height: 40rpx;
	}

	.grid {
		background-color: #FFFFFF;
		margin-bottom: 6px;
	}

	.uni-grid .text {
		font-size: 30rpx;
		height: 25px;
		line-height: 25px;
		color: #817f82;
	}

	.uni-grid .item ::v-deep .uni-grid-item__box {
		justify-content: center;
		align-items: center;
	}


	/*修改边线粗细示例*/
	/* #ifndef APP-NVUE */
	.center-list ::v-deep .uni-list--border:after {
		-webkit-transform: scaleY(0.2);
		transform: scaleY(0.2);
		margin-left: 80rpx;
	}

	.center-list ::v-deep .uni-list--border-top,
	.center-list ::v-deep .uni-list--border-bottom {
		display: none;
	}

	/* #endif */
	.item-footer {
		flex-direction: row;
		align-items: center;
	}

	.item-footer-text {
		color: #999;
		font-size: 24rpx;
		padding-right: 10rpx;
	}

	.item-footer-badge {
		width: 20rpx;
		height: 20rpx;
		/* #ifndef APP-NVUE */
		border-radius: 50%;
		/* #endif */
		/* #ifdef APP-NVUE */
		border-radius: 10rpx;
		/* #endif */
		background-color: #DD524D;
	}

	.unbind {
		position: fixed;
		bottom: 0;
		width: 100%;
	}
</style>
