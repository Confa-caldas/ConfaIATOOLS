import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { SidebarData } from "./SlidebarData";
import "./Navbar.css";
import {  MdMenu } from "react-icons/md";
import { Menu, MenuItem } from "@mui/material";
import { MdLogout } from "react-icons/md";
import { Drawer, List, ListItem, ListItemButton,ListItemText, ListItemIcon, IconButton, AppBar, Toolbar, Avatar,Box,Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function Navbar({ children }) {
 const [open, setOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [userPicture, setUserPicture] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const tipov = localStorage.getItem("tipo_vali");
  
    if (tipov === "face") {
      const cc = localStorage.getItem("cclogin");
      setUserName(cc); // Muestra la cédula como nombre de usuario
      const img = localStorage.getItem("imgTake");
      setUserPicture(img); // Muestra la imagen capturada en el login con FaceID
    } else {
      const token = localStorage.getItem("authToken");
      if (token) {
        const decoded = jwtDecode(token);
        setUserName(decoded.name || "Usuario"); // Muestra el nombre del token
        console.log(decoded.picture);
        setUserPicture(decoded.picture);
      }
    }
  }, []);

  const toggleDrawer = () => setOpen(!open);
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = () => {
    localStorage.clear();  // Borra los datos del usuario
    navigate("/");    // Redirige al login
    setTimeout(() => {
      window.location.reload();  // Recarga la página para limpiar el estado
    }, 10);
  };
  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: "#fff", boxShadow: "none", paddingX: 2 }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton edge="start" color="default" onClick={toggleDrawer}>
              <MdMenu size={28} />
            </IconButton>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="subtitle1" color="text.secondary">
              Bienvenido, {userName}
            </Typography>
            {userPicture && (
              <Avatar
              src={userPicture}
              alt={userName}
              sx={{ width: 48, height: 48, boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)', cursor: 'pointer' }}
              onClick={handleMenuOpen}
            />
            )}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{ sx: { mt: 1, boxShadow: 3, borderRadius: 2 } }}
            >
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <MdLogout size={20} />
                </ListItemIcon>
                <ListItemText primary="Cerrar sesión" />
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          "& .MuiDrawer-paper": {
            width: open ? 250 : 80,
            transition: "width 0.3s ease-in-out",
            overflowX: "hidden",
            background: "#fff",
            borderRight: "1px solid #ddd",
            fontFamily: "Inter, sans-serif",
          },
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <List sx={{ height: "100vh", paddingTop: "10px" }}>
          {SidebarData.map((item, index) => (
            <ListItem key={index} disablePadding>
              <ListItemButton component={Link} to={item.path} sx={{ justifyContent: open ? "flex-start" : "center", gap: 2 }}>
                <ListItemIcon sx={{
                  color: "#555",
                  minWidth: 0,
                  justifyContent: "center",
                  display: "flex",
                  alignItems: "center",
                  fontSize: "1.5rem",
                }}>
                  {item.icon}
                </ListItemIcon>
         
                <ListItemText
                  primary={item.title}
                  sx={{
                    opacity: open ? 1 : 0,
                    transition: "opacity 0.3s ease-in-out",
                    whiteSpace: "nowrap",
                    fontSize: "0.875rem", // text-sm
                    lineHeight: "1.25rem", // text-sm line-height
                    letterSpacing: "0", // text-sm letter-spacing
                    fontFamily: "'Inter', sans-serif !important", // Forzar Inter sobre el default de MUI
                    fontWeight: 500, // font-medium
                    color: "rgba(17, 24, 39, 1)", // text-gray-alpha-950 equivalente
                    display: "flex",
                    alignItems: "center", // items-center
                  }}
                />



              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      <div style={{
          marginLeft: open ? 250 : 80,  // Ajusta el margen del contenido principal
          transition: "margin-left 0.3s ease-in-out", // Agrega animación suave
        }}>
          {children}
        </div>
    </>
  );
}
