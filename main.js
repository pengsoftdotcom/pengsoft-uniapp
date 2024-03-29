import App from './App';

const URL_PREFIX = 'https://api.pengsoft.com';
// const URL_PREFIX = 'http://localhost:8080';

const year = new Date();

const startMonth = new Date();
const endMonth = new Date();
endMonth.setMonth(endMonth.getMonth() + 1);

const startDay = new Date();
const endDay = new Date();
endDay.setDate(endDay.getDate() + 1);

uni.format = (number) => {
    if (number < 10) {
        return '0' + number;
    } else {
        return number;
    }
};

uni.atStartOfToday = () =>
    startDay.getFullYear() +
    '-' +
    uni.format(startDay.getMonth() + 1) +
    '-' +
    uni.format(startDay.getDate()) +
    ' 00:00:01';

uni.atEndOfToday = () =>
    startDay.getFullYear() +
    '-' +
    uni.format(startDay.getMonth() + 1) +
    '-' +
    uni.format(startDay.getDate()) +
    ' 23:59:59';

uni.atStartOfTomorrow = () =>
    endDay.getFullYear() +
    '-' +
    uni.format(endDay.getMonth() + 1) +
    '-' +
    uni.format(endDay.getDate()) +
    ' 00:00:01';

uni.atStartOfCurrentMonth = () =>
    startMonth.getFullYear() +
    '-' +
    uni.format(startMonth.getMonth() + 1) +
    '-01 00:00:01';

uni.atStartOfNextMonth = () =>
    endMonth.getFullYear() +
    '-' +
    uni.format(endMonth.getMonth() + 1) +
    '-01 00:00:01';

uni.atStartOfCurrentYear = () => year.getFullYear() + '-01-01 00:00:01';

uni.atStartOfNextYear = () => year.getFullYear() + 1 + '-01-01 00:00:01';

uni.isAuthenticated = () => {
    const cache = uni.getStorageSync('pengsoft');
    const accessToken = cache.accessToken;
    return (
        accessToken &&
        accessToken.expiredAt &&
        accessToken.expiredAt - new Date().getTime() + 1000 * 60 * 30 > 0
    );
};

uni.getAccessToken = () => {
    const cache = uni.getStorageSync('pengsoft');
    return 'Bearer ' + cache.accessToken.value;
};

uni.getUserDetails = () => {
    const cache = uni.getStorageSync('pengsoft');
    return cache.userDetails;
};

uni.hasAnyRole = (...roles) => {
    const cache = uni.getStorageSync('pengsoft');
    return cache.userDetails.roles.some((role) =>
        roles.some((code) => code === role.code)
    );
};

uni.hasAnyAuthority = (...authorities) => {
    const cache = uni.getStorageSync('pengsoft');
    return cache.userDetails.authorities.some((authority) =>
        authorities.some((code) => code === authority)
    );
};

uni.getDictionaryItem = (code, callback) => {
    uni.request({
        url: '/api/system/dictionary-item/find-all-by-type-code',
        data: {
            code
        },
        success: (res) => {
            if (callback) {
                callback(res.data);
            }
        }
    });
};

uni.upload = (file, locked, zoomed, width, height) => {
    if (zoomed === undefined) {
        zoomed = true;
    }
    if (!width) {
        width = 1200;
    }
    if (!height) {
        height = 1200;
    }
    uni.showLoading();
    return new Promise((resolve, reject) =>
        uni.uploadFile({
            url:
                URL_PREFIX +
                `/api/system/asset/upload?locked=${locked}&${zoomed}&width=${width}&height=${height}`,
            header: {
                Authorization: uni.getAccessToken()
            },
            filePath: file.url,
            name: 'file',
            success: (res) => resolve(res),
            fail: (res) => reject(res),
            complete: () => uni.hideLoading()
        })
    );
};

uni.afterReadFile = async (event, locked, formFileList, fileList) => {
    const res = await uni.upload(event.file, locked);
    if (res.statusCode === 200) {
        const file = JSON.parse(res.data)[0];
        formFileList.push(file);
        if (file.locked) {
            file.accessPath = await uni.download(file);
        }
        fileList.push(uni.convertToFile(file));
    } else {
        uni.failure(res);
    }
};

uni.download = (file, zoomed, width, height) => {
    if (zoomed === undefined) {
        zoomed = false;
    }
    if (!width) {
        width = 1200;
    }
    if (!height) {
        height = 1200;
    }
    return new Promise((resolve) =>
        uni.request({
            url: `/api/system/asset/download?id=${file.id}&zoomed=${zoomed}&width=${width}&height=${height}`,
            success: (res) => resolve(res.data)
        })
    );
};

uni.convertToFile = (file) => {
    return Object.assign({
        id: file.id,
        locked: file.locked,
        url: file.accessPath
    });
};

uni.clearFormModel = (formModel) => {
    if (formModel) {
        for (let key in formModel) {
            if (formModel[key] === null || formModel[key] === undefined) {
                delete formModel[key];
            }
        }
    }
};

uni.listModel = {
    contentText: {
        contentdown: '上拉加载更多',
        contentrefresh: '加载中',
        contentnomore: '没有更多'
    },
    status: 'more',
    pageData: {
        page: 0,
        size: 20
    },
    listData: [],
    filterData: {}
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
                uni.failure(res);
            } else {
                if (success) {
                    success(res);
                }
            }
        };
    },
    fail(args) {
        uni.failure(args);
    },
    complete() {
        uni.hideLoading();
    }
});

uni.failure = (args) => {
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
                        });
                    }
                }
            });
            break;
        case 422:
            for (let key in args.data) {
                for (let error of args.data[key]) {
                    uni.showToast({
                        title: error,
                        icon: 'none'
                    });
                }
            }
            break;
        default:
            if (args.data) {
                if (typeof args.data === 'string') {
                    args.data = JSON.parse(args.data);
                }
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
import Vue from 'vue';
import uView from '@/uni_modules/uview-ui';

Vue.config.productionTip = false;
App.mpType = 'app';
const app = new Vue({
    ...App
});

Vue.use(uView);
// 如此配置即可
// uni.$u.config.unit = 'rpx'
app.$mount();
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue';
export function createApp() {
    const app = createSSRApp(App);
    return {
        app
    };
}
// #endif
