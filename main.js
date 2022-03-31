import App from './App'

const URL_PREFIX = 'https://api.pengsoft.com';
// const URL_PREFIX = 'http://localhost:8080';

uni.isAuthenticated = () => {
	const cache = uni.getStorageSync("pengsoft")
	const accessToken = cache.accessToken;
	return accessToken && accessToken.expiredAt && accessToken.expiredAt - new Date().getTime() + 1000 * 60 * 30 >
		0;
};

uni.getAccessToken = () => {
	const cache = uni.getStorageSync("pengsoft")
	return 'Bearer ' + cache.accessToken.value;
};

uni.getUserDetails = () => {
	const cache = uni.getStorageSync("pengsoft")
	return cache.userDetails;
};

uni.hasAnyRole = (roleCode) => {
	const cache = uni.getStorageSync("pengsoft");
	return cache.userDetails.roles.some(role => {
		if (Array.isArray(roleCode)) {
			return roleCode.some(code => code === role.code);
		} else {
			return role.code === roleCode;
		}
	});
};


uni.hasAnyAuthority = (authorityCode) => {
	const cache = uni.getStorageSync("pengsoft");
	return cache.userDetails.authorities.some(authority => {
		if (Array.isArray(authorityCode)) {
			return authorityCode.some(code => code === authority);
		} else {
			return authority === authorityCode;
		}
	});
};

uni.getDictionaryItem = (code, callback) => {
	uni.request({
		url: '/api/system/dictionary-item/find-all-by-type-code',
		data: {
			code
		},
		success: res => {
			if (callback) {
				callback(res.data);
			}
		}
	})
};

uni.upload = (file, locked) => {
	uni.showLoading();
	return new Promise((resolve, reject) => uni.uploadFile({
		url: URL_PREFIX + `/api/system/asset/upload?locked=${locked}`,
		header: {
			'Authorization': uni.getAccessToken()
		},
		filePath: file.url,
		name: 'file',
		success: res => resolve(res.data),
		fail: res => reject(res),
		complete: () => uni.hideLoading()
	}))
};

uni.download = file => {
	return new Promise((resolve, reject) => uni.request({
		url: `/api/system/asset/download?id=${file.id}`,
		success: res => resolve(res.data)
	}))
};

uni.convertToFile = file => {
	return Object.assign({
		id: file.id,
		locked: file.locked,
		url: file.accessPath
	})
};

uni.clearFormModel = formModel => {
	if (formModel) {
		for (let key in formModel) {
			if (formModel[key] === null || formModel[key] === undefined) {
				delete formModel[key];
			}
		}
	}
}

uni.listModel = {
	contentText: {
		contentdown: '上拉加载更多',
		contentrefresh: '加载中',
		contentnomore: '没有更多'
	},
	status: 'more',
	pageData: {
		page: 0,
		size: 10
	},
	listData: [],
	filterData: {

	}
};

uni.addInterceptor('request', {
	invoke(args) {
		uni.showLoading();

		args.url = URL_PREFIX + args.url;

		if (!args.header) {
			args.header = {};
		}
		if (!args.header['Content-Type']) {
			args.header['Content-Type'] = 'application/x-www-form-urlencoded';
		}
		if (!args.header['Accept-Language']) {
			args.header['Accept-Language'] = 'zh-CN';
		}
		if (uni.isAuthenticated()) {
			args.header['Authorization'] = uni.getAccessToken();
		}

		const success = args.success;
		args.success = (res) => {
			if (res.statusCode !== 200) {
				failure(res);
			} else {
				if (success) {
					success(res);
				}
			}
		};
	},
	fail(args) {
		failure(args);
	},
	complete() {
		uni.hideLoading();
	}
});

const failure = (args) => {
	switch (args.statusCode) {
		case 401:
			uni.showModal({
				title: '登录失效',
				showCancel: false,
				success(res) {
					if (res.confirm) {
						uni.clearStorageSync();
						uni.navigateTo({
							url: '/pages/bind/bind'
						})
					}
				}
			})
			break;
		case 422:
			uni.showToast({
				title: '请完成填写后提交',
				icon: 'none'
			});
			break;
		default:
			if (args.data) {
				uni.showModal({
					title: '提示',
					content: args.data.error_description,
					showCancel: false,
					confirmColor: '#ff4d4f'
				});
			} else {
				console.log(args);
			}
			break;
	}
};
// #ifndef VUE3
import Vue from 'vue'
import uView from '@/uni_modules/uview-ui'

Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
	...App
})

Vue.use(uView)
// 如此配置即可
// uni.$u.config.unit = 'rpx'
app.$mount()
// #endif

// #ifdef VUE3
import {
	createSSRApp
} from 'vue'
export function createApp() {
	const app = createSSRApp(App)
	return {
		app
	}
}
// #endif
