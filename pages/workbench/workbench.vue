<template>
	<view>

	</view>
</template>

<script>
	export default {
		data() {
			return {
				menus: [{
					name: '工地安全',
					role: ['bu_manager', 'supervision_engineer', 'security_officer'],
					children: [{
						name: '安全检查',
						role: ['bu_manager', 'supervision_engineer', 'security_officer'],
					}, {
						name: '安全培训',
						role: ['bu_manager', 'security_officer'],
					}]
				}, {
					name: '保障支付',
					role: ['bu_manager', 'cashier', 'worker'],
					children: [{
						name: '合同',
						role: ['bu_manager', 'cashier', 'worker'],
					}, {
						name: '工资',
						role: ['bu_manager', 'cashier', 'worker'],
					}]
				}]
			}
		},
		methods: {
			isMenuVisible(menu) {
				return uni.hasAnyRole(menu.role);
			}
		}
	}
</script>

<style>

</style>
