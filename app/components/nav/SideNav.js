"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import useTableStore from "../../store/useTableStore";
import useNavigationStore from "../../store/useNavigationStore";
import useAuthStore from "../../store/useAuthStore";
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
import useSidebarStore from "../../store/usesidebarStore";
import { useRouter } from "next/navigation";

const SideNav = () => {
  const { isEditMode, toggleEditMode } = useTableStore();
  const { currentPage, setCurrentPage } = useNavigationStore();
  const { restaurant } = useAuthStore();
  const { isSideBarOpen, sideBartoggle } = useSidebarStore();

  const [activePage, setActivePage] = useState(currentPage);

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
    setActivePage(page);
    setCurrentPage(page);
    router.push(path);
    if (isEditMode) toggleEditMode();
  };

  const menuItems = [
    { label: "주문내역", path: restaurant?.hasTables ? "/admin/order" : "/admin/quick-order" },
    { label: "매출내역", path: "/admin/sales" },
    { label: "결제내역", path: "/admin/payments" },
    { label: "메뉴관리", path: "/admin/edit_menu" },
    { label: "내 정보", path: "/admin/profile" },
    { label: "QR코드 생성", path: "/admin/qr-generate" },
  ];

  return (
    <div
      className={`relative bg-gray-200 text-gray-600 transition-all duration-300 ${
        isSideBarOpen ? "w-64" : "w-16"
      }`}
    >
      {/* 버튼 및 헤더 부분은 변경 없음 */}
      <nav className={`mt-8 ${isSideBarOpen ? "block" : "hidden"}`}>
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.label}>
              <Link
                href={item.path}
                className={`block p-2 rounded ${
                  activePage === item.label ? "bg-blue-600 text-white" : "hover:bg-blue-200"
                }`}
                onClick={() => handleNavClick(item.label, item.path)}
              >
                {item.label}
              </Link>
            </li>
          ))}
          {restaurant?.hasTables && (
            <li>
              <Link
                href="/admin/order"
                className={`block p-2 rounded ${
                  isEditMode ? "bg-red-500 text-white" : "hover:bg-blue-200"
                }`}
                onClick={() => {
                  toggleEditMode();
                  handleNavClick(isEditMode ? "주문내역" : "테이블 위치 변경", "/admin/order");
                }}
              >
                {isEditMode ? "테이블 위치 편집 종료" : "테이블 위치 변경"}
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </div>
  );
};

export default SideNav;
