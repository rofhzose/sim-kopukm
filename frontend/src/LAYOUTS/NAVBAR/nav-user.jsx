import { useEffect, useState } from "react";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Avatar } from "@heroui/react";
import { getCurrentUser } from "../../services/userService";
import { useNavigate } from "react-router-dom";

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const ProfileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.65 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export default function NavUser() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getCurrentUser();
        console.log("avatar:", response.data.data.avatar); // ← tambah ini
        setUser(response.data.data);
      } catch (error) {
        console.error("Gagal ambil user:", error);
      }
    };
    fetchUser();
  }, []);

  if (!user) {
    return (
      <div className="flex items-center gap-3 px-3 md:px-4 py-2 rounded-xl border border-slate-200 bg-white/60 animate-pulse">
        <div className="hidden md:flex flex-col gap-1.5">
          <div className="h-3 w-24 bg-slate-200 rounded-md" />
          <div className="h-2.5 w-14 bg-slate-100 rounded-md" />
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-200" />
      </div>
    );
  }

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <div className="flex items-center gap-3 px-3 md:px-4 py-2 rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm cursor-pointer hover:bg-sky-50 hover:border-sky-200 transition-all duration-200 shadow-sm">
          {/* Text - Hidden di Mobile */}
          <div className="hidden md:flex flex-col text-left">
            <span className="text-slate-700 text-sm font-semibold capitalize leading-tight">{user.name}</span>
            <span className="text-sky-500 text-xs font-medium flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 inline-block" />
              {user.status || "Active"}
            </span>
          </div>

          {/* Avatar */}
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full border-2 border-slate-200 object-cover" />
          ) : (
            <Avatar name={user.name} showFallback size="sm" className="border-2 border-slate-200 md:w-9 md:h-9" />
          )}
        </div>
      </DropdownTrigger>

      <DropdownMenu
        aria-label="User menu"
        classNames={{
          base: "bg-white border border-slate-200 shadow-lg rounded-xl p-1.5 min-w-[180px]",
        }}
      >
        {/* User info header */}
        <DropdownItem
          key="info"
          isReadOnly
          textValue={user.name}
          classNames={{
            base: "opacity-100 cursor-default px-3 py-2.5 mb-1 border-b border-slate-100 rounded-lg",
          }}
        >
          <div className="flex flex-col">
            <span className="text-slate-800 text-sm font-semibold capitalize">{user.name}</span>
            {/* <span className="text-slate-400 text-xs mt-0.5">{user.role || "—"}</span> */}
          </div>
        </DropdownItem>

        <DropdownItem
          key="profile"
          onPress={() => navigate("/profile")}
          textValue="Profile"
          startContent={<ProfileIcon />}
          classNames={{
            base: "text-slate-600 data-[hover=true]:bg-slate-50 data-[hover=true]:text-slate-800 rounded-lg transition px-3 py-2",
          }}
        >
          <span className="text-sm">Profile</span>
        </DropdownItem>

        <DropdownItem
          key="settings"
          textValue="Settings"
          startContent={<SettingsIcon />}
          classNames={{
            base: "text-slate-600 data-[hover=true]:bg-slate-50 data-[hover=true]:text-slate-800 rounded-lg transition px-3 py-2",
          }}
        >
          <span className="text-sm">Settings</span>
        </DropdownItem>

        <DropdownItem
          key="logout"
          textValue="Log Out"
          onPress={handleLogout}
          startContent={<LogoutIcon />}
          classNames={{
            base: "text-red-500 data-[hover=true]:bg-red-50 data-[hover=true]:text-red-600 rounded-lg transition px-3 py-2 mt-1 border-t border-slate-100",
          }}
        >
          <span className="text-sm font-medium">Log Out</span>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
