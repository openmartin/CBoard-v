import axios from 'axios';
import qs from 'qs';
import { Notification, MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'
import errorCode from '@/utils/errorCode'

// 创建axios实例
const service = axios.create({
    baseURL: process.env.VUE_APP_BASE_API,
    timeout: 60000
})

service.interceptors.request.use(config => {
    const isToken = (config.headers || {}).isToken === false
    if (getToken() && !isToken) {
        config.headers['Authorization'] = 'Bearer ' + getToken()
    }
    return config
}, error => {
    console.log(error)
    Promise.reject(error)
})

service.interceptors.response.use(res => {
    const code = res.data.code || 200
    const message = errorCode[code] || res.data.msg || errorCode['default']
    if (code === 401) {
        MessageBox.confirm(
            '登录状态已过期，您可以继续留在该页面，或者重新登录',
            '系统登录',
            {
                confirmButtonText: '重新登录',
                cancelButtonText: '取消',
                type: 'warning'
            }
        ).then(() => {
            store.dispatch('Logout').then(() => {
                location.reload()
            })
        })
    } else if (code === 500) {
        Message({
            message: message,
            type: 'error'
        })
        return Promise.reject(new Error(message))
    } else if (code != 200) {
        Notification.error({
            title: message
        })
        return Promise.reject('error')
    } else {
        return res
    }
}, error => {
    console.log('err ' + error)
    Message({
        message: error.message,
        type: 'error',
        duration: 5 * 1000
    })
    return Promise.reject(error)
})

//axiosPost.defaults.withCredentials = true;

/*axiosPost.defaults.withCredentials = true;

axiosPost.interceptors.response.use(function (response) {

	return response;
}, function (err) {

    if (err && err.response) {
        switch (err.response.status) {
        	case 302: 
        		     alert(11111);
        		     break;
            case 400: err.message = '请求错误(400)' ; break;
            case 401: err.message = '未授权，请重新登录(401)'; break;
            case 403: err.message = '拒绝访问(403)'; break;
            case 404: err.message = '请求出错(404)'; break;
            case 408: err.message = '请求超时(408)'; break;
            case 500: err.message = '服务器错误(500)'; break;
            case 501: err.message = '服务未实现(501)'; break;
            case 502: err.message = '网络错误(502)'; break;
            case 503: err.message = '服务不可用(503)'; break;
            case 504: err.message = '网络超时(504)'; break;
            case 505: err.message = 'HTTP版本不受支持(505)'; break;
            default: err.message = `连接出错(${err.response.status})!`;
        }
    }else{
        err.message = '连接服务器失败!'
    }
    message.error(err.message);
    return Promise.reject(err);
});*/

let sourceCollection = [];

const req = {
    get(url) {
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();
        sourceCollection.push(source);
        return service.get(url, { cancelToken: source.token });
    },

    post(url, params, isJson) {
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();
        sourceCollection.push(source);
        if (isJson) {
            return service.post(url, params, { cancelToken: source.token });
        } else {
            return service.post(url, null, { params: params }, { cancelToken: source.token });
        }
    },

    abort() {
        for (let i = 0, l = sourceCollection.length; i < l; i++) {
            sourceCollection[i].cancel('shit');
        }
        sourceCollection = [];
    }

}

export default req;