import req from '@/utils/http/request'

export function login(username, password) {
	const data = {
		username,
		password
	}
	return req.post(
		'/login',
		data,
		true
	)
}


export function logout() {
	return req.get(
		'/logout',
	)
}

// 获取用户详细信息
export function getInfo() {
	return req.get(
		'/getInfo'
	)
}


