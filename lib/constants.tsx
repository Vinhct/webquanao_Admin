import {
    LayoutDashboard,
    Shapes,
    ShoppingBag,
    Tag,
    UsersRound,
  } from "lucide-react";
  
  export const navLinks = [
    {
      url: "/",
      icon: <LayoutDashboard />,
      label: "Tổng quan",
    },
    {
      url: "/collections",
      icon: <Shapes />,
      label: "Bộ sưu tập",
    },
    {
      url: "/products",
      icon: <Tag />,
      label: "Sản phẩm",
    },
    {
      url: "/orders",
      icon: <ShoppingBag />,
      label: "Đơn hàng",
    },
    {
      url: "/customers",
      icon: <UsersRound />,
      label: "Khách hàng",
    },
  ];