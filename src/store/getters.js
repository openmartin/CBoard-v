const getters = {
  token: state => state.user.token,
  name: state => state.user.name,
  roles: state => state.user.roles,
  permissions: state => state.user.permissions
}

export default getters
