"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import useTableStore from "../../store/useTableStore";
import useNavigationStore from "../../store/useNavigationStore";
import useAuthStore from "../../store/useAuthStore";
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  Home,
  DollarSign,
  CreditCard,
  BookOpen,
  User,
  QrCode,
  Edit,
} from "lucide-react";
import useSidebarStore from "../../store/usesidebarStore";
import { useRouter } from "next/navigation";

const SideNav = () => {
  const { isEditMode, toggleEditMode } = useTableStore();
  const { currentPage, setCurrentPage } = useNavigationStore();
  const { restaurant } = useAuthStore();
  const { isSideBarOpen, sideBartoggle } = useSidebarStore();

  const [activePage, setActivePage] = useState("/admin");
  const router = useRouter();

  useEffect(() => {
    if (!restaurant) {
      router.push("/auth/login");
      return;
    }
  }, [restaurant, router]);

  useEffect(() => {
    setActivePage(currentPage);
  }, [currentPage]);

  const handleNavClick = (page, path) => {
    if (isEditMode) {
      toggleEditMode(); // 편집 모드 종료
    }
    setActivePage(page);
    setCurrentPage(page);
    router.push(path);
  };

  const handleEditModeToggle = () => {
    toggleEditMode();
    if (!isEditMode) {
      // 편집 모드로 전환될 때
      setActivePage("주문내역");
      setCurrentPage("주문내역");
      router.push("/admin/order");
    } else {
      // 편집 모드가 종료될 때
      setActivePage("주문내역");
      setCurrentPage("주문내역");
      router.push("/admin/order");
    }
  };

  const menuItems = [
    {
      label: "주문내역",
      path: restaurant?.hasTables ? "/admin/order" : "/admin/quick-order",
      icon: Home,
    },
    { label: "매출내역", path: "/admin/sales", icon: DollarSign },
    { label: "결제내역", path: "/admin/payments", icon: CreditCard },
    { label: "메뉴관리", path: "/admin/edit_menu", icon: BookOpen },
    { label: "내 정보", path: "/admin/profile", icon: User },
    { label: "QR코드 생성", path: "/admin/qr-generate", icon: QrCode },
  ];

  // 테이블 위치 변경 메뉴 항목 추가
  if (restaurant?.hasTables) {
    menuItems.push({
      label: "테이블 위치 변경",
      path: "/admin/order",
      icon: Edit,
    });
  }

  return (
    <div
      className={`relative bg-gray-200 text-gray-600 transition-all duration-300 ${
        isSideBarOpen ? "w-64" : "w-16"
      }`}
    >
      <button
        onClick={sideBartoggle}
        className="absolute top-1/2 -right-3 transform -translate-y-1/2 bg-gray-300 rounded-full p-1 shadow-md"
      >
        {isSideBarOpen ? (
          <ChevronLeft size={20} className="text-gray-600" />
        ) : (
          <ChevronRight size={20} className="text-gray-600" />
        )}
      </button>
      <div className="p-2 h-12 flex items-center border-b border-gray-300">
        {isSideBarOpen ? (
          <div className="flex justify-around">
            <Menu size={24} className="text-gray-600 mx-auto " />
            <Link
              href={"/admin"}
              onClick={() => {
                setActivePage("/admin");
              }}
              className=""
            >
              <h1
                className="text-xl font-bold truncate"
                onClick={() => {
                  router.push("/");
                }}
              >
                {restaurant?.businessName || "레스토랑"}
              </h1>
            </Link>
          </div>
        ) : (
          <Menu size={24} className="text-gray-600 mx-auto" />
        )}
      </div>
      <nav className={`mt-4 ${isSideBarOpen ? "px-4" : "px-2"}`}>
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.label}>
              <Link
                href={item.path}
                className={`flex items-center p-2 rounded ${
                  activePage === item.label || (isEditMode && item.label === "테이블 위치 변경")
                    ? "bg-blue-600 text-white"
                    : "hover:bg-blue-200"
                } ${
                  item.label === "테이블 위치 변경" && isEditMode ? "bg-red-500 text-white" : ""
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  if (item.label === "테이블 위치 변경") {
                    handleEditModeToggle();
                  } else {
                    handleNavClick(item.label, item.path);
                  }
                }}
              >
                <item.icon size={20} className={isSideBarOpen ? "mr-2" : "mx-auto"} />
                {isSideBarOpen && (
                  <span>
                    {item.label === "테이블 위치 변경" && isEditMode
                      ? "테이블 위치 편집 종료"
                      : item.label}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default SideNav;
