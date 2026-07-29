import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { UserRole, StaffAccount } from '../types';

interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  hotelId: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (role: UserRole) => void;
  loginAs: (staff: StaffAccount) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const DEMO_ACCOUNTS: Record<UserRole, AuthUser> = {
  ceo: { id: 'staff_ceo', fullName: 'Akmal Rakhimov', email: 'ceo@hospitalx.uz', role: 'ceo', hotelId: null },
  super_admin: { id: 'staff_superadmin', fullName: 'Sardor Yusupov', email: 'admin@hospitalx.uz', role: 'super_admin', hotelId: null },
  manager: { id: 'staff_manager', fullName: 'Dilnoza Karimova', email: 'manager@grandhotel.uz', role: 'manager', hotelId: 'p1' },
  receptionist: { id: 'staff_reception', fullName: 'Bekzod Aliyev', email: 'reception@grandhotel.uz', role: 'receptionist', hotelId: 'p1' },
  housekeeping: { id: 'staff_housekeeping', fullName: 'Madina Tosheva', email: 'housekeeping@grandhotel.uz', role: 'housekeeping', hotelId: 'p1' },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = useCallback((role: UserRole) => {
    setUser(DEMO_ACCOUNTS[role]);
  }, []);

  const loginAs = useCallback((staff: StaffAccount) => {
    setUser({
      id: staff.id,
      fullName: staff.fullName,
      email: staff.email,
      role: staff.role,
      hotelId: staff.hotelId,
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, loginAs, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export const ROLE_LABELS: Record<UserRole, { uz: string; ru: string; en: string }> = {
  ceo: { uz: 'Bosh Direktor', ru: 'CEO', en: 'CEO' },
  super_admin: { uz: 'Super Admin', ru: 'Супер Админ', en: 'Super Admin' },
  manager: { uz: 'Mehmonxona Menejeri', ru: 'Менеджер Отеля', en: 'Hotel Manager' },
  receptionist: { uz: 'Adminstrator (Resepshn)', ru: 'Администратор (Ресепшн)', en: 'Receptionist' },
  housekeeping: { uz: 'Hammerlik (Housekeeping)', ru: 'Горничная (Housekeeping)', en: 'Housekeeping' },
};
