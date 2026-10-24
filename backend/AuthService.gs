/**
 * HMIS Authentication & RBAC Authorization Service
 */

const AuthService = {
  /**
   * Simple SHA-256 hash with salt
   */
  hashPassword: function(password, salt) {
    const raw = password + salt;
    const signature = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, raw);
    return signature.map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
  },

  /**
   * Generate session token
   */
  generateToken: function(user) {
    const payload = {
      userId: user.id,
      username: user.username,
      roleId: user.role_id,
      deptId: user.department_id,
      fullName: user.full_name,
      exp: new Date().getTime() + (12 * 60 * 60 * 1000) // 12 hours validity
    };
    return Utilities.base64EncodeWebSafe(JSON.stringify(payload));
  },

  /**
   * Validate session token
   */
  verifyToken: function(token) {
    if (!token) return null;
    try {
      const jsonStr = Utilities.newBlob(Utilities.base64DecodeWebSafe(token)).getDataAsString();
      const payload = JSON.parse(jsonStr);
      if (new Date().getTime() > payload.exp) {
        return null; // Expired
      }
      return payload;
    } catch (e) {
      return null;
    }
  },

  /**
   * Authenticate user credentials
   */
  login: function(username, password) {
    const users = DbService.find('users', { username: username });
    if (users.length === 0) {
      return { success: false, message: 'Invalid username or password' };
    }
    const user = users[0];
    if (user.is_active === false || user.is_active === 0 || user.is_active === '0' || user.is_active === 'false') {
      return { success: false, message: 'Account is deactivated' };
    }

    const hashedInput = this.hashPassword(password, user.salt);
    if (hashedInput !== user.password_hash) {
      return { success: false, message: 'Invalid username or password' };
    }

    // Retrieve role permissions
    const roles = DbService.find('roles', { id: user.role_id });
    const role = roles.length > 0 ? roles[0] : { name: 'User', permissions_json: '[]' };

    // Update last login
    DbService.update('users', user.id, { last_login: new Date().toISOString() });

    const token = this.generateToken(user);
    return {
      success: true,
      token: token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        roleId: user.role_id,
        roleName: role.name,
        departmentId: user.department_id,
        permissions: JSON.parse(role.permissions_json || '[]')
      }
    };
  }
};

if (typeof module !== 'undefined') {
  module.exports = { AuthService };
}
