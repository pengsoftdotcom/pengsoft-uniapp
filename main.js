import App from './App'

const URL_PREFIX = 'https://api.pengsoft.com';

uni.isAuthenticated = () => {
	const cache = uni.getStorageSync("pengsoft")
	const accessToken = cache.accessToken;
	return accessToken && accessToken.expiredAt && accessToken.expiredAt - new Date().getTime() + 1000 * 60 * 30 >
	0;
};

uni.getAccessToken = () => {
	const cache = uni.getStorageSync("pengsoft")
	return cache.accessToken.value;
}

uni.getUserDetails = () => {
	const cache = uni.getStorageSync("pengsoft")
	return cache.userDetails;
}

uni.hasAnyRole = (roleCode) => {
	const cache = uni.getStorageSync("pengsoft");
	return cache.userDetails.roles.some(role => {
		if (Array.isArray(roleCode)) {
			return roleCode.some(code => code === role.code);
		} else {
			return role.code === roleCode;
		}
	});
}

uni.page = {
	pageData: {
		page: 0,
		size: 20
	},
	listData: [],
	filterData: {
	
	}
}

uni.hasAuthority = (authorityCode) => {
	const cache = uni.getStorageSync("pengsoft");
	return cache.userDetails.authorities.some(authority => {
		if (Array.isArray(authorityCode)) {
			return authorityCode.some(code => code === authority);
		} else {
			return authority === authorityCode;
		}
	});
}

uni.addInterceptor('request', {
	invoke(args) {
		uni.showLoading();

		args.url = URL_PREFIX + args.url;

		if (!args.header) {
			args.header = {};
		}
		if (!args.header['Content-Type']) {
			args.header['Content-Type'] = 'application/x-www-form-urlencoded';
		};
		if (uni.isAuthenticated()) {
			args.header['Authorization'] =  'Bearer ' + uni.getAccessToken();
		}

		const success = args.success;
		args.success = (res) => {
			if (res.statusCode !== 200) {
				failure(res);
			} else {
				success(res);
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
		case 422:
			for (const name in args.data) {
				for (const error of args.data[name]) {
					uni.showToast({
						title: error,
						icon: 'error'
					});
				}
			}
			break;
		default:
			uni.showModal({
				title: '提示',
				content: args.data.error_description,
				showCancel: false,
				confirmColor: '#ff4d4f'
			});
			break;
	}
};
// #ifndef VUE3
import Vue from 'vue'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
	...App
})
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
