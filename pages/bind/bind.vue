<template>
	<view style="padding: 22px 16rpx 0;">
		<uni-forms ref="form" v-if="formVisible" :modelValue="form" :rules="rules" labelWidth="60"
			err-show-type="toast">
			<uni-forms-item label="手机号码" name="username" labelAlign="right">
				<uni-easyinput type="digit" v-model="form.username" maxlength="11" focus />
			</uni-forms-item>
			<uni-forms-item label="验证码" name="captcha" labelAlign="right" class="captcha">
				<uni-easyinput class="input" type="form.digit" v-model="form.captcha" maxlength="6" />
				<button class="button" type="default" size="mini" :disabled="buttonDisabled"
					@click="getCaptcha()">{{buttonText}}</button>
			</uni-forms-item>
			<button type="primary" @click="bind()">绑定</button>
		</uni-forms>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				form: {
					type: 'mpOpenid',
					username: '',
					captcha: '',
					value: ''
				},
				rules: {
					username: {
						rules: [{
							required: true,
							errorMessage: '请输入正确的手机号码',
						}, {
							minLength: 11,
							errorMessage: '请输入正确的手机号码',
						}]
					},
					captcha: {
						rules: [{
							required: true,
							errorMessage: '请输入正确的验证码'
						}]
					}
				},
				formVisible: false,
				buttonText: '获取验证码',
				buttonDisabled: false,
				totalSeconds: 60 // 验证码生成间隔秒数
			};
		},
		onLoad: function(option) {
			const _vm = this;
		},
		methods: {
			signIn() {
				uni.request({
					url: '/oauth/token',
					header: {
						'Authorization': 'Basic bXA6MTM2MzllNmYtN2IzNi00ODUyLWFhODgtZDM1ZjQ1NDMwMjQ0'
					},
					method: 'POST',
					data: {
						grant_type: 'mp',
						mp_open_id: this.form.value
					},
					success: res => {
						const cache = {};
						cache.accessToken = res.data;
						uni.setStorageSync('pengsoft', cache);
						uni.request({
							url: '/api/user-details/current',
							success: res1 => {
								cache.userDetails = res1.data;
								uni.setStorageSync('pengsoft', cache);
								this.afterSignedIn();
							}
						})
					}
				})
			},
			afterSignedIn() {
				uni.switchTab({
					url: '/pages/task/list/list'
				});
			},
			bind() {
				this.$refs.form.validate().then(res => {
					uni.request({
						url: '/api/user-details/bind',
						method: 'POST',
						data: this.form,
						success: res => {
							uni.showModal({
								content: '绑定成功',
								showCancel: false,
								success: res1 => {
									if (res1.confirm) {
										this.signIn();
									}
								}
							});
						}
					})
				}).catch(err => console.log(err));

			},
			getCaptcha() {
				if (!this.form.username || this.form.username.length != 11) {
					uni.showToast({
						title: '请输入正确的手机号码',
						icon: 'none'
					});
					return;
				}
				uni.request({
					url: '/api/system/captcha/generate',
					method: 'POST',
					data: {
						username: this.form.username
					},
					success: res => {
						uni.showToast({
							title: '发送成功',
							icon: 'none'
						});
						let leftSeconds = this.totalSeconds - 1;
						this.buttonDisabled = true;
						this.buttonText = '剩余' + this.format(leftSeconds) + '秒';
						const interval = setInterval(() => {
							if (leftSeconds === 1) {
								clearInterval(interval);
								leftSeconds = this.totalSeconds;
								this.buttonDisabled = false;
								this.buttonText = '获取验证码';
							} else {
								leftSeconds -= 1;
								let buttonText = '剩余'
								buttonText += this.format(leftSeconds) + '秒';
								this.buttonText = buttonText;
							}
						}, 1000);
					}
				});
			},
			format(seconds) {
				if (seconds < 10) {
					return '0' + seconds;
				}
				return seconds;
			}
		},
		onShow() {
			if (uni.isAuthenticated()) {
				this.afterSignedIn();
			} else {
				wx.login({
					success: res => {
						uni.request({
							url: '/api/weixin/ma/' + uni.getAccountInfoSync().miniProgram.appId +
								'/is-bound',
							data: {
								code: res.code
							},
							success: res1 => {
								this.form.value = res1.data.openid;
								if (res1.data.bound) {
									this.signIn();
								} else {
									uni.setNavigationBarTitle({
										title: '绑定手机'
									});
									this.formVisible = true;
								}
							}
						})
					}
				});
			}
		}
	}
</script>

<style lang="scss">
	.captcha {
		.uni-forms-item__content {
			display: flex;
			align-items: center;

			.input {
				flex-grow: 1;
			}

			.button {
				flex-grow: 0;
				margin-left: 12rpx;
				padding: 4px 8px;
			}
		}
	}
</style>
