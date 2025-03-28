import React from "react";
import { IoSettingsOutline,  IoChatbubbleEllipses } from "react-icons/io5";
import { FaRobot, FaMicrophone, FaHeadphones, FaCog, FaSignInAlt, FaUserPlus } from "react-icons/fa";
import { MdOutlineKeyboardVoice } from "react-icons/md";  // Micrófono con borde moderno

export const SidebarData = [
  { 
    title: "Confa-IA-Tools", 
    icon: <img src="/logoIA.webp" alt="ConfIA Logo" width="40" height="40" style={{ borderRadius: '50%' }} />, 
    isAppTitle: true 
  },
  { title: "Confa-Talk", path: "/AsistenteIAConftalk",  icon: <MdOutlineKeyboardVoice />, category: "Main" },
];
