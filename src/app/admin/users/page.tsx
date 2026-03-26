'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Icon from '@/components/ui/AppIcon';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'super_admin' | 'admin' | 'moderator' | 'user';
  is_admin: boolean;
  created_at: string;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface RolePermission {
  role: string;
  permissions: string[];
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, permsRes, rolePermsRes] = await Promise.all([
        supabase.from('user_profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('permissions').select('*').order('category'),
        supabase.from('role_permissions').select('role, permission_id')
      ]);

      if (usersRes.error) throw usersRes.error;
      if (permsRes.error) throw permsRes.error;
      if (rolePermsRes.error) throw rolePermsRes.error;

      setUsers(usersRes.data || []);
      setPermissions(permsRes.data || []);

      // Group permissions by role
      const grouped: { [key: string]: string[] } = {};
      rolePermsRes.data?.forEach((rp: any) => {
        if (!grouped[rp.role]) grouped[rp.role] = [];
        grouped[rp.role].push(rp.permission_id);
      });

      setRolePermissions(
        Object.entries(grouped).map(([role, perms]) => ({
          role,
          permissions: perms
        }))
      );
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          role: newRole,
          is_admin: ['super_admin', 'admin', 'moderator'].includes(newRole)
        })
        .eq('id', userId);

      if (error) throw error;
      fetchData();
      setShowRoleModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Failed to update user role');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'moderator': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRolePermissions = (role: string) => {
    const rolePerms = rolePermissions.find(rp => rp.role === role);
    if (!rolePerms) return [];
    return permissions.filter(p => rolePerms.permissions.includes(p.id));
  };

  const groupPermissionsByCategory = (perms: Permission[]) => {
    const grouped: { [key: string]: Permission[] } = {};
    perms.forEach(p => {
      if (!grouped[p.category]) grouped[p.category] = [];
      grouped[p.category].push(p);
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-serif font-bold">User Management</h1>
        <p className="text-muted-foreground mt-2">Manage user roles and permissions</p>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                  Admin Access
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Icon name="UserIcon" className="w-5 h-5 text-primary" />
                      </div>
                      <span className="font-medium text-gray-900">{user.full_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getRoleBadgeColor(user.role)}`}>
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.is_admin ? (
                      <Icon name="CheckCircleIcon" className="w-5 h-5 text-green-500" />
                    ) : (
                      <Icon name="XCircleIcon" className="w-5 h-5 text-gray-300" />
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setSelectedRole(user.role);
                        setShowRoleModal(true);
                      }}
                      className="text-primary hover:text-primary/80 font-medium text-sm"
                    >
                      Change Role
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Permissions Overview */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-serif font-bold">Role Permissions</h2>
          <button
            onClick={() => setShowPermissionsModal(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            View All Permissions
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['super_admin', 'admin', 'moderator'].map((role) => {
            const perms = getRolePermissions(role);
            return (
              <div key={role} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold capitalize">{role.replace('_', ' ')}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(role)}`}>
                    {perms.length} permissions
                  </span>
                </div>
                <ul className="space-y-2">
                  {perms.slice(0, 5).map((perm) => (
                    <li key={perm.id} className="flex items-start space-x-2">
                      <Icon name="CheckIcon" className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{perm.description}</span>
                    </li>
                  ))}
                  {perms.length > 5 && (
                    <li className="text-sm text-muted-foreground italic">+ {perms.length - 5} more</li>
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Change Role Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Change User Role</h3>
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedUser(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <Icon name="XMarkIcon" className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">User</p>
                <p className="font-medium">{selectedUser.full_name}</p>
                <p className="text-sm text-gray-600">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Current Role</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${getRoleBadgeColor(selectedUser.role)}`}>
                  {selectedUser.role.replace('_', ' ')}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">New Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="user">User</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowRoleModal(false);
                    setSelectedUser(null);
                    setSelectedRole('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateUserRole(selectedUser.id, selectedRole || selectedUser.role)}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Update Role
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Permissions Modal */}
      {showPermissionsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold">All Permissions</h3>
              <button
                onClick={() => setShowPermissionsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Icon name="XMarkIcon" className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
              {Object.entries(groupPermissionsByCategory(permissions)).map(([category, perms]) => (
                <div key={category} className="mb-6 last:mb-0">
                  <h4 className="text-lg font-bold capitalize mb-3 text-primary">{category}</h4>
                  <div className="space-y-2">
                    {perms.map((perm) => (
                      <div key={perm.id} className="bg-gray-50 rounded-lg p-4">
                        <p className="font-medium text-gray-900">{perm.name.replace('_', ' ')}</p>
                        <p className="text-sm text-gray-600 mt-1">{perm.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}