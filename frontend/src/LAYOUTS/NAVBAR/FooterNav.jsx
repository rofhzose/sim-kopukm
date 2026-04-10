import React, { useState, useRef } from "react";
import { NavLink } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Home, FileText, Store, Banknote, Plus, Users } from "lucide-react";

const menuItems = [
  { to: "/overview", label: "Dashboard", icon: Home, color: "bg-blue-500", shadow: "shadow-blue-200" },
  { to: "/sekretariat", label: "Sekretariat", icon: FileText, color: "bg-orange-500", shadow: "shadow-orange-200" },
  { to: "/dashboard", label: "UMKM", icon: Store, color: "bg-indigo-500", shadow: "shadow-indigo-200" },
  { to: "/koperasi", label: "Koperasi", icon: Banknote, color: "bg-emerald-500", shadow: "shadow-emerald-200" },
  { to: "/pengguna", label: "Pengguna", icon: Users, color: "bg-purple-500", shadow: "shadow-purple-200" },
];

export default function FloatingNav() {
  const [isOpen, setIsOpen] = useState(false);
  const constraintsRef = useRef(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);

  const handleDragStart = (event) => {
    const point = event.touches ? event.touches[0] : event;
    dragStartPos.current = { x: point.clientX, y: point.clientY };
    isDragging.current = false;
  };

  const handleDrag = (event) => {
    const point = event.touches ? event.touches[0] : event;
    const dx = Math.abs(point.clientX - dragStartPos.current.x);
    const dy = Math.abs(point.clientY - dragStartPos.current.y);
    if (dx > 5 || dy > 5) {
      isDragging.current = true;
    }
  };

  const handleToggle = () => {
    if (!isDragging.current) {
      setIsOpen((prev) => !prev);
    }
    isDragging.current = false;
  };

  return (
    <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-[9999]">
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/5 backdrop-blur-[2px] pointer-events-auto" />}
      </AnimatePresence>

      {/* Draggable container */}
      <Motion.div
        drag
        dragConstraints={constraintsRef}
        dragElastic={0}
        dragMomentum={false}
        dragTransition={{ power: 0, timeConstant: 0 }}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        className="absolute bottom-8 right-8 pointer-events-auto"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="relative flex flex-col items-end gap-3">
          {/* Menu items */}
          <AnimatePresence>
            {isOpen && (
              <div className="flex flex-col items-end gap-3 mb-2">
                {menuItems.map((item, index) => (
                  <Motion.div
                    key={item.to}
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: 20 }}
                    transition={{ delay: index * 0.05, type: "spring", stiffness: 260, damping: 20 }}
                  >
                    <NavLink
                      to={item.to}
                      onClick={() => setIsOpen(false)}
                      className={({ isActive }) => `
                        flex items-center gap-3 p-2 pr-4 rounded-full 
                        backdrop-blur-xl bg-white/80 border border-white/40 shadow-xl
                        transition-transform active:scale-90
                        ${isActive ? "ring-2 ring-offset-2 ring-slate-200" : ""}
                      `}
                    >
                      <span className="text-[13px] font-semibold text-slate-700 ml-2">{item.label}</span>
                      <div className={`p-2 rounded-full text-white ${item.color} ${item.shadow} shadow-lg`}>
                        <item.icon size={20} strokeWidth={2.5} />
                      </div>
                    </NavLink>
                  </Motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>

          {/* Toggle button */}
          <Motion.button
            onPointerDown={handleDragStart}
            onPointerMove={handleDrag}
            onPointerUp={handleToggle}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            className={`
              w-14 h-14 rounded-full flex items-center justify-center shadow-2xl
              backdrop-blur-xl border border-white/40 transition-colors duration-300
              ${isOpen ? "bg-slate-800 text-white" : "bg-white/90 text-slate-800"}
            `}
            style={{ boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
          >
            <Motion.div animate={{ rotate: isOpen ? 135 : 0 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}>
              <Plus size={28} strokeWidth={2.5} />
            </Motion.div>
          </Motion.button>
        </div>
      </Motion.div>
    </div>
  );
}
