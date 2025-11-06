import jwt from "jsonwebtoken";

/**
 * 🛡️ Middleware untuk verifikasi JWT token
 */
export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "Token tidak ditemukan" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: "Token tidak valid atau sudah kadaluarsa",
    });
  }
};

/**
 * 👤 Middleware pembatasan role (hanya role tertentu yang bisa akses)
 * Contoh penggunaan:
 *   app.get("/admin", verifyToken, roleAccess("admin", "super_admin"), handler)
 */
export const roleAccess = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res
        .status(401)
        .json({ success: false, message: "User belum login" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak, role tidak diizinkan",
      });
    }

    next();
  };
};

/**
 * 🎯 Shortcut middleware khusus role
 */
export const isUser = roleAccess("user", "admin", "sekdin", "kadin", "super_admin");
export const isAdmin = roleAccess("admin", "super_admin");
export const isSekdin = roleAccess("sekdin", "super_admin");
export const isKadin = roleAccess("kadin", "super_admin");
export const isSuperAdmin = roleAccess("super_admin");
