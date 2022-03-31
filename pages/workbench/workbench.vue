<template>
	<view>
		<view class="home-menu-wrap" v-for="(item,index) in menus" :key="index" v-if="isMenuVisible(item)">
			<uni-section :title="item.name" type="line">
				<view class="home-menu-container">
					<view v-for="(child,index2) in item.children" :key="index2" class="home-menu-item"
						@click="handleClickMenu(child)" v-if="isMenuVisible(child)">
						<uni-icons class="menu-icon" :type="child.icon" size="30" />
						<text class="menu-text"> {{child.name}} </text>
					</view>
				</view>
			</uni-section>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				menus: [{
						name: '工地安全',
						children: [{
							name: '工地检查',
							icon: 'shop-filled',
							url: '/pages/modules/ss/safety-check/list/list',
							role: ['bu_manager', 'supervision_engineer', 'security_officer'],
						}, {
							name: '安全培训',
							icon: 'shop-filled',
							url: '/pages/modules/ss/safety-training/list/list',
							role: ['bu_manager', 'security_officer', 'worker'],
						}]
					},
					{
						name: '保障支付',
						children: [{
							name: '合同',
							icon: 'shop-filled',
							url: '/pages/modules/oa/contract/list/list',
							role: ['bu_manager', 'cashier'],
						}, {
							name: '工资',
							icon: 'shop-filled',
							url: '/pages/modules/oa/payroll-record/list/list',
							role: ['bu_manager', 'cashier'],
						}]
					},
				],
				time: '',
			}
		},
		onShow() {
			this.time = new Date();
		},
		methods: {
			isMenuVisible(menu) {
				let roles = [];
				if (menu.children) {
					menu.children.forEach(child => child.role.forEach(role => roles.push(role)));
				} else {
					roles = menu.role;
				}
				return uni.hasAnyRole(roles);
			},
			handleClickMenu(item) {
				uni.navigateTo({
					url: item.url
				})
			}
		}
	}
</script>

<style lang="scss">
	.home-menu-wrap {
		margin: 8px;
		padding-bottom: 20px;
		border-radius: 4px;
		border: 1px solid #EBEEF5;
		background: #FFFFFF;
		box-shadow: 0 3px 1px -2px #0003, 0 2px 2px #00000024, 0 1px 5px #0000001f;

		// reset
		.uni-section {
			margin: 0;
		}

		.home-menu-container {
			display: flex;
			overflow: hidden;

			.home-menu-item {
				width: 33.33%;
				padding: 8px;
				box-sizing: border-box;
				flex: none;

				.menu-icon {
					display: block;
					text-align: center;
					padding: 8px;
				}

				.menu-text {
					display: block;
					text-align: center;
					font-size: 13px;
				}
			}
		}

	}
</style>
